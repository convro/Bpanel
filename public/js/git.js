const Git = {
  currentDir: null,

  init() {
    document.getElementById('git-refresh-btn').addEventListener('click', () => {
      if (this.currentDir) this.loadStatus(this.currentDir);
    });
    document.getElementById('git-pull-btn').addEventListener('click', () => this.pull());
    document.getElementById('git-push-btn').addEventListener('click', () => this.push());
    document.getElementById('git-commit-btn').addEventListener('click', () => this.commit());
    document.getElementById('git-commit-msg').addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') this.commit();
    });
  },

  async loadStatus(dir) {
    this.currentDir = dir;
    const statusList = document.getElementById('git-status-list');
    const branchInfo = document.getElementById('git-branch-info');
    const logList    = document.getElementById('git-log-list');

    statusList.innerHTML = '<div class="git-placeholder"><div class="spinner" style="margin:0 auto"></div></div>';

    try {
      const data = await API.get(`/api/git/status?path=${encodeURIComponent(dir)}`);

      if (!data.isGit) {
        branchInfo.innerHTML = '<span style="color:var(--text-muted)">Not a git repository</span>';
        statusList.innerHTML = `
          <div class="git-placeholder">
            <p>Not a git repository.</p>
            <button class="btn btn-sm btn-primary" id="git-init-btn" style="margin-top:8px">
              <i data-lucide="git-branch" class="icon-xs"></i> Init Repository
            </button>
          </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: statusList });
        document.getElementById('git-init-btn').addEventListener('click', () => this.initRepo());
        logList.innerHTML = '';
        return;
      }

      const ahead = data.ahead || 0;
      const behind = data.behind || 0;
      branchInfo.innerHTML = `
        <i data-lucide="git-branch" class="icon-sm"></i>
        <strong>${esc(data.branch || 'HEAD')}</strong>
        ${ahead > 0 ? `<span class="badge badge-warning">${ahead} ahead</span>` : ''}
        ${behind > 0 ? `<span class="badge badge-warning">${behind} behind</span>` : ''}
        ${data.remote ? `<span style="font-size:11px;color:var(--text-muted)">${esc(data.remote)}</span>` : ''}
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: branchInfo });

      if (data.files.length === 0) {
        statusList.innerHTML = '<div class="git-placeholder" style="color:var(--success)"><i data-lucide="check-circle" class="icon-sm"></i> Working tree clean</div>';
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: statusList });
      } else {
        statusList.innerHTML = data.files.map(f => {
          const s = f.status || '?';
          const cls = s.includes('M') ? 'gs-M' : s.includes('A') ? 'gs-A' : s.includes('D') ? 'gs-D' : 'gs-?';
          const label = s.includes('M') ? 'M' : s.includes('A') ? 'A' : s.includes('D') ? 'D' : '?';
          return `
            <div class="git-file-row">
              <span class="git-status-badge ${cls}">${label}</span>
              <span class="git-file-path">${esc(f.path)}</span>
              ${!s.includes('?') ? `<button class="btn btn-sm btn-ghost discard-btn" data-file="${esc(f.path)}" style="padding:2px 6px;font-size:11px">Discard</button>` : ''}
            </div>`;
        }).join('');

        statusList.querySelectorAll('.discard-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm(`Discard changes to ${btn.dataset.file}?`)) return;
            try {
              await API.post('/api/git/discard', { path: this.currentDir, file: btn.dataset.file });
              Toast.success('Changes discarded');
              this.loadStatus(this.currentDir);
            } catch (err) { Toast.error(err.message); }
          });
        });
      }

      logList.innerHTML = data.log.slice(0, 8).map(entry => {
        const [hash, ...rest] = entry.split(' ');
        return `<div class="git-log-entry"><span>${esc(hash)}</span>${esc(rest.join(' '))}</div>`;
      }).join('') || '<div class="git-placeholder" style="padding:8px">No commits yet</div>';

    } catch (err) {
      statusList.innerHTML = `<div class="git-placeholder" style="color:var(--danger)">${esc(err.message)}</div>`;
    }
  },

  async initRepo() {
    try {
      await API.post('/api/git/init', { path: this.currentDir });
      Toast.success('Git repository initialized');
      this.loadStatus(this.currentDir);
    } catch (err) { Toast.error(err.message); }
  },

  async pull() {
    const btn = document.getElementById('git-pull-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
    try {
      const res = await API.post('/api/git/pull', { path: this.currentDir });
      Toast.success('Pulled: ' + (res.output || 'up to date'));
      this.loadStatus(this.currentDir);
    } catch (err) { Toast.error('Pull failed: ' + err.message); }
    finally { btn.disabled = false; btn.innerHTML = '<i data-lucide="download" class="icon-xs"></i> Pull'; if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn }); }
  },

  async push() {
    const btn = document.getElementById('git-push-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
    try {
      const res = await API.post('/api/git/push', { path: this.currentDir });
      Toast.success('Pushed: ' + (res.output || 'done'));
    } catch (err) { Toast.error('Push failed: ' + err.message); }
    finally { btn.disabled = false; btn.innerHTML = '<i data-lucide="upload" class="icon-xs"></i> Push'; if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn }); }
  },

  async commit() {
    const message = document.getElementById('git-commit-msg').value.trim();
    const addAll  = document.getElementById('git-add-all').checked;
    if (!message) { Toast.error('Commit message required'); return; }

    const btn = document.getElementById('git-commit-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
    try {
      const res = await API.post('/api/git/commit', { path: this.currentDir, message, addAll });
      document.getElementById('git-commit-msg').value = '';
      Toast.success('Committed: ' + message);
      this.loadStatus(this.currentDir);
    } catch (err) { Toast.error('Commit failed: ' + err.message); }
    finally { btn.disabled = false; btn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> Commit'; if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn }); }
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
