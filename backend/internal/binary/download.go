package binary

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const githubReleasesAPI = "https://api.github.com/repos/simulot/immich-go/releases/latest"

type githubRelease struct {
	TagName string        `json:"tag_name"`
	Assets  []githubAsset `json:"assets"`
}

type githubAsset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
}

// resolveBinaryPath returns the absolute path where the binary should live.
func resolveBinaryPath(configured string) (string, error) {
	if configured != "" {
		return configured, nil
	}
	dir, err := defaultDir()
	if err != nil {
		return "", err
	}
	name := "immich-go"
	if runtime.GOOS == "windows" {
		name = "immich-go.exe"
	}
	return filepath.Join(dir, name), nil
}

func defaultDir() (string, error) {
	if runtime.GOOS == "windows" {
		appData := os.Getenv("APPDATA")
		if appData == "" {
			home, err := os.UserHomeDir()
			if err != nil {
				return "", err
			}
			appData = home
		}
		return filepath.Join(appData, "immich-go-ui"), nil
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".immich-go-ui"), nil
}

func binaryExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

// readVersion runs the binary with --version and returns the output.
func readVersion(path string) (string, error) {
	out, err := exec.Command(path, "version").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

// downloadLatest fetches the latest release from GitHub, picks the right asset,
// downloads and extracts the binary to destPath.
func downloadLatest(ctx context.Context, destPath string) (string, error) {
	rel, err := fetchLatestRelease(ctx)
	if err != nil {
		return "", fmt.Errorf("fetch release info: %w", err)
	}

	assetURL, assetName, err := selectAsset(rel.Assets)
	if err != nil {
		return "", fmt.Errorf("select asset: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(destPath), 0o755); err != nil {
		return "", fmt.Errorf("create dir: %w", err)
	}

	tmpFile, err := os.CreateTemp("", "immich-go-download-*")
	if err != nil {
		return "", fmt.Errorf("temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	if err := downloadFile(ctx, assetURL, tmpFile); err != nil {
		tmpFile.Close()
		return "", fmt.Errorf("download: %w", err)
	}
	tmpFile.Close()

	if err := extractBinary(tmpPath, assetName, destPath); err != nil {
		return "", fmt.Errorf("extract: %w", err)
	}

	return rel.TagName, nil
}

func fetchLatestRelease(ctx context.Context) (*githubRelease, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, githubReleasesAPI, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "immich-go-ui")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned %d", resp.StatusCode)
	}

	var rel githubRelease
	if err := json.NewDecoder(resp.Body).Decode(&rel); err != nil {
		return nil, err
	}
	return &rel, nil
}

// selectAsset picks the release asset matching the current OS and architecture.
func selectAsset(assets []githubAsset) (url, name string, err error) {
	goos := runtime.GOOS
	goarch := runtime.GOARCH

	// Map Go arch names to the names used in immich-go release filenames.
	archMap := map[string]string{
		"amd64": "x86_64",
		"arm64": "arm64",
		"arm":   "armv6",
	}
	osMap := map[string]string{
		"linux":   "Linux",
		"darwin":  "Darwin",
		"windows": "Windows",
	}

	archStr, ok := archMap[goarch]
	if !ok {
		return "", "", fmt.Errorf("unsupported architecture: %s", goarch)
	}
	osStr, ok := osMap[goos]
	if !ok {
		return "", "", fmt.Errorf("unsupported OS: %s", goos)
	}

	ext := ".tar.gz"
	if goos == "windows" {
		ext = ".zip"
	}

	for _, a := range assets {
		if strings.Contains(a.Name, osStr) &&
			strings.Contains(a.Name, archStr) &&
			strings.HasSuffix(a.Name, ext) {
			return a.BrowserDownloadURL, a.Name, nil
		}
	}
	return "", "", fmt.Errorf("no asset found for %s/%s", osStr, archStr)
}

func downloadFile(ctx context.Context, url string, dest *os.File) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "immich-go-ui")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	_, err = io.Copy(dest, resp.Body)
	return err
}

// extractBinary extracts the immich-go binary from the downloaded archive to destPath.
func extractBinary(archivePath, assetName, destPath string) error {
	binaryName := "immich-go"
	if runtime.GOOS == "windows" {
		binaryName = "immich-go.exe"
	}

	if strings.HasSuffix(assetName, ".zip") {
		return extractFromZip(archivePath, binaryName, destPath)
	}
	return extractFromTarGz(archivePath, binaryName, destPath)
}

func extractFromTarGz(archivePath, binaryName, destPath string) error {
	f, err := os.Open(archivePath)
	if err != nil {
		return err
	}
	defer f.Close()

	gz, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	defer gz.Close()

	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if filepath.Base(hdr.Name) == binaryName {
			return writeExecutable(tr, destPath)
		}
	}
	return fmt.Errorf("binary %q not found in archive", binaryName)
}

func extractFromZip(archivePath, binaryName, destPath string) error {
	r, err := zip.OpenReader(archivePath)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		if filepath.Base(f.Name) == binaryName {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			defer rc.Close()
			return writeExecutable(rc, destPath)
		}
	}
	return fmt.Errorf("binary %q not found in zip", binaryName)
}

func writeExecutable(r io.Reader, destPath string) error {
	out, err := os.OpenFile(destPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o755)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, r)
	return err
}
