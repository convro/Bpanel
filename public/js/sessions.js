const Sessions = {
  init() {
    document.getElementById('new-session-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-session').addEventListener('click', () => this.hideModal());
    document.getElementById('create-session').addEventListener('click', () => this.createSession());
    document.getElementById('session-name').addEventListener('keydown', e => { if (e.key === 'Enter') this.createSession(); });
    document.getElementById('session-dir').addEventListener('keydown', e => { if (e.key === 'Enter') this.createSession(); });
  },

  showModal() {
    document.getElementById('new-session-modal').style.display = 'flex';
    document.getElementById('session-name').focus();
  },
  hideModal() { document.getElementById('new-session-modal').style.display = 'none'; },

  async load() {
    try {
      const sessions = await API.get('/api/sessions');
      this.render(sessions);
    } catch (err) {
      document.getElementById('sessions-list').innerHTML =
        `<div class="session-empty">Failed to load sessions: ${esc(err.message)}</div>`;
    }
  },

  render(sessions) {
    const container = document.getElementById('sessions-list');
    if (sessions.length === 0) {
      container.innerHTML = `
        <div class="session-empty">
          <i data-lucide="layout-grid" style="width:40px;height:40px;opacity:0.15;margin-bottom:12px;display:block;margin-inline:auto"></i>
          <p>No sessions yet. Create one to start editing.</p>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: container });
      return;
    }

    container.innerHTML = sessions.map(s => `
      <div class="session-card" data-id="${s.id}">
        <div class="session-card-name">
          <i data-lucide="folder-open" class="icon-sm" style="color:var(--accent-2)"></i>
          ${esc(s.name)}
        </div>
        <div class="session-card-dir">${esc(s.working_directory)}</div>
        <div class="session-card-time">Last used ${timeAgo(s.last_accessed)}</div>
        <div class="session-card-actions">
          <button class="btn btn-sm btn-primary open-session" data-id="${s.id}">
            <i data-lucide="play" class="icon-xs"></i> Open
          </button>
          <button class="btn btn-sm btn-danger delete-session" data-id="${s.id}">
            <i data-lucide="trash-2" class="icon-xs"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: container });

    container.querySelectorAll('.open-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.openSession(parseInt(btn.dataset.id));
      });
    });

    container.querySelectorAll('.delete-session').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this session?')) return;
        try {
          await API.del(`/api/sessions/${btn.dataset.id}`);
          this.load();
        } catch (err) { Toast.error(err.message); }
      });
    });

    // Also open on card click
    container.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.session-card-actions')) return;
        App.openSession(parseInt(card.dataset.id));
      });
    });
  },

  async createSession() {
    const name = document.getElementById('session-name').value.trim();
    const dir  = document.getElementById('session-dir').value.trim();
    if (!name) return Toast.error('Session name required');
    if (!dir)  return Toast.error('Working directory required');

    try {
      await API.post('/api/sessions', { name, working_directory: dir });
      this.hideModal();
      document.getElementById('session-name').value = '';
      this.load();
    } catch (err) { Toast.error('Failed: ' + err.message); }
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function timeAgo(isoStr) {
  if (!isoStr) return 'never';
  const diff = (Date.now() - new Date(isoStr + 'Z').getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}
