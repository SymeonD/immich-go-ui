package stream

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Writer wraps an http.ResponseWriter to emit Server-Sent Events.
type Writer struct {
	w       http.ResponseWriter
	flusher http.Flusher
}

// NewWriter creates an SSE Writer and sets the required headers.
// Returns nil if the ResponseWriter does not support flushing.
func NewWriter(w http.ResponseWriter) *Writer {
	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil
	}
	h := w.Header()
	h.Set("Content-Type", "text/event-stream")
	h.Set("Cache-Control", "no-cache")
	h.Set("Connection", "keep-alive")
	h.Set("X-Accel-Buffering", "no") // disable nginx buffering
	return &Writer{w: w, flusher: flusher}
}

// Send writes a named SSE event with a JSON-encoded data payload.
func (s *Writer) Send(event string, data any) error {
	b, err := json.Marshal(data)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(s.w, "event: %s\ndata: %s\n\n", event, b)
	if err != nil {
		return err
	}
	s.flusher.Flush()
	return nil
}

// Comment writes an SSE comment (keepalive).
func (s *Writer) Comment(msg string) {
	fmt.Fprintf(s.w, ": %s\n\n", msg)
	s.flusher.Flush()
}
