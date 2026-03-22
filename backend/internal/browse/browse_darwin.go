//go:build darwin

package browse

import (
	"fmt"
	"os/exec"
	"strings"
)

func PickFiles(startDir string) ([]string, error) {
	script := `choose file of type {"zip"} with prompt "Select ZIP file(s)" with multiple selections allowed`
	out, err := exec.Command("osascript", "-e", script).Output()
	if err != nil {
		return nil, err
	}
	// osascript returns comma-separated alias list
	raw := strings.TrimSpace(string(out))
	var paths []string
	for _, alias := range strings.Split(raw, ", ") {
		alias = strings.TrimSpace(alias)
		if alias == "" {
			continue
		}
		posix, err := exec.Command("osascript", "-e", fmt.Sprintf(`POSIX path of ("%s")`, alias)).Output()
		if err == nil {
			paths = append(paths, strings.TrimRight(strings.TrimSpace(string(posix)), "/"))
		}
	}
	if len(paths) == 0 {
		return nil, fmt.Errorf("cancelled")
	}
	return paths, nil
}

func PickFolder(startDir string) (string, error) {
	script := `choose folder with prompt "Select folder"`
	if startDir != "" {
		script = fmt.Sprintf(`choose folder with prompt "Select folder" default location POSIX file "%s"`, startDir)
	}
	out, err := exec.Command("osascript", "-e", script).Output()
	if err != nil {
		return "", err
	}
	// osascript returns "alias MacHD:Users:name:..." — convert to POSIX
	raw := strings.TrimSpace(string(out))
	posix, err := exec.Command("osascript", "-e", fmt.Sprintf(`POSIX path of ("%s")`, raw)).Output()
	if err != nil {
		return "", err
	}
	return strings.TrimRight(strings.TrimSpace(string(posix)), "/"), nil
}
