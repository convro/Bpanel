#!/bin/bash
set -e

# ─────────────────────────────────────────────
#  Bpanel Installer
#  Something fucking refreshing 🪩🌋
# ─────────────────────────────────────────────

INSTALL_DIR="/opt/bpanel"
SERVICE_NAME="bpanel"
PORT=9390
REPO_URL="https://github.com/convro/Bpanel.git"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ██████╗ ██████╗  █████╗ ███╗   ██╗███████╗██╗     "
  echo "  ██╔══██╗██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     "
  echo "  ██████╔╝██████╔╝███████║██╔██╗ ██║█████╗  ██║     "
  echo "  ██╔══██╗██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     "
  echo "  ██████╔╝██║     ██║  ██║██║ ╚████║███████╗███████╗"
  echo "  ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝"
  echo -e "${NC}"
  echo -e "  ${BOLD}Installer v1.0${NC}"
  echo ""
}

log() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }

check_root() {
  if [ "$EUID" -ne 0 ]; then
    fail "Please run as root: sudo bash install.sh"
  fi
}

check_os() {
  if [ ! -f /etc/os-release ]; then
    fail "Unsupported OS. Bpanel requires Ubuntu/Debian."
  fi
  . /etc/os-release
  log "Detected OS: $PRETTY_NAME"
}

install_node() {
  if command -v node &>/dev/null; then
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -ge 18 ]; then
      log "Node.js $(node -v) already installed"
      return
    fi
    warn "Node.js version too old ($(node -v)), upgrading..."
  fi

  log "Installing Node.js 20.x..."
  apt-get update -qq
  apt-get install -y -qq curl ca-certificates gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 2>/dev/null
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -qq
  apt-get install -y -qq nodejs
  log "Node.js $(node -v) installed"
}

install_deps() {
  log "Installing build dependencies..."
  apt-get install -y -qq build-essential python3 git
}

install_bpanel() {
  if [ -d "$INSTALL_DIR" ]; then
    warn "Existing installation found, updating..."
    cd "$INSTALL_DIR"
    git pull origin main 2>/dev/null || true
  else
    log "Cloning Bpanel..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi

  log "Installing npm dependencies..."
  npm install --production 2>&1 | tail -1

  log "Bpanel installed to $INSTALL_DIR"
}

setup_service() {
  log "Creating systemd service..."
  cat > /etc/systemd/system/${SERVICE_NAME}.service << 'UNIT'
[Unit]
Description=Bpanel - Web VPS Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bpanel
ExecStart=/usr/bin/node bpanel.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable ${SERVICE_NAME}
  systemctl restart ${SERVICE_NAME}
  log "Bpanel service started"
}

get_ip() {
  IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [ -z "$IP" ]; then
    IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
  fi
  echo "$IP"
}

finish() {
  IP=$(get_ip)
  echo ""
  echo -e "  ${GREEN}${BOLD}═══════════════════════════════════════════${NC}"
  echo -e "  ${GREEN}${BOLD}  Bpanel installed successfully! 🪩🌋${NC}"
  echo -e "  ${GREEN}${BOLD}═══════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Open in your browser:"
  echo -e "  ${CYAN}${BOLD}  http://${IP}:${PORT}${NC}"
  echo ""
  echo -e "  Create your admin account on first visit."
  echo ""
  echo -e "  Commands:"
  echo -e "    ${BOLD}systemctl status bpanel${NC}   - Check status"
  echo -e "    ${BOLD}systemctl restart bpanel${NC}  - Restart"
  echo -e "    ${BOLD}journalctl -u bpanel -f${NC}   - View logs"
  echo ""
}

# ─── Main ───
banner
check_root
check_os
install_node
install_deps
install_bpanel
setup_service
finish
