const BTerminal = {
  term: null,
  socket: null,
  fitAddon: null,
  visible: false,

  init() {
    document.getElementById('toggle-terminal').addEventListener('click', () => this.toggle());
    document.getElementById('close-terminal').addEventListener('click', () => this.hide());
    window.addEventListener('resize', () => { if (this.visible) this.fit(); });
  },

  toggle() { this.visible ? this.hide() : this.show(); },

  show() {
    this.visible = true;
    document.getElementById('terminal-area').style.display = 'flex';
    document.getElementById('resize-handle-h').style.display = 'block';
    if (!this.term) this.createTerminal();
    setTimeout(() => this.fit(), 50);
  },

  hide() {
    this.visible = false;
    document.getElementById('terminal-area').style.display = 'none';
    document.getElementById('resize-handle-h').style.display = 'none';
  },

  createTerminal() {
    const container = document.getElementById('terminal-container');
    container.innerHTML = '';

    const XTerm = window.Terminal;
    if (!XTerm) {
      container.innerHTML = '<p style="color:var(--danger);padding:12px">Terminal failed to load. Check CDN connectivity.</p>';
      return;
    }

    this.term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background:          '#09090b',
        foreground:          '#fafafa',
        cursor:              '#6366f1',
        selectionBackground: 'rgba(99,102,241,0.3)',
        black:   '#3f3f46', red:     '#ef4444', green:  '#22c55e', yellow:  '#f59e0b',
        blue:    '#6366f1', magenta: '#a855f7', cyan:   '#06b6d4', white:   '#fafafa',
        brightBlack:   '#71717a', brightRed:   '#fca5a5', brightGreen: '#86efac',
        brightYellow:  '#fde68a', brightBlue:  '#818cf8', brightMagenta: '#d8b4fe',
        brightCyan:    '#67e8f9', brightWhite: '#ffffff',
      },
    });

    if (window.FitAddon?.FitAddon) {
      this.fitAddon = new window.FitAddon.FitAddon();
      this.term.loadAddon(this.fitAddon);
    }

    this.term.open(container);
    this.connect();
  },

  connect() {
    if (this.socket) this.socket.disconnect();

    this.socket = io('/terminal');

    this.socket.on('connect', () => {
      this.fit();
      let cols = 80, rows = 24;
      if (this.fitAddon) {
        try { const d = this.fitAddon.proposeDimensions(); if (d) { cols = d.cols; rows = d.rows; } } catch {}
      }
      this.socket.emit('spawn', { sessionId: App.currentSessionId, cols, rows });
    });

    this.socket.on('data',  (data) => this.term.write(data));
    this.socket.on('exit',  ()     => this.term.write('\r\n\x1b[33m[Process exited]\x1b[0m\r\n'));
    this.socket.on('connect_error', (err) => this.term.write(`\r\n\x1b[31m[Connection error: ${err.message}]\x1b[0m\r\n`));

    this.term.onData((data) => { if (this.socket?.connected) this.socket.emit('data', data); });
    this.term.onResize(({ cols, rows }) => { if (this.socket?.connected) this.socket.emit('resize', { cols, rows }); });
  },

  fit() { try { this.fitAddon?.fit(); } catch {} },

  destroy() {
    this.socket?.disconnect();
    this.term?.dispose();
    this.socket = this.term = this.fitAddon = null;
    this.visible = false;
  },
};
