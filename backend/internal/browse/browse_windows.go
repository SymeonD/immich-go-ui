//go:build windows

package browse

import (
	"fmt"
	"os/exec"
	"strings"
)

// PickFolder opens a native Windows folder-picker dialog and returns the
// selected path. startDir is the initial directory (may be empty).
func PickFolder(startDir string) (string, error) {
	startSnippet := ""
	if startDir != "" {
		safe := strings.ReplaceAll(startDir, `'`, `''`)
		startSnippet = fmt.Sprintf("$dlg.SelectedPath = '%s'", safe)
	}
	script := fmt.Sprintf(`
Add-Type -AssemblyName System.Windows.Forms
$owner = New-Object System.Windows.Forms.Form
$owner.TopMost = $true
$owner.ShowInTaskbar = $false
$owner.Opacity = 0
$owner.Show()
$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
$dlg.Description = 'Select folder'
$dlg.ShowNewFolderButton = $true
%s
$result = $dlg.ShowDialog($owner)
$owner.Dispose()
if ($result -eq 'OK') { Write-Output $dlg.SelectedPath }
`, startSnippet)
	return runPS(script)
}

// PickFiles opens a native Windows file-picker dialog allowing multiple ZIP
// file selection. Returns paths joined by newline.
func PickFiles(startDir string) ([]string, error) {
	startSnippet := ""
	if startDir != "" {
		safe := strings.ReplaceAll(startDir, `'`, `''`)
		startSnippet = fmt.Sprintf("$dlg.InitialDirectory = '%s'", safe)
	}
	script := fmt.Sprintf(`
Add-Type -AssemblyName System.Windows.Forms
$owner = New-Object System.Windows.Forms.Form
$owner.TopMost = $true
$owner.ShowInTaskbar = $false
$owner.Opacity = 0
$owner.Show()
$dlg = New-Object System.Windows.Forms.OpenFileDialog
$dlg.Title = 'Select ZIP file(s)'
$dlg.Filter = 'ZIP archives (*.zip)|*.zip|All files (*.*)|*.*'
$dlg.Multiselect = $true
%s
$result = $dlg.ShowDialog($owner)
$owner.Dispose()
if ($result -eq 'OK') { $dlg.FileNames -join [char]10 }
`, startSnippet)
	out, err := runPS(script)
	if err != nil {
		return nil, err
	}
	var paths []string
	for _, p := range strings.Split(out, "\n") {
		if t := strings.TrimSpace(p); t != "" {
			paths = append(paths, t)
		}
	}
	if len(paths) == 0 {
		return nil, fmt.Errorf("cancelled")
	}
	return paths, nil
}

func runPS(script string) (string, error) {
	out, err := exec.Command("powershell", "-NoProfile", "-Command", script).Output()
	if err != nil {
		return "", err
	}
	result := strings.TrimSpace(string(out))
	if result == "" {
		return "", fmt.Errorf("cancelled")
	}
	return result, nil
}
