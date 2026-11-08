
#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR=APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="/opt/smart-kirana/config/application.env"
COMPOSE_FILE="$APP_DIR/deployment/docker-compose.prod.yml"
STATE_DIR="/opt/smart-kirana/config"

CURRENT_FILE="$STATE_DIR/current-image-tag"
PREVIOUS_FILE="$STATE_DIR/previous-image-tag"

IMAGE_TAG="${IMAGE_TAG:-latest}"

cd "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: Environment file not found: $ENV_FILE"
    exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "ERROR: Compose file not found: $COMPOSE_FILE"
    exit 1
fi

export IMAGE_TAG

echo "Validating Docker Compose configuration..."
docker compose --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" config -q

OLD_TAG=""
if [[ -f "$CURRENT_FILE" ]]; then
    OLD_TAG="$(cat "$CURRENT_FILE")"
fi

if [[ -n "$OLD_TAG" ]]; then
    echo "$OLD_TAG" > "$PREVIOUS_FILE"
fi

echo "Deploying Smart Kirana version: $IMAGE_TAG"

docker compose --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "Waiting for containers to become healthy..."

SERVICES=(
    user-service
    product-service
    order-service
    api-gateway
    frontend
)

for service in "${SERVICES[@]}"; do
    healthy=false

    for attempt in $(seq 1 30); do
        status="$(docker inspect \
            --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
            "sk-${service}" 2>/dev/null || true)"

        echo "$service: $status"

        if [[ "$status" == "healthy" ]]; then
            healthy=true
            break
        fi

        if [[ "$status" == "unhealthy" || "$status" == "exited" ]]; then
            break
        fi

        sleep 10
    done

    if [[ "$healthy" != "true" ]]; then
        echo "ERROR: $service failed health verification."

        if [[ -n "$OLD_TAG" ]]; then
            echo "Restoring previous version: $OLD_TAG"
            export IMAGE_TAG="$OLD_TAG"

            docker compose --env-file "$ENV_FILE" \
                -f "$COMPOSE_FILE" up -d --no-build

            echo "$OLD_TAG" > "$CURRENT_FILE"
        else
            echo "No previous version is available for rollback."
        fi

        docker compose --env-file "$ENV_FILE" \
            -f "$COMPOSE_FILE" ps

        exit 1
    fi
done

echo "$IMAGE_TAG" > "$CURRENT_FILE"

echo "Deployment successful: $IMAGE_TAG"

docker compose --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" ps
