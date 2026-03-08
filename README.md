<div align="center">

<br>

# ⬡ Bpanel

**Something fucking refreshing.**

A self-hosted VPS control panel that doesn't suck — built with Node.js, designed for people who know what they're doing.

<br>

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Ubuntu%20%2F%20Debian-E95420?style=flat-square&logo=ubuntu&logoColor=white)](https://ubuntu.com)
[![Port](https://img.shields.io/badge/Default%20Port-9390-71717a?style=flat-square)](#)

<br>

</div>

---

## ✦ What it does

Bpanel gives you a clean, fast, browser-based interface to manage your VPS — without the bloat of cPanel or the complexity of Cockpit. Everything you actually need, nothing you don't.

---

## ◈ Features

### 🗂 File Manager
> Browse, create, rename, delete — full context menu, breadcrumb navigation, drag & drop upload, and one-click file/folder download (ZIP).

### ✏️ Code Editor
> Syntax-highlighted editor (highlight.js) with tab support, multi-file tabs, modified state indicators, and `Ctrl+S` to save. Works on any file type.

### 🖥 Web Terminal
> Full PTY terminal via xterm.js + Socket.IO. Resizable, themeable, persistent across tab switches.

### 🌐 Domain Manager
> Add Nginx virtual hosts in seconds — static sites or reverse proxy. Edit raw vhost configs with live `nginx -t` validation. Enable/disable without deleting.

### 🔒 SSL Certificates
> One-click Let's Encrypt via Certbot. Auto-installs Certbot if missing, supports renewal, shows expiry dates.

### 🗄 Databases
> Install, create, and manage PostgreSQL & MariaDB databases with users and permissions. Built-in SQL query editor — run queries directly from the panel.

### ⚙️ Process Manager
> Live process table (sorted by CPU), kill signals, and full PM2 integration — restart, stop, reload, delete services without touching the terminal.

### 📋 Log Viewer
> Real-time log streaming via Server-Sent Events. Nginx access/error, journald service logs. Filter by keyword, auto-scroll toggle.

### 🌿 Git Panel
> Per-workspace git integration — status, staged/unstaged diff, commit with message, push, pull, discard file changes.

### ⌨️ Command Palette
> `Ctrl+K` to open. Search sessions, navigate sections, trigger actions — keyboard-first.

### 🔐 Auth System
> First user becomes admin. JWT-based auth with cookies, rate-limited login (30 req/15min), sessions persist across server restarts.

### 📊 System Info
> CPU, memory, disk usage with progress bars, uptime, OS details, and a full inventory of installed software versions.

---

## ⚡ Quick Install

On a fresh Ubuntu/Debian VPS as root:

```bash
bash <(curl -fsSL https://bpanel.99host.fun/dev/v5/install-bpanel-now)
```

Or clone manually:

```bash
git clone https://github.com/convro/Bpanel.git /opt/bpanel
cd /opt/bpanel
npm install
node bpanel.js
```

Access at `http://your-vps-ip:9390` → create your admin account on first load.

---

## 🛠 Management

```bash
systemctl status bpanel     # Check if running
systemctl restart bpanel    # Restart the panel
systemctl stop bpanel       # Stop it
journalctl -u bpanel -f     # Stream logs
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `BPANEL_PORT` | `9390` | HTTP port to listen on |
| `BPANEL_JWT_SECRET` | *(auto-generated)* | Override JWT secret |

---

## 🧱 Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ |
| Server | Express, Socket.IO |
| Terminal | node-pty + xterm.js |
| Database | SQLite (better-sqlite3) |
| Auth | bcryptjs + JWT + cookies |
| Frontend | Vanilla JS (no framework) |
| Editor | highlight.js |
| Icons | Lucide |

---

## 🔒 Security

- Rate limiting on auth (`30 req / 15min`) and API (`300 req / min`)
- JWT secret persisted to disk — sessions survive restarts
- All system calls use `spawnSync` with argument arrays — no shell injection
- Input validation on domain names, ports, emails, DB identifiers
- Path traversal protection in file manager
- Security headers on all responses

---

## 📁 Port & Data

- **Panel**: `http://your-ip:9390`
- **Data dir**: `/opt/bpanel/data/` (SQLite DB, JWT secret, uploads)
- **Uploads**: cleaned up automatically after move to destination

---

## 📜 License

MIT — do whatever you want with it.

---

<div align="center">

Made with 🖤 and a strong opinion about software that doesn't waste your time.

</div>
