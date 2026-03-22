package binary

import (
	"context"
	"sync"
)

// State represents the lifecycle state of the managed binary.
type State string

const (
	StateIdle        State = "idle"
	StateDownloading State = "downloading"
	StateReady       State = "ready"
	StateError       State = "error"
)

// Status is a snapshot of the manager's current state.
type Status struct {
	State   State
	Version string
	Message string
}

// Manager handles downloading, verifying and locating the immich-go binary.
type Manager struct {
	mu         sync.RWMutex
	state      State
	version    string
	message    string
	BinaryPath string
}

// NewManager creates a Manager. binaryPath is where the binary should live;
// leave empty to use the platform default (~/.immich-go-ui/immich-go[.exe]).
func NewManager(binaryPath string) *Manager {
	return &Manager{
		state:      StateIdle,
		BinaryPath: binaryPath,
	}
}

// Status returns a snapshot of the current manager state.
func (m *Manager) Status() Status {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return Status{State: m.state, Version: m.version, Message: m.message}
}

// EnsureReady checks for the binary and downloads it if missing.
// This is meant to be called once at server startup (in a goroutine so the
// HTTP server can start immediately and report status while downloading).
func (m *Manager) EnsureReady(ctx context.Context) error {
	m.setState(StateDownloading, "", "Checking for immich-go binary…")

	path, err := resolveBinaryPath(m.BinaryPath)
	if err != nil {
		m.setState(StateError, "", "Cannot determine binary path: "+err.Error())
		return err
	}
	m.mu.Lock()
	m.BinaryPath = path
	m.mu.Unlock()

	if !binaryExists(path) {
		m.setState(StateDownloading, "", "Downloading immich-go…")
		version, err := downloadLatest(ctx, path)
		if err != nil {
			m.setState(StateError, "", "Download failed: "+err.Error())
			return err
		}
		m.setState(StateReady, version, "")
		return nil
	}

	version, err := readVersion(path)
	if err != nil {
		version = "unknown"
	}
	m.setState(StateReady, version, "")
	return nil
}

func (m *Manager) setState(state State, version, message string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.state = state
	m.version = version
	m.message = message
}
