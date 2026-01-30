const Sessions = {
  list: [],

  init() {
    document.getElementById('new-session-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-session').addEventListener('click', () => this.hideModal());
    document.getElementById('create-session').addEventListener('click', () => this.create());
    document.getElementById('logout-btn').addEventListener('click', () => Auth.logout());

    // Enter key in modal
    document.getElementById('session-dir').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.create();
    });
  },

  showModal() {
    document.getElementById('new-session-modal').style.display = 'flex';
    document.getElementById('session-name').focus();
  },

  hideModal() {
    document.getElementById('new-session-modal').style.display = 'none';
    document.getElementById('session-name').value = '';
    document.getElementById('session-dir').value = '/root';
  },

  async load() {
    this.list = await API.get('/api/sessions');
    this.render();
    if (App.currentUser) {
      document.getElementById('user-display').textContent = App.currentUser.username;
    }
  },

  render() {
    const container = document.getElementById('sessions-list');
    if (this.list.length === 0) {
      container.innerHTML = '<div class="no-sessions"><p>No sessions yet. Create one to get started.</p></div>';
      return;
    }

    container.innerHTML = this.list.map(s => `
      <div class="session-card" data-id="${s.id}">
        <div class="session-card-info">
          <h3>${this.escapeHtml(s.name)}</h3>
          <p>${this.escapeHtml(s.working_directory)}</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="session-card-meta">
            ${this.formatDate(s.last_accessed)}
          </div>
          <div class="session-card-actions">
            <button class="btn btn-sm btn-danger delete-session" data-id="${s.id}" title="Delete">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    // Click to open
    container.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.delete-session')) return;
        const id = card.dataset.id;
        App.openSession(id);
      });
    });

    // Delete buttons
    container.querySelectorAll('.delete-session').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Delete this session?')) {
          await API.del(`/api/sessions/${id}`);
          this.load();
        }
      });
    });
  },

  async create() {
    const name = document.getElementById('session-name').value.trim();
    const dir = document.getElementById('session-dir').value.trim();

    if (!name || !dir) return;

    try {
      const session = await API.post('/api/sessions', { name, working_directory: dir });
      this.hideModal();
      App.openSession(session.id);
    } catch (err) {
      alert(err.message);
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
