# Bpanel
Bpanel - creating something fucking refreshing 🪩🌋

A web-based VPS management panel built with Node.js. Full file manager, code editor, and terminal — right in your browser.

## Features

- **File Manager** — Browse, create, rename, delete files and folders with a clean UI
- **Code Editor** — Edit files directly in the browser with tab support and Ctrl+S save
- **Web Terminal** — Full PTY terminal (xterm.js) running in your browser
- **Session Management** — Multiple workspaces, each with its own working directory
- **Auth System** — Registration + login, first user becomes admin
- **Dark Theme** — Because we're not savages

## Quick Install

On your Ubuntu VPS as root:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)
```

Or clone manually:

```bash
git clone https://github.com/convro/Bpanel.git /opt/bpanel
cd /opt/bpanel
npm install
node bpanel.js
```

## Default Port

Bpanel runs on port **9390**. Access it at `http://your-vps-ip:9390`

## Tech Stack

- **Backend**: Express, Socket.IO, node-pty, better-sqlite3, bcryptjs, JWT
- **Frontend**: Vanilla JS, xterm.js
- **Database**: SQLite (zero config)

## Commands

```bash
systemctl status bpanel    # Check status
systemctl restart bpanel   # Restart
journalctl -u bpanel -f    # View logs
```

## License

MIT
