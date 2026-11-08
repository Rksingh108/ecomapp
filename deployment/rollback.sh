
#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/home/ec2-user/ecomapp"
ENV_FILE="/opt/smart-kirana/config/application.env"
COMPOSE_FILE="$APP_DIR/deployment/docker-compose.prod.yml"

STATE_DIR="/opt/smart-kirana/config"
CURRENT_FILE="$STATE_DIR/current-image-tag"
PREVIOUS_FILE="$STATE_DIR/previous-image-tag"

if [[ ! -f "$PREVIOUS_FILE" ]]; then
    echo "ERROR: No previous deployment is recorded."
    exit 1
fi

PREVIOUS_TAG="$(cat "$PREVIOUS_FILE")"
CURRENT_TAG="$(cat "$CURRENT_FILE" 2>/dev/null || true)"

if [[ -z "$PREVIOUS_TAG" ]]; then
    echo "ERROR: Previous image tag is empty."
    exit 1
fi

echo "Rolling back to $PREVIOUS_TAG"

cd "$APP_DIR"

export IMAGE_TAG="$PREVIOUS_TAG"

docker compose --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" up -d --no-build

echo "$PREVIOUS_TAG" > "$CURRENT_FILE"

if [[ -n "$CURRENT_TAG" ]]; then
    echo "$CURRENT_TAG" > "$PREVIOUS_FILE"
fi

echo "Rollback command completed."

docker compose --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" ps
