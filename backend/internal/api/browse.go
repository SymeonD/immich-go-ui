package api

import (
	"net/http"
	"strings"

	"github.com/SymeonD/immich-go-ui/backend/internal/browse"
)

// HandleBrowse handles GET /api/browse
// Query params:
//   - type: "folder" (default) or "file" (zip file picker, multi-select)
//   - start: optional initial path
//
// Response:
//   - { "paths": ["..."] }  — always an array; empty if user cancelled
func (h *Handler) HandleBrowse(w http.ResponseWriter, r *http.Request) {
	start := r.URL.Query().Get("start")
	browseType := r.URL.Query().Get("type")

	if browseType == "file" {
		paths, err := browse.PickFiles(start)
		if err != nil {
			// Cancelled or unavailable — return empty, not an HTTP error
			writeJSON(w, http.StatusOK, map[string][]string{"paths": {}})
			return
		}
		writeJSON(w, http.StatusOK, map[string][]string{"paths": paths})
		return
	}

	// Default: folder picker
	path, err := browse.PickFolder(start)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string][]string{"paths": {}})
		return
	}
	_ = strings.TrimSpace(path) // used below
	writeJSON(w, http.StatusOK, map[string][]string{"paths": {path}})
}
