const App = {
  currentUser: null,
  currentSessionId: null,
  currentSessionData: null,

  async init() {
    try {
      Auth.init();
      Sessions.init();
      FileManager.init();
      Editor.init();
      Domains.init();
      SSL.init();
      SystemInfo.init();
      Databases.init();
      Processes.init();
      Logs.init();
      Git.init();

      if (typeof BTerminal !== 'undefined') {
        try { BTerminal.init(); } catch (e) { console.warn('Terminal init failed:', e); }
      }

      this.initSidebar();
      this.initResizeHandles();
      this.initCommandPalette();
      this.initWsTabButtons();
      this.initModalClosers();

      document.getElementById('back-to-sessions').addEventListener('click', () => this.closeSession());
      document.getElementById('ws-logout-btn').addEventListener('click', () => Auth.logout());

      const status = await Auth.checkStatus();
      if (status.user) {
        this.currentUser = status.user;
        document.getElementById('user-display').textContent = '@' + status.user.username;
        this.showView('dashboard');
      } else {
        this.showView('auth');
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('Bpanel init error:', err);
      this.showView('auth');
    }
  },

  showView(view) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    switch (view) {
      case 'auth':
        document.getElementById('auth-view').style.display = '';
        break;
      case 'dashboard':
        document.getElementById('dashboard-view').style.display = 'flex';
        Sessions.load();
        this.loadServerIP();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        break;
      case 'workspace':
        document.getElementById('workspace-view').style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        break;
    }
  },

  async loadServerIP() {
    try {
      const sys = await API.get('/api/system/info');
      const ip = sys.hostname || '';
      document.querySelectorAll('#server-ip-display, #server-ip-topbar').forEach(el => {
        if (el) el.textContent = ip;
      });
    } catch {}
  },

  initSidebar() {
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.dash-panel').forEach(p => { p.style.display = 'none'; });
        const panel = document.getElementById(`panel-${tab}`);
        if (panel) panel.style.display = 'block';

        if (tab === 'domains')   Domains.load();
        if (tab === 'ssl')       SSL.load();
        if (tab === 'system')    SystemInfo.load();
        if (tab === 'databases') Databases.load();
        if (tab === 'processes') Processes.load();
        if (tab === 'logs')      Logs.loadSources();

        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });
  },

  initModalClosers() {
    // Close modals on backdrop click or X button
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.close;
        if (id) document.getElementById(id).style.display = 'none';
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => { if (m.style.display !== 'none') m.style.display = 'none'; });
        const palette = document.getElementById('cmd-palette-overlay');
        if (palette && palette.style.display !== 'none') this.closeCmdPalette();
      }
    });
  },

  initWsTabButtons() {
    document.querySelectorAll('.ws-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.wsTab;
        document.querySelectorAll('.ws-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('ws-editor-panel').style.display = tab === 'editor' ? 'flex' : 'none';
        document.getElementById('ws-git-panel').style.display   = tab === 'git'    ? 'flex' : 'none';

        if (tab === 'git' && this.currentSessionData) {
          Git.loadStatus(this.currentSessionData.working_directory);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });
  },

  async openSession(sessionId) {
    try {
      const session = await API.get(`/api/sessions/${sessionId}`);
      this.currentSessionId = session.id;
      this.currentSessionData = session;
      document.getElementById('session-title').textContent = session.name;
      this.showView('workspace');
      FileManager.loadDir(session.working_directory);
      Git.currentDir = session.working_directory;
    } catch (err) {
      Toast.error('Failed to open session: ' + err.message);
    }
  },

  closeSession() {
    try { BTerminal.destroy(); } catch {}
    Editor.closeAll();
    this.currentSessionId = null;
    this.currentSessionData = null;
    this.showView('dashboard');
    Sessions.load();
  },

  initResizeHandles() {
    // Horizontal resize (file sidebar)
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('resize-handle');
    let dragging = false;
    handle.addEventListener('mousedown', (e) => { dragging = true; handle.classList.add('active'); e.preventDefault(); });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const width = Math.max(160, Math.min(600, e.clientX));
      sidebar.style.width = width + 'px';
    });
    document.addEventListener('mouseup', () => { if (dragging) { dragging = false; handle.classList.remove('active'); } });

    // Vertical resize (terminal)
    const termArea = document.getElementById('terminal-area');
    const handleH = document.getElementById('resize-handle-h');
    let draggingH = false;
    handleH.addEventListener('mousedown', (e) => { draggingH = true; handleH.classList.add('active'); e.preventDefault(); });
    document.addEventListener('mousemove', (e) => {
      if (!draggingH) return;
      const main = document.querySelector('.ws-main');
      if (!main) return;
      const rect = main.getBoundingClientRect();
      const height = Math.max(100, Math.min(rect.height - 100, rect.bottom - e.clientY));
      termArea.style.height = height + 'px';
      try { BTerminal.fit(); } catch {}
    });
    document.addEventListener('mouseup', () => {
      if (draggingH) { draggingH = false; handleH.classList.remove('active'); try { BTerminal.fit(); } catch {} }
    });
  },

  // ===== COMMAND PALETTE =====
  initCommandPalette() {
    document.getElementById('cmd-palette-btn').addEventListener('click', () => this.openCmdPalette());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openCmdPalette();
      }
    });

    document.getElementById('cmd-palette-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeCmdPalette();
    });

    const input = document.getElementById('cmd-input');
    input.addEventListener('input', () => this.updateCmdResults(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeCmdPalette();
      if (e.key === 'ArrowDown') this.moveCmdSelection(1);
      if (e.key === 'ArrowUp') this.moveCmdSelection(-1);
      if (e.key === 'Enter') this.executeCmdSelection();
    });
  },

  openCmdPalette() {
    const overlay = document.getElementById('cmd-palette-overlay');
    overlay.style.display = 'flex';
    const input = document.getElementById('cmd-input');
    input.value = '';
    input.focus();
    this.updateCmdResults('');
  },

  closeCmdPalette() {
    document.getElementById('cmd-palette-overlay').style.display = 'none';
  },

  _cmdActions: [
    { label: 'Sessions', icon: 'layout-grid', desc: 'Go to sessions', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="sessions"]').click(); } },
    { label: 'Domains', icon: 'globe', desc: 'Manage domains', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="domains"]').click(); } },
    { label: 'SSL Certificates', icon: 'shield-check', desc: 'Manage SSL certs', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="ssl"]').click(); } },
    { label: 'Databases', icon: 'database', desc: 'Manage databases', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="databases"]').click(); } },
    { label: 'Processes', icon: 'cpu', desc: 'View running processes', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="processes"]').click(); } },
    { label: 'Logs', icon: 'scroll-text', desc: 'View system logs', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="logs"]').click(); } },
    { label: 'System Info', icon: 'monitor', desc: 'Server information', tag: 'navigate', action: () => { document.querySelector('.sidebar-item[data-tab="system"]').click(); } },
    { label: 'New Session', icon: 'plus', desc: 'Create a new workspace session', tag: 'action', action: () => { document.querySelector('.sidebar-item[data-tab="sessions"]')?.click(); setTimeout(() => document.getElementById('new-session-btn')?.click(), 100); } },
    { label: 'Add Domain', icon: 'globe', desc: 'Configure a new domain', tag: 'action', action: () => { document.querySelector('.sidebar-item[data-tab="domains"]')?.click(); setTimeout(() => document.getElementById('add-domain-btn')?.click(), 100); } },
    { label: 'Issue SSL', icon: 'shield-check', desc: 'Get a Let\'s Encrypt certificate', tag: 'action', action: () => { document.querySelector('.sidebar-item[data-tab="ssl"]')?.click(); setTimeout(() => document.getElementById('issue-ssl-btn')?.click(), 100); } },
    { label: 'Create Database', icon: 'database', desc: 'Set up a new database', tag: 'action', action: () => { document.querySelector('.sidebar-item[data-tab="databases"]')?.click(); setTimeout(() => document.getElementById('create-db-btn')?.click(), 100); } },
    { label: 'Logout', icon: 'log-out', desc: 'Sign out of Bpanel', tag: 'action', action: () => Auth.logout() },
  ],

  _cmdSelected: -1,

  updateCmdResults(query) {
    const results = document.getElementById('cmd-results');
    const q = query.toLowerCase().trim();

    let items = [...this._cmdActions];

    // Include sessions dynamically
    const sessions = document.querySelectorAll('.session-card');
    sessions.forEach(card => {
      const name = card.querySelector('.session-card-name')?.textContent?.trim();
      if (name) {
        items.push({
          label: name, icon: 'folder-open', desc: 'Open session', tag: 'session',
          action: () => {
            const id = card.dataset.id;
            if (id) this.openSession(parseInt(id));
          }
        });
      }
    });

    const filtered = q ? items.filter(i =>
      i.label.toLowerCase().includes(q) || (i.desc && i.desc.toLowerCase().includes(q))
    ) : items;

    this._cmdSelected = -1;

    if (filtered.length === 0) {
      results.innerHTML = `<div class="cmd-empty">No results for "${query}"</div>`;
      return;
    }

    results.innerHTML = filtered.map((item, i) => `
      <div class="cmd-result-item" data-idx="${i}">
        <i data-lucide="${item.icon}" class="icon-sm cmd-result-icon"></i>
        <div style="flex:1">
          <div class="cmd-result-label">${esc(item.label)}</div>
          ${item.desc ? `<div class="cmd-result-desc">${esc(item.desc)}</div>` : ''}
        </div>
        <span class="cmd-result-tag">${item.tag}</span>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: results });

    this._filteredCmds = filtered;

    results.querySelectorAll('.cmd-result-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        filtered[i].action();
        this.closeCmdPalette();
      });
      el.addEventListener('mouseenter', () => {
        results.querySelectorAll('.cmd-result-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        this._cmdSelected = i;
      });
    });
  },

  moveCmdSelection(dir) {
    const items = document.querySelectorAll('.cmd-result-item');
    if (!items.length) return;
    this._cmdSelected = Math.max(-1, Math.min(items.length - 1, this._cmdSelected + dir));
    items.forEach((el, i) => el.classList.toggle('selected', i === this._cmdSelected));
    if (this._cmdSelected >= 0) items[this._cmdSelected].scrollIntoView({ block: 'nearest' });
  },

  executeCmdSelection() {
    if (this._cmdSelected >= 0 && this._filteredCmds && this._filteredCmds[this._cmdSelected]) {
      this._filteredCmds[this._cmdSelected].action();
      this.closeCmdPalette();
    }
  },

  _filteredCmds: [],
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

document.addEventListener('DOMContentLoaded', () => App.init());
