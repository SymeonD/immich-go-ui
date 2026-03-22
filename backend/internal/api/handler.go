package api

import (
	"encoding/json"
	"net/http"

	"github.com/SymeonD/immich-go-ui/backend/internal/binary"
)

type Handler struct {
	Manager *binary.Manager
	Runner  *binary.Runner
}

// statusResponse is returned by GET /api/status.
type statusResponse struct {
	Status  string `json:"status"`
	Version string `json:"version,omitempty"`
	Message string `json:"message,omitempty"`
}

// prepareRequest is the body of POST /api/execute/prepare.
type prepareRequest struct {
	Args []string `json:"args"`
}

// prepareResponse is returned by POST /api/execute/prepare.
type prepareResponse struct {
	Token string `json:"token"`
}

func (h *Handler) HandleStatus(w http.ResponseWriter, r *http.Request) {
	s := h.Manager.Status()
	writeJSON(w, http.StatusOK, statusResponse{
		Status:  string(s.State),
		Version: s.Version,
		Message: s.Message,
	})
}

func (h *Handler) HandlePrepare(w http.ResponseWriter, r *http.Request) {
	var req prepareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if len(req.Args) == 0 {
		http.Error(w, "args required", http.StatusBadRequest)
		return
	}
	token := h.Runner.Prepare(req.Args)
	writeJSON(w, http.StatusOK, prepareResponse{Token: token})
}

func (h *Handler) HandleStream(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "token required", http.StatusBadRequest)
		return
	}
	h.Runner.Stream(w, r, token)
}

func (h *Handler) HandleCancel(w http.ResponseWriter, r *http.Request) {
	h.Runner.Cancel()
	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}
