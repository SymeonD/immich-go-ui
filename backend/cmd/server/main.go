package main

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/SymeonD/immich-go-ui/backend/embedded"
	"github.com/SymeonD/immich-go-ui/backend/internal/api"
	"github.com/SymeonD/immich-go-ui/backend/internal/binary"
)

func main() {
	port := flag.Int("port", 8080, "HTTP server port")
	binaryPath := flag.String("binary", "", "Path to immich-go binary (auto-downloaded if empty)")
	flag.Parse()

	// Strip the "web/" prefix so the FS root is the web/ directory contents.
	webFS, err := fs.Sub(embedded.FS, "web")
	if err != nil {
		log.Fatalf("embed sub: %v", err)
	}

	manager := binary.NewManager(*binaryPath)
	runner := binary.NewRunner(manager)

	h := &api.Handler{
		Manager: manager,
		Runner:  runner,
	}

	router := api.NewRouter(h, webFS)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", *port),
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 0, // disabled — SSE streams need unlimited write time
		IdleTimeout:  120 * time.Second,
	}

	// Start binary manager in background so HTTP server is immediately responsive.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		if err := manager.EnsureReady(ctx); err != nil {
			log.Printf("binary manager: %v", err)
		}
	}()

	// Graceful shutdown on SIGINT / SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("immich-go-ui listening on http://localhost:%d", *port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	<-quit
	log.Println("shutting down…")
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
