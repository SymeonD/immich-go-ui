//go:build !windows

package binary

import (
	"os/exec"
	"syscall"
)

// setSysProcAttr configures the command to run in its own process group so
// that Cancel() can kill all child processes, not just the top-level binary.
func setSysProcAttr(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}
