# immich-go-ui

A web-based graphical interface for [immich-go](https://github.com/simulot/immich-go) — the CLI tool for importing photos into your self-hosted [Immich](https://immich.app) instance.

Instead of memorizing flags and typing long commands, you fill out a form, preview the generated command, and watch the live output stream directly in your browser.

---

## Features

- **All 5 upload sources** — From Folder, Google Photos Takeout, iCloud, Picasa, or another Immich instance
- **Full flag coverage** — Every `immich-go upload` flag is exposed as a labeled form field
- **Live command preview** — The CLI command updates in real time as you type
- **Streaming output** — Execution output is streamed line by line via SSE with ANSI colour support
- **Auto-download** — The `immich-go` binary is automatically downloaded on first run (no manual setup)
- **Single binary** — One executable serves the entire app; no separate web server needed
- **Cross-platform** — Windows, macOS, and Linux

---

## Prerequisites

To **build** from source you need:

| Tool | Version |
|------|---------|
| [Go](https://go.dev/dl/) | 1.21+ |
| [Node.js](https://nodejs.org/) | 18+ |
| npm | bundled with Node.js |

To **run** the built binary you only need the binary itself — `immich-go` is downloaded automatically.

---

## Building from source

```bash
# 1. Clone the repository
git clone https://github.com/SymeonD/immich-go-ui.git
cd immich-go-ui

# 2. Build everything (Angular → embed → Go binary)
make build
```

This produces a single `immich-go-ui` (or `immich-go-ui.exe` on Windows) binary in the project root.

### Individual build steps

```bash
make build-frontend   # Compile Angular in production mode
make copy-frontend    # Copy dist into the Go embed directory
make build-backend    # Compile the Go binary
```

---

## Running

```bash
./immich-go-ui
# Windows:
.\immich-go-ui.exe
```

Then open your browser at **http://localhost:8080**.

### Options

```
  -port int    HTTP port to listen on (default 8080)
```

### First run

On first launch, immich-go-ui checks for the `immich-go` binary in your user data directory:

- **Windows:** `%APPDATA%\immich-go-ui\immich-go.exe`
- **macOS / Linux:** `~/.immich-go-ui/immich-go`

If it is not found, the latest release is downloaded automatically from the [immich-go GitHub releases](https://github.com/simulot/immich-go/releases). The status banner in the app shows download progress.

---

## Development

Run the Go backend and Angular dev server in separate terminals:

```bash
# Terminal 1 — Go backend (API only)
make dev-backend

# Terminal 2 — Angular dev server with proxy to backend
make dev-frontend
```

Then open **http://localhost:4200**. Hot-reload is active for the frontend; restart the backend to pick up Go changes.

---

## How it works

```
┌─────────────────────────────────────────────┐
│              immich-go-ui binary             │
│                                              │
│  ┌─────────────┐      ┌────────────────────┐ │
│  │  Go backend │      │  Angular frontend  │ │
│  │  (Chi HTTP) │◄────►│  (embedded, served │ │
│  │             │      │   from binary)     │ │
│  └──────┬──────┘      └────────────────────┘ │
│         │                                    │
│  ┌──────▼──────┐                             │
│  │  immich-go  │  ← auto-downloaded          │
│  │   binary    │                             │
│  └─────────────┘                             │
└─────────────────────────────────────────────┘
```

1. The Angular frontend is compiled and **embedded** into the Go binary via `//go:embed`
2. The Go backend serves the frontend and exposes a small REST API
3. When you click **Execute**, the backend spawns `immich-go` as a subprocess and streams stdout/stderr back to the browser via **Server-Sent Events**
4. Cancel sends a signal to the process group, terminating the upload cleanly

### API surface

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Binary download status |
| `GET` | `/api/browse` | Open native file picker (returns path) |
| `POST` | `/api/execute/prepare` | Validate args, return execution token |
| `GET` | `/api/execute/stream` | SSE stream of live output |
| `POST` | `/api/execute/cancel` | Cancel running process |
| `GET` | `/*` | Serve embedded Angular SPA |

---

## Project structure

```
immich-go-ui/
├── backend/
│   ├── cmd/server/          # Entry point
│   ├── embedded/            # Angular build output (go:embed target)
│   └── internal/
│       ├── api/             # HTTP handlers and router
│       ├── binary/          # immich-go download and process runner
│       ├── browse/          # Native file picker (per OS)
│       └── stream/          # SSE helpers
├── frontend/
│   └── src/app/
│       ├── core/            # Models, store, services
│       └── features/        # UI components
└── Makefile
```

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request for non-trivial changes.

---

## Credits

- [immich-go](https://github.com/simulot/immich-go) by [@simulot](https://github.com/simulot) — the CLI tool this project wraps
- [Immich](https://immich.app) — the self-hosted photo management platform

---

## License

[MIT](LICENSE) © SymeonD
