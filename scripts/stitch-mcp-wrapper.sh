#!/usr/bin/env bash
# Wrapper: override ADC token with user token for stitch-mcp
# ADC identity is broken (empty account field), user credentials work fine

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Create a wrapper for gcloud that intercepts "auth application-default print-access-token"
WRAPPER_DIR=$(mktemp -d)
cat > "$WRAPPER_DIR/gcloud" << 'GCLOUD_WRAPPER'
#!/usr/bin/env bash
if [[ "$*" == *"auth application-default print-access-token"* ]]; then
  exec /opt/homebrew/bin/gcloud auth print-access-token
else
  exec /opt/homebrew/bin/gcloud "$@"
fi
GCLOUD_WRAPPER
chmod +x "$WRAPPER_DIR/gcloud"

export PATH="$WRAPPER_DIR:$PATH"
exec npx -y stitch-mcp
