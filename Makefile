GOPATH_BIN := $(shell go env GOPATH)/bin
BINARY_NAME := immich-go-ui

.PHONY: build build-frontend build-backend copy-frontend clean dev-backend dev-frontend

## Full production build (frontend → copy → backend embed)
build: build-frontend copy-frontend build-backend

## Build Angular in production mode
build-frontend:
	cd frontend && npm run build -- --configuration production

## Copy Angular dist into Go embed directory
copy-frontend:
	@rm -rf backend/embedded/web
	@mkdir -p backend/embedded/web
	@cp -r frontend/dist/frontend/browser/. backend/embedded/web/
	@echo "Frontend copied to backend/embedded/web/"

## Build Go binary (embeds Angular)
build-backend:
	cd backend && go build -o ../$(BINARY_NAME)$(if $(filter windows,$(GOOS)),.exe) ./cmd/server
	@echo "Binary built: ./$(BINARY_NAME)"

## Development: run Go backend (serves placeholder web dir)
dev-backend:
	cd backend && go run ./cmd/server -port 8080

## Development: run Angular dev server (proxies API to Go backend)
dev-frontend:
	cd frontend && npx ng serve --proxy-config proxy.conf.json --port 4200

## Clean build artifacts
clean:
	rm -f $(BINARY_NAME) $(BINARY_NAME).exe
	rm -rf frontend/dist
	rm -rf backend/embedded/web/*
	touch backend/embedded/web/.gitkeep
