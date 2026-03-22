package binary

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net/http"
	"os/exec"
	"sync"
	"time"

	"github.com/SymeonD/immich-go-ui/backend/internal/stream"
)

// session holds state for a single execution run.
type session struct {
	args   []string
	cancel context.CancelFunc
}

// Runner manages a single immich-go execution session at a time.
type Runner struct {
	manager *Manager

	mu      sync.Mutex
	pending map[string]*session // token → pending session (not yet streaming)
	active  *session            // currently streaming session
}

// NewRunner creates a Runner backed by the given Manager.
func NewRunner(m *Manager) *Runner {
	return &Runner{
		manager: m,
		pending: make(map[string]*session),
	}
}

// Prepare stores the args for a future stream and returns a short-lived token.
func (r *Runner) Prepare(args []string) string {
	token := fmt.Sprintf("%d", time.Now().UnixNano())
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	_ = ctx // context is created when Stream is called
	cancel() // release the timeout ctx; actual ctx created in Stream

	r.mu.Lock()
	r.pending[token] = &session{args: args}
	r.mu.Unlock()

	// Clean up stale tokens after 60 seconds.
	go func() {
		time.Sleep(60 * time.Second)
		r.mu.Lock()
		delete(r.pending, token)
		r.mu.Unlock()
	}()

	return token
}

// Stream starts executing the command associated with token and streams SSE
// events to w until the process exits or the client disconnects.
func (r *Runner) Stream(w http.ResponseWriter, req *http.Request, token string) {
	r.mu.Lock()
	s, ok := r.pending[token]
	if !ok {
		r.mu.Unlock()
		http.Error(w, "invalid or expired token", http.StatusBadRequest)
		return
	}
	delete(r.pending, token)
	r.mu.Unlock()

	sse := stream.NewWriter(w)
	if sse == nil {
		http.Error(w, "streaming not supported", http.StatusInternalServerError)
		return
	}

	status := r.manager.Status()
	if status.State != StateReady {
		_ = sse.Send("error", map[string]string{"message": "binary not ready: " + status.Message})
		return
	}

	ctx, cancel := context.WithCancel(req.Context())
	defer cancel()

	activeSession := &session{args: s.args, cancel: cancel}
	r.mu.Lock()
	r.active = activeSession
	r.mu.Unlock()
	defer func() {
		r.mu.Lock()
		r.active = nil
		r.mu.Unlock()
	}()

	cmd := exec.CommandContext(ctx, r.manager.BinaryPath, s.args...)
	setSysProcAttr(cmd) // platform-specific: set process group

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		_ = sse.Send("error", map[string]string{"message": "stdout pipe: " + err.Error()})
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		_ = sse.Send("error", map[string]string{"message": "stderr pipe: " + err.Error()})
		return
	}

	startedAt := time.Now()
	if err := cmd.Start(); err != nil {
		_ = sse.Send("error", map[string]string{"message": "start: " + err.Error()})
		return
	}

	// Read stdout and stderr concurrently, merge into SSE log events.
	var wg sync.WaitGroup
	emit := func(r io.Reader) {
		defer wg.Done()
		sc := bufio.NewScanner(r)
		for sc.Scan() {
			line := sc.Text()
			_ = sse.Send("log", map[string]string{
				"line": line,
				"ts":   time.Now().UTC().Format(time.RFC3339),
			})
		}
	}

	wg.Add(2)
	go emit(stdout)
	go emit(stderr)

	// Keepalive comments every 15 s to prevent proxy timeouts.
	done := make(chan struct{})
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				sse.Comment("keepalive")
			}
		}
	}()

	wg.Wait()
	close(done)

	exitCode := 0
	if err := cmd.Wait(); err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			exitCode = ee.ExitCode()
		}
	}

	duration := time.Since(startedAt).Round(time.Second).String()
	_ = sse.Send("done", map[string]any{
		"exitCode": exitCode,
		"duration": duration,
	})
}

// Cancel terminates the active session if any.
func (r *Runner) Cancel() {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.active != nil && r.active.cancel != nil {
		r.active.cancel()
	}
}
