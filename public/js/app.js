const App = {
  currentUser: null,
  currentSessionId: null,

  async init() {
    Auth.init();
    Sessions.init();
    FileManager.init();
    Editor.init();
    Terminal.init();
    this.initResizeHandles();

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
    Terminal.destroy();
    Editor.closeAll();
    this.currentSessionId = null;
    this.showView('sessions');
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
      Terminal.fit();
    });

    document.addEventListener('mouseup', () => {
      if (draggingH) {
        draggingH = false;
        handleH.classList.remove('active');
        Terminal.fit();
      }
    });
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
