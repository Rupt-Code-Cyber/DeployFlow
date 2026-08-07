#!/bin/sh
set -e

# Define clear execution targeting profiles
DEV_COMPOSE="docker/compose/docker-compose.dev.yml"
PROD_COMPOSE="docker/compose/docker-compose.prod.yml"

print_usage() {
    echo "DeployFlow Enterprise DevOps Control Script"
    echo "Usage: $0 [command]"
    echo ""
    echo "Available Commands:"
    echo "  dev:start       Launch development stack with live reload"
    echo "  dev:stop        Stop development infrastructure layers"
    echo "  dev:logs        Stream development application logging layers"
    echo "  dev:migrate     Run schema migrations inside the dev container"
    echo "  dev:seed        Populate the development database with seeds"
    echo "  dev:shell       Enter an interactive shell inside the dev container"
    echo "  prod:start      Launch hardened production container cluster"
    echo "  prod:stop       Tear down the production infrastructure"
    echo "  prod:logs       Inspect production system logging vectors"
}

case "$1" in
    "dev:start")
        echo "[!] Constructing development lock manifests..."
        cp -n .env.example .env || true
        docker compose -f "$DEV_COMPOSE" up -d
        echo "[+] Development cluster successfully deployed!"
        ;;
    "dev:stop")
        docker compose -f "$DEV_COMPOSE" down
        echo "[+] Development infrastructure removed cleanly."
        ;;
    "dev:logs")
        docker compose -f "$DEV_COMPOSE" logs -f api
        ;;
    "dev:migrate")
        echo "[!] Running Prisma migrations inside development environment..."
        docker compose -f "$DEV_COMPOSE" exec api npx prisma migrate dev
        ;;
    "dev:seed")
        echo "[!] Injecting test seed datasets..."
        docker compose -f "$DEV_COMPOSE" exec api npx prisma db seed
        ;;
    "dev:shell")
        docker compose -f "$DEV_COMPOSE" exec api /bin/sh
        ;;
    "prod:start")
        echo "[!] Provisioning production immutable instances..."
        docker compose -f "$PROD_COMPOSE" up -d
        echo "[+] Production infrastructure stack live!"
        ;;
    "prod:stop")
        docker compose -f "$PROD_COMPOSE" down
        echo "[+] Production infrastructure stopped."
        ;;
    "prod:logs")
        docker compose -f "$PROD_COMPOSE" logs -f api
        ;;
    *)
        print_usage
        exit 1
        ;;
esac
