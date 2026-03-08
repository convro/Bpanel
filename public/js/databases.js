const Databases = {
  init() {
    document.getElementById('create-db-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-db').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-db').addEventListener('click', () => this.createDb());

    const runBtn = document.getElementById('sql-run-btn');
    if (runBtn) runBtn.addEventListener('click', () => this.runQuery());

    const sqlTA = document.getElementById('sql-query');
    if (sqlTA) {
      sqlTA.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.runQuery();
        }
      });
    }
  },

  showModal() {
    document.getElementById('create-db-modal').style.display = 'flex';
    document.getElementById('db-name-input').focus();
  },
  hideModal() { document.getElementById('create-db-modal').style.display = 'none'; },

  async load() {
    this.loadEngineStatus();
    this.loadDatabases();
  },

  async loadEngineStatus() {
    try {
      const engines = await API.get('/api/databases/status');
      const container = document.getElementById('db-engine-status');

      container.innerHTML = Object.entries(engines).map(([key, e]) => `
        <div class="engine-card">
          <div class="engine-status-dot ${e.running ? 'running' : ''}"></div>
          <div class="engine-info">
            <strong>${key === 'postgresql' ? 'PostgreSQL' : 'MariaDB'}</strong>
            <small>${e.installed ? (e.running ? 'Running' : 'Stopped') : 'Not installed'}</small>
          </div>
          ${!e.installed ? `<button class="btn btn-sm install-engine" data-engine="${key}"><i data-lucide="download" class="icon-xs"></i> Install</button>` : ''}
          ${e.installed && !e.running ? `<button class="btn btn-sm start-engine" data-engine="${key === 'postgresql' ? 'postgresql' : 'mariadb'}"><i data-lucide="play" class="icon-xs"></i> Start</button>` : ''}
        </div>
      `).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons({ el: container });

      container.querySelectorAll('.install-engine').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
          try {
            await API.post(`/api/databases/install/${btn.dataset.engine}`);
            Toast.success('Database engine installed!');
            this.load();
          } catch (err) { Toast.error(err.message); btn.disabled = false; }
        });
      });
    } catch (err) {
      document.getElementById('db-engine-status').innerHTML =
        `<div class="info-box" style="border-color:var(--warning)"><p>Failed to check database engines</p></div>`;
    }
  },

  async loadDatabases() {
    const list = document.getElementById('db-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';
    try {
      const databases = await API.get('/api/databases');
      if (databases.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:32px 0;color:var(--text-muted)">No databases yet.</div>';
        return;
      }
      list.innerHTML = databases.map(db => `
        <div class="db-card">
          <div class="db-info">
            <div class="db-name">
              <i data-lucide="database" class="icon-sm" style="color:${db.engine === 'postgresql' ? 'var(--accent-2)' : 'var(--warning)'}"></i>
              <strong>${esc(db.name)}</strong>
              <span class="badge badge-muted">${esc(db.engine)}</span>
            </div>
          </div>
          <div class="db-actions">
            <button class="btn btn-sm btn-danger delete-db" data-engine="${esc(db.engine)}" data-name="${esc(db.name)}">
              <i data-lucide="trash-2" class="icon-xs"></i>
            </button>
          </div>
        </div>
      `).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons({ el: list });
      list.querySelectorAll('.delete-db').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm(`Drop database "${btn.dataset.name}"?`)) return;
          try {
            await API.del(`/api/databases/${btn.dataset.engine}/${btn.dataset.name}`);
            Toast.success('Database deleted');
            this.loadDatabases();
          } catch (err) { Toast.error(err.message); }
        });
      });
    } catch (err) {
      list.innerHTML = `<div class="info-box" style="border-color:var(--danger)"><p>${esc(err.message)}</p></div>`;
    }
  },

  async createDb() {
    const engine   = document.getElementById('db-engine-select').value;
    const dbName   = document.getElementById('db-name-input').value.trim();
    const username = document.getElementById('db-user-input').value.trim();
    const password = document.getElementById('db-pass-input').value;

    if (!dbName || !username || !password) return Toast.error('All fields required');

    const btn = document.getElementById('confirm-db');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Creating...';

    try {
      const result = await API.post('/api/databases', { engine, dbName, username, password });
      this.hideModal();
      Toast.success('Database created!');
      if (result.connection) {
        Toast.info(`Connection: ${result.connection.string}`, 10000);
      }
      document.getElementById('db-name-input').value = '';
      document.getElementById('db-user-input').value = '';
      document.getElementById('db-pass-input').value = '';
      this.loadDatabases();
    } catch (err) {
      Toast.error('Failed: ' + err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Create Database';
    }
  },

  async runQuery() {
    const engine   = document.getElementById('sql-engine').value;
    const database = document.getElementById('sql-database').value.trim();
    const query    = document.getElementById('sql-query').value.trim();
    const result   = document.getElementById('sql-result');

    if (!query) return;

    result.innerHTML = '<div class="loading"><div class="spinner"></div> Running...</div>';

    try {
      const data = await API.post('/api/databases/query', { engine, database: database || null, query });
      if (data.raw) {
        result.innerHTML = `<pre>${esc(data.raw)}</pre>`;
      } else {
        result.innerHTML = '<pre>Query executed successfully</pre>';
      }
    } catch (err) {
      result.innerHTML = `<div class="error-result">${esc(err.message)}</div>`;
    }
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
