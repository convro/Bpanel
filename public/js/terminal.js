const BTerminal = {
  term: null,
  socket: null,
  fitAddon: null,
  visible: false,

  init() {
    document.getElementById('toggle-terminal').addEventListener('click', () => this.toggle());
    document.getElementById('close-terminal').addEventListener('click', () => this.hide());

    window.addEventListener('resize', () => {
      if (this.visible && this.fitAddon) {
        this.fit();
      }
    });
  },

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  },

  show() {
    this.visible = true;
    const area = document.getElementById('terminal-area');
    const resizeH = document.getElementById('resize-handle-h');
    area.style.display = 'flex';
    resizeH.style.display = 'block';

    if (!this.term) {
      this.createTerminal();
    }

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

    // xterm.js UMD exposes window.Terminal
    const XTerm = window.Terminal;
    if (!XTerm) {
      console.error('xterm.js not loaded');
      container.innerHTML = '<p style="color:#f85149;padding:12px">Terminal failed to load. Check CDN connectivity.</p>';
      return;
    }

    this.term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
        selectionBackground: 'rgba(88, 166, 255, 0.3)',
        black: '#484f58',
        red: '#f85149',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#76e3ea',
        white: '#e6edf3',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#b3f0ff',
        brightWhite: '#ffffff',
      },
    });

    if (window.FitAddon && window.FitAddon.FitAddon) {
      this.fitAddon = new window.FitAddon.FitAddon();
      this.term.loadAddon(this.fitAddon);
    }

    this.term.open(container);
    this.connect();
  },

  connect() {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('/terminal');

    this.socket.on('connect', () => {
      this.fit();
      let cols = 80, rows = 24;
      if (this.fitAddon) {
        try {
          const dims = this.fitAddon.proposeDimensions();
          if (dims) { cols = dims.cols; rows = dims.rows; }
        } catch {}
      }
      this.socket.emit('spawn', {
        sessionId: App.currentSessionId,
        cols,
        rows,
      });
    });

    this.socket.on('data', (data) => {
      this.term.write(data);
    });

    this.socket.on('exit', () => {
      this.term.write('\r\n\x1b[33m[Process exited]\x1b[0m\r\n');
    });

    this.socket.on('connect_error', (err) => {
      this.term.write(`\r\n\x1b[31m[Connection error: ${err.message}]\x1b[0m\r\n`);
    });

    this.term.onData((data) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('data', data);
      }
    });

    this.term.onResize(({ cols, rows }) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('resize', { cols, rows });
      }
    });
  },

  fit() {
    if (this.fitAddon) {
      try { this.fitAddon.fit(); } catch {}
    }
  },

  destroy() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.term) {
      this.term.dispose();
      this.term = null;
    }
    this.fitAddon = null;
    this.visible = false;
  },
};
