const App = {
  currentUser: null,
  currentSessionId: null,

  async init() {
    try {
      Auth.init();
      Sessions.init();
      FileManager.init();
      Editor.init();
      Domains.init();
      SSL.init();
      SystemInfo.init();

      // Terminal init is optional - depends on CDN xterm loading
      if (typeof BTerminal !== 'undefined' && BTerminal.init) {
        try { BTerminal.init(); } catch (e) { console.warn('Terminal init failed:', e); }
      }

      this.initResizeHandles();
      this.initTabs();

      document.getElementById('back-to-sessions').addEventListener('click', () => this.closeSession());
      document.getElementById('ws-logout-btn').addEventListener('click', () => Auth.logout());

      // Check auth status
      const status = await Auth.checkStatus();
      if (status.user) {
        this.currentUser = status.user;
        this.showView('sessions');
      } else {
        this.showView('auth');
      }
    } catch (err) {
      console.error('Bpanel init error:', err);
      // Fallback: show auth view
      this.showView('auth');
    }
  },

  showView(view) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');

    switch (view) {
      case 'auth':
        document.getElementById('auth-view').style.display = 'block';
        break;
      case 'sessions':
        document.getElementById('sessions-view').style.display = 'block';
        Sessions.load();
        break;
      case 'workspace':
        document.getElementById('workspace-view').style.display = 'block';
        break;
    }
  },

  async openSession(sessionId) {
    try {
      const session = await API.get(`/api/sessions/${sessionId}`);
      this.currentSessionId = session.id;
      document.getElementById('session-title').textContent = session.name;
      this.showView('workspace');
      FileManager.loadDir(session.working_directory);
    } catch (err) {
      alert('Failed to open session: ' + err.message);
    }
  },

  closeSession() {
    try { BTerminal.destroy(); } catch {}
    Editor.closeAll();
    this.currentSessionId = null;
    this.showView('sessions');
  },

  initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = tab === 'files' ? 'flex' : 'block';

        if (tab === 'domains') Domains.load();
        if (tab === 'ssl') SSL.load();
        if (tab === 'system') SystemInfo.load();

        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });
  },

  initResizeHandles() {
    // Sidebar horizontal resize
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('resize-handle');
    let dragging = false;

    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      handle.classList.add('active');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const width = Math.max(180, Math.min(600, e.clientX));
      sidebar.style.width = width + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        handle.classList.remove('active');
      }
    });

    // Terminal vertical resize
    const termArea = document.getElementById('terminal-area');
    const handleH = document.getElementById('resize-handle-h');
    let draggingH = false;

    handleH.addEventListener('mousedown', (e) => {
      draggingH = true;
      handleH.classList.add('active');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!draggingH) return;
      const mainArea = document.querySelector('.main-area');
      const rect = mainArea.getBoundingClientRect();
      const height = Math.max(100, Math.min(rect.height - 100, rect.bottom - e.clientY));
      termArea.style.height = height + 'px';
      try { BTerminal.fit(); } catch {}
    });

    document.addEventListener('mouseup', () => {
      if (draggingH) {
        draggingH = false;
        handleH.classList.remove('active');
        try { BTerminal.fit(); } catch {}
      }
    });
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
