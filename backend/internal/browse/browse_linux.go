//go:build linux

package browse

import (
	"fmt"
	"os/exec"
	"strings"
)

func PickFiles(startDir string) ([]string, error) {
	args := []string{"--file-selection", "--title=Select ZIP file(s)", "--file-filter=ZIP files | *.zip", "--multiple", "--separator=\n"}
	if startDir != "" {
		args = append(args, "--filename="+startDir)
	}
	if out, err := runDialog("zenity", args...); err == nil {
		var paths []string
		for _, p := range strings.Split(out, "\n") {
			if t := strings.TrimSpace(p); t != "" {
				paths = append(paths, t)
			}
		}
		return paths, nil
	}
	// kdialog fallback (single file only)
	kargs := []string{"--getopenfilename", "", "*.zip"}
	if out, err := runDialog("kdialog", kargs...); err == nil {
		return []string{strings.TrimSpace(out)}, nil
	}
	return nil, fmt.Errorf("no dialog tool found (install zenity or kdialog)")
}

func PickFolder(startDir string) (string, error) {
	// Try zenity first (GNOME), fall back to kdialog (KDE).
	args := []string{"--file-selection", "--directory", "--title=Select folder"}
	if startDir != "" {
		args = append(args, "--filename="+startDir)
	}

	if path, err := runDialog("zenity", args...); err == nil {
		return path, nil
	}

	kargs := []string{"--getexistingdirectory"}
	if startDir != "" {
		kargs = append(kargs, startDir)
	}
	if path, err := runDialog("kdialog", kargs...); err == nil {
		return path, nil
	}

	return "", fmt.Errorf("no dialog tool found (install zenity or kdialog)")
}

func runDialog(cmd string, args ...string) (string, error) {
	out, err := exec.Command(cmd, args...).Output()
	if err != nil {
		return "", err
	}
	path := strings.TrimSpace(string(out))
	if path == "" {
		return "", fmt.Errorf("cancelled")
	}
	return path, nil
}
