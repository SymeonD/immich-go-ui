// Package embedded exposes the Angular build output as an embedded filesystem.
// The web/ directory next to this file is populated by `make build-frontend`.
package embedded

import "embed"

//go:embed web
var files embed.FS

// FS is the embedded filesystem rooted at the web/ directory.
var FS = files
