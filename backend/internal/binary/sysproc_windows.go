//go:build windows

package binary

import "os/exec"

// setSysProcAttr is a no-op on Windows; process group handling differs.
func setSysProcAttr(cmd *exec.Cmd) {}
