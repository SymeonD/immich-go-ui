package api

import (
	"io/fs"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// NewRouter builds and returns the Chi router.
// webFS is the embedded Angular build (served at /).
func NewRouter(h *Handler, webFS fs.FS) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// API routes
	r.Get("/api/status", h.HandleStatus)
	r.Get("/api/browse", h.HandleBrowse)
	r.Post("/api/execute/prepare", h.HandlePrepare)
	r.Get("/api/execute/stream", h.HandleStream)
	r.Post("/api/execute/cancel", h.HandleCancel)

	// Serve Angular SPA — catch-all, must come last
	r.Handle("/*", spaHandler(webFS))

	return r
}

// corsMiddleware adds permissive CORS headers for local development.
// In production the Go binary serves the Angular bundle, so same-origin applies.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// spaHandler serves static files from webFS and falls back to index.html for
// client-side routing (Angular deep links).
func spaHandler(webFS fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(webFS))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try serving the file directly; if not found, serve index.html.
		f, err := webFS.Open(r.URL.Path[1:]) // strip leading /
		if err != nil {
			// Fall back to index.html for Angular routing.
			r2 := *r
			r2.URL.Path = "/"
			fileServer.ServeHTTP(w, &r2)
			return
		}
		f.Close()
		fileServer.ServeHTTP(w, r)
	})
}
