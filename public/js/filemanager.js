const FileManager = {
  currentPath: '/',
  entries: [],
  activeFile: null,

  init() {
    document.getElementById('go-up-btn').addEventListener('click', () => this.goUp());
    document.getElementById('refresh-btn').addEventListener('click', () => this.loadDir(this.currentPath));
    document.getElementById('new-file-btn').addEventListener('click', () => this.promptNewFile());
    document.getElementById('new-folder-btn').addEventListener('click', () => this.promptNewFolder());

    // Context menu dismiss
    document.addEventListener('click', () => this.dismissContextMenu());
  },

  async loadDir(dirPath) {
    try {
      const data = await API.get(`/api/files/list?path=${encodeURIComponent(dirPath)}`);
      this.currentPath = data.path;
      this.entries = data.entries;
      this.render();
      document.getElementById('current-path').textContent = this.currentPath;
    } catch (err) {
      alert('Cannot open directory: ' + err.message);
    }
  },

  render() {
    const tree = document.getElementById('file-tree');
    if (this.entries.length === 0) {
      tree.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-size:13px">Empty directory</div>';
      return;
    }

    tree.innerHTML = this.entries.map(e => `
      <div class="file-entry ${e.isDirectory ? 'is-dir' : ''} ${this.activeFile === e.path ? 'active' : ''}"
           data-path="${this.escapeAttr(e.path)}" data-isdir="${e.isDirectory}" data-name="${this.escapeAttr(e.name)}">
        <span class="icon">${e.isDirectory ? '📁' : this.fileIcon(e.name)}</span>
        <span class="name">${this.escapeHtml(e.name)}</span>
        ${!e.isDirectory ? `<span class="size">${this.formatSize(e.size)}</span>` : ''}
      </div>
    `).join('');

    tree.querySelectorAll('.file-entry').forEach(el => {
      el.addEventListener('click', () => {
        const path = el.dataset.path;
        const isDir = el.dataset.isdir === 'true';
        if (isDir) {
          this.loadDir(path);
        } else {
          this.openFile(path);
        }
      });

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY, el.dataset.path, el.dataset.isdir === 'true', el.dataset.name);
      });
    });
  },

  async openFile(filePath) {
    try {
      const data = await API.get(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      this.activeFile = filePath;
      this.render();
      Editor.openFile(filePath, data.content);
    } catch (err) {
      alert('Cannot read file: ' + err.message);
    }
  },

  goUp() {
    if (this.currentPath === '/') return;
    const parts = this.currentPath.split('/').filter(Boolean);
    parts.pop();
    const parent = '/' + parts.join('/');
    this.loadDir(parent);
  },

  showContextMenu(x, y, path, isDir, name) {
    this.dismissContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    const items = [];
    if (isDir) {
      items.push({ label: 'Open', action: () => this.loadDir(path) });
    } else {
      items.push({ label: 'Open', action: () => this.openFile(path) });
    }
    items.push({ label: 'Rename', action: () => this.promptRename(path, name) });
    items.push({ divider: true });
    items.push({ label: 'Delete', action: () => this.deleteEntry(path, name), danger: true });

    items.forEach(item => {
      if (item.divider) {
        menu.innerHTML += '<div class="context-menu-divider"></div>';
        return;
      }
      const el = document.createElement('div');
      el.className = 'context-menu-item' + (item.danger ? ' danger' : '');
      el.textContent = item.label;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissContextMenu();
        item.action();
      });
      menu.appendChild(el);
    });

    document.body.appendChild(menu);

    // Keep in viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
  },

  dismissContextMenu() {
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
  },

  async deleteEntry(path, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await API.del(`/api/files?path=${encodeURIComponent(path)}`);
      this.loadDir(this.currentPath);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  },

  promptRename(oldPath, oldName) {
    this.showPrompt('Rename', oldName, async (newName) => {
      if (!newName || newName === oldName) return;
      const dir = oldPath.substring(0, oldPath.length - oldName.length);
      const newPath = dir + newName;
      try {
        await API.post('/api/files/rename', { oldPath, newPath });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Rename failed: ' + err.message);
      }
    });
  },

  promptNewFile() {
    this.showPrompt('New File', '', async (name) => {
      if (!name) return;
      const filePath = this.currentPath + '/' + name;
      try {
        await API.post('/api/files/save', { path: filePath, content: '' });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Create failed: ' + err.message);
      }
    });
  },

  promptNewFolder() {
    this.showPrompt('New Folder', '', async (name) => {
      if (!name) return;
      const dirPath = this.currentPath + '/' + name;
      try {
        await API.post('/api/files/mkdir', { path: dirPath });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Create failed: ' + err.message);
      }
    });
  },

  showPrompt(title, defaultValue, callback) {
    // Remove existing
    document.querySelectorAll('.inline-prompt, .prompt-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';

    const prompt = document.createElement('div');
    prompt.className = 'inline-prompt';
    prompt.innerHTML = `
      <h4>${title}</h4>
      <input type="text" value="${this.escapeAttr(defaultValue)}" autofocus>
      <div class="prompt-actions">
        <button class="btn cancel-prompt">Cancel</button>
        <button class="btn btn-primary confirm-prompt">OK</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(prompt);

    const input = prompt.querySelector('input');
    input.focus();
    input.select();

    const close = () => {
      overlay.remove();
      prompt.remove();
    };

    overlay.addEventListener('click', close);
    prompt.querySelector('.cancel-prompt').addEventListener('click', close);
    prompt.querySelector('.confirm-prompt').addEventListener('click', () => {
      callback(input.value.trim());
      close();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { callback(input.value.trim()); close(); }
      if (e.key === 'Escape') close();
    });
  },

  fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      js: '📜', ts: '📘', py: '🐍', rb: '💎', go: '🔷', rs: '🦀',
      html: '🌐', css: '🎨', json: '📋', md: '📝', yml: '⚙️', yaml: '⚙️',
      sh: '⚡', bash: '⚡', txt: '📄', log: '📋', env: '🔒',
      png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🖼️',
      zip: '📦', tar: '📦', gz: '📦',
    };
    return icons[ext] || '📄';
  },

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },
};
