const Databases = {
  dbTerm: null,
  dbSocket: null,

  init() {
    document.getElementById('create-db-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-db').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-db').addEventListener('click', () => this.createDB());
    document.getElementById('db-terminal-connect').addEventListener('click', () => this.connectTerminal());
  },

  showModal() { document.getElementById('create-db-modal').style.display = 'flex'; },
  hideModal() {
    document.getElementById('create-db-modal').style.display = 'none';
    document.getElementById('db-name-input').value = '';
    document.getElementById('db-user-input').value = '';
    document.getElementById('db-pass-input').value = '';
  },

  async load() {
    await Promise.all([this.loadEngineStatus(), this.loadDatabases()]);
  },

  async loadEngineStatus() {
    const container = document.getElementById('db-engine-status');
    try {
      const engines = await API.get('/api/databases/status');
      container.innerHTML = `
        <div class="engine-status-grid">
          <div class="engine-card">
            <div class="engine-card-header">
              <h4><i data-lucide="database" class="icon-sm"></i> PostgreSQL</h4>
              ${engines.postgresql.installed
                ? `<span class="badge ${engines.postgresql.running ? 'badge-success' : 'badge-danger'}">${engines.postgresql.running ? 'Running' : 'Stopped'}</span>`
                : '<span class="badge badge-muted">Not Installed</span>'}
            </div>
            ${engines.postgresql.installed
              ? `<p style="font-size:12px;color:var(--text-secondary)">${this.esc(engines.postgresql.version)}</p>`
              : `<button class="btn btn-sm btn-primary install-engine" data-engine="postgresql" style="margin-top:8px"><i data-lucide="download" class="icon-xs"></i> Install PostgreSQL</button>`}
          </div>
          <div class="engine-card">
            <div class="engine-card-header">
              <h4><i data-lucide="database" class="icon-sm"></i> MariaDB</h4>
              ${engines.mariadb.installed
                ? `<span class="badge ${engines.mariadb.running ? 'badge-success' : 'badge-danger'}">${engines.mariadb.running ? 'Running' : 'Stopped'}</span>`
                : '<span class="badge badge-muted">Not Installed</span>'}
            </div>
            ${engines.mariadb.installed
              ? `<p style="font-size:12px;color:var(--text-secondary)">${this.esc(engines.mariadb.version)}</p>`
              : `<button class="btn btn-sm btn-primary install-engine" data-engine="mariadb" style="margin-top:8px"><i data-lucide="download" class="icon-xs"></i> Install MariaDB</button>`}
          </div>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();

      container.querySelectorAll('.install-engine').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Installing...';
          try {
            await API.post(`/api/databases/install/${btn.dataset.engine}`);
            alert(`${btn.dataset.engine} installed successfully!`);
            this.load();
          } catch (err) {
            alert('Install failed: ' + err.message);
            btn.disabled = false;
            btn.textContent = 'Install';
          }
        });
      });
    } catch (err) {
      container.innerHTML = `<div class="info-box" style="border-color:var(--danger)"><p>Error checking engines: ${err.message}</p></div>`;
    }
  },

  async loadDatabases() {
    const container = document.getElementById('db-list');
    const termSection = document.getElementById('db-terminal-section');
    const select = document.getElementById('db-terminal-select');

    try {
      const databases = await API.get('/api/databases');

      if (databases.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">No databases created yet.</div>';
        termSection.style.display = 'none';
        return;
      }

      container.innerHTML = databases.map(db => `
        <div class="db-card">
          <div class="db-info">
            <div class="db-name">
              <i data-lucide="database" class="icon-sm" style="color:${db.engine === 'postgresql' ? 'var(--accent)' : 'var(--warning)'}"></i>
              <strong>${this.esc(db.name)}</strong>
              <span class="badge badge-accent">${db.engine === 'postgresql' ? 'PostgreSQL' : 'MariaDB'}</span>
            </div>
            <div class="db-detail">
              <i data-lucide="server" class="icon-xs"></i>
              localhost:${db.engine === 'postgresql' ? '5432' : '3306'}
            </div>
          </div>
          <div class="db-actions">
            <button class="btn btn-sm btn-danger delete-db" data-engine="${db.engine}" data-name="${this.esc(db.name)}"><i data-lucide="trash-2" class="icon-xs"></i></button>
          </div>
        </div>
      `).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons();

      container.querySelectorAll('.delete-db').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm(`Delete database "${btn.dataset.name}"? This cannot be undone!`)) return;
          try {
            await API.del(`/api/databases/${btn.dataset.engine}/${btn.dataset.name}`);
            this.load();
          } catch (err) { alert(err.message); }
        });
      });

      // Update terminal select
      termSection.style.display = 'block';
      select.innerHTML = '<option value="">Select database...</option>' +
        databases.map(db => `<option value="${db.engine}:${this.esc(db.name)}">${this.esc(db.name)} (${db.engine})</option>`).join('');
    } catch (err) {
      container.innerHTML = '';
    }
  },

  async createDB() {
    const engine = document.getElementById('db-engine-select').value;
    const dbName = document.getElementById('db-name-input').value.trim();
    const username = document.getElementById('db-user-input').value.trim();
    const password = document.getElementById('db-pass-input').value;

    if (!dbName || !username || !password) return alert('All fields are required');

    const btn = document.getElementById('confirm-db');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
      const result = await API.post('/api/databases', { engine, dbName, username, password });
      this.hideModal();
      this.load();

      if (result.connection) {
        alert(`Database created!\n\nConnection string:\n${result.connection.string}\n\nHost: ${result.connection.host}\nPort: ${result.connection.port}\nDatabase: ${result.connection.database}\nUsername: ${result.connection.username}`);
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create';
    }
  },

  connectTerminal() {
    const val = document.getElementById('db-terminal-select').value;
    if (!val) return alert('Select a database first');

    const [engine, dbName] = val.split(':');
    const container = document.getElementById('db-terminal-container');
    container.innerHTML = '';

    const XTerm = window.Terminal;
    if (!XTerm) {
      container.innerHTML = '<p style="color:var(--danger);padding:12px">Terminal not available</p>';
      return;
    }

    if (this.dbTerm) { this.dbTerm.dispose(); this.dbTerm = null; }
    if (this.dbSocket) { this.dbSocket.disconnect(); this.dbSocket = null; }

    this.dbTerm = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Consolas', monospace",
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
      },
    });

    let fitAddon = null;
    if (window.FitAddon && window.FitAddon.FitAddon) {
      fitAddon = new window.FitAddon.FitAddon();
      this.dbTerm.loadAddon(fitAddon);
    }

    this.dbTerm.open(container);
    if (fitAddon) try { fitAddon.fit(); } catch {}

    this.dbSocket = io('/terminal');

    this.dbSocket.on('connect', () => {
      if (fitAddon) try { fitAddon.fit(); } catch {}
      let cols = 80, rows = 24;
      if (fitAddon) {
        try {
          const dims = fitAddon.proposeDimensions();
          if (dims) { cols = dims.cols; rows = dims.rows; }
        } catch {}
      }

      // Spawn a shell session that auto-connects to the DB
      this.dbSocket.emit('spawn', { sessionId: 'db-terminal', cols, rows });

      // After shell starts, send the connect command
      setTimeout(() => {
        let cmd;
        if (engine === 'postgresql') {
          cmd = `sudo -u postgres psql ${dbName}`;
        } else {
          cmd = `mysql ${dbName}`;
        }
        this.dbSocket.emit('data', cmd + '\n');
      }, 500);
    });

    this.dbSocket.on('data', (data) => this.dbTerm.write(data));
    this.dbSocket.on('exit', () => this.dbTerm.write('\r\n\x1b[33m[Session ended]\x1b[0m\r\n'));

    this.dbTerm.onData((data) => {
      if (this.dbSocket && this.dbSocket.connected) this.dbSocket.emit('data', data);
    });

    this.dbTerm.onResize(({ cols, rows }) => {
      if (this.dbSocket && this.dbSocket.connected) this.dbSocket.emit('resize', { cols, rows });
    });
  },

  esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
};
