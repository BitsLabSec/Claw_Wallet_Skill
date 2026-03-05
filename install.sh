#!/bin/bash
# CLAY Minimal Installer for Linux/Mac

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

OS_TYPE="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH_TYPE="$(uname -m)"

BINARY_NAME="clay-sandbox-linux-amd64"
if [ "$OS_TYPE" == "darwin" ]; then
    if [ "$ARCH_TYPE" == "arm64" ]; then
        BINARY_NAME="clay-sandbox-darwin-arm64"
    else
        BINARY_NAME="clay-sandbox-darwin-amd64"
    fi
fi

BINARY_SOURCE="./bin/$BINARY_NAME"
BINARY_URL="https://raw.githubusercontent.com/UIZorrot/Clay-Skill-More/main/bin/$BINARY_NAME"
BINARY_TARGET="./clay-sandbox"

# 1. Prepare Binary
if [ ! -f "$BINARY_TARGET" ]; then
    if [ -f "$BINARY_SOURCE" ]; then
        cp "$BINARY_SOURCE" "$BINARY_TARGET"
    else
        echo "Downloading Sandbox Binary from $BINARY_URL ..."
        curl -L -o "$BINARY_TARGET" "$BINARY_URL"
    fi
    chmod +x "$BINARY_TARGET"
fi

# 2. Configure Environment
TOKEN=$(openssl rand -base64 12 | tr -d '+/')
LISTEN_ADDR="127.0.0.1:9000"
RELAY_URL="${RELAY_URL:-http://localhost:8080}"

cat <<EOF > .env.clay
CLAY_SANDBOX_URL=http://$LISTEN_ADDR
CLAY_AGENT_TOKEN=$TOKEN
CLAY_RELAY_URL=$RELAY_URL
EOF

# 3. Launch Daemon
pkill -f clay-sandbox || true
export RELAY_URL=$RELAY_URL
export LISTEN_ADDR=$LISTEN_ADDR
export AGENT_TOKEN=$TOKEN
export AGENT_ID="openclaw-agent-$(date +%s)"

nohup "$BINARY_TARGET" > sandbox.log 2>&1 &

echo "✅ CLAY Sandbox is running on $LISTEN_ADDR"
echo "✅ Identity Token generated and saved to .env.clay"
