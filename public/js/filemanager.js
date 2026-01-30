const FileManager = {
  currentPath: '/',
  entries: [],
  activeFile: null,
  history: [],

  init() {
    document.getElementById('go-up-btn').addEventListener('click', () => this.goUp());
    document.getElementById('refresh-btn').addEventListener('click', () => this.loadDir(this.currentPath));
    document.getElementById('new-file-btn').addEventListener('click', () => this.promptNewFile());
    document.getElementById('new-folder-btn').addEventListener('click', () => this.promptNewFolder());
    document.addEventListener('click', () => this.dismissContextMenu());
  },

  async loadDir(dirPath) {
    try {
      const data = await API.get(`/api/files/list?path=${encodeURIComponent(dirPath)}`);
      if (this.currentPath !== data.path) {
        this.history.push(this.currentPath);
      }
      this.currentPath = data.path;
      this.entries = data.entries;
      this.render();
      this.renderBreadcrumbs();
      document.getElementById('current-path').textContent = this.currentPath;
    } catch (err) {
      alert('Cannot open directory: ' + err.message);
    }
  },

  renderBreadcrumbs() {
    const container = document.getElementById('path-breadcrumbs');
    const parts = this.currentPath.split('/').filter(Boolean);
    let html = `<span class="breadcrumb-item" data-path="/">/</span>`;
    let accumulated = '';
    for (const part of parts) {
      accumulated += '/' + part;
      html += `<span class="breadcrumb-sep">/</span><span class="breadcrumb-item" data-path="${this.escapeAttr(accumulated)}">${this.escapeHtml(part)}</span>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.breadcrumb-item').forEach(el => {
      el.addEventListener('click', () => this.loadDir(el.dataset.path));
    });
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
        <span class="icon"><i data-lucide="${e.isDirectory ? 'folder' : this.fileIcon(e.name)}" class="file-icon"></i></span>
        <span class="name">${this.escapeHtml(e.name)}</span>
        ${!e.isDirectory ? `<span class="size">${this.formatSize(e.size)}</span>` : ''}
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    tree.querySelectorAll('.file-entry').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.isdir === 'true') {
          this.loadDir(el.dataset.path);
        } else {
          this.openFile(el.dataset.path);
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
    this.loadDir('/' + parts.join('/'));
  },

  showContextMenu(x, y, path, isDir, name) {
    this.dismissContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    const items = [];
    if (isDir) {
      items.push({ icon: 'folder-open', label: 'Open', action: () => this.loadDir(path) });
      items.push({ icon: 'terminal', label: 'Open in Terminal', action: () => this.openInTerminal(path) });
    } else {
      items.push({ icon: 'file-edit', label: 'Edit', action: () => this.openFile(path) });
      items.push({ icon: 'copy', label: 'Duplicate', action: () => this.duplicateFile(path, name) });
    }
    items.push({ divider: true });
    items.push({ icon: 'pencil', label: 'Rename', action: () => this.promptRename(path, name) });
    items.push({ icon: 'clipboard-copy', label: 'Copy Path', action: () => { navigator.clipboard.writeText(path); } });
    items.push({ divider: true });
    items.push({ icon: 'trash-2', label: 'Delete', action: () => this.deleteEntry(path, name), danger: true });

    items.forEach(item => {
      if (item.divider) {
        const d = document.createElement('div');
        d.className = 'context-menu-divider';
        menu.appendChild(d);
        return;
      }
      const el = document.createElement('div');
      el.className = 'context-menu-item' + (item.danger ? ' danger' : '');
      el.innerHTML = `<i data-lucide="${item.icon}" class="icon-sm"></i> ${item.label}`;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissContextMenu();
        item.action();
      });
      menu.appendChild(el);
    });

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
  },

  dismissContextMenu() {
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
  },

  openInTerminal(dirPath) {
    BTerminal.show();
    if (BTerminal.socket && BTerminal.socket.connected) {
      BTerminal.term.write(`cd ${dirPath}\r`);
      if (BTerminal.socket) BTerminal.socket.emit('data', `cd ${dirPath}\n`);
    }
  },

  async duplicateFile(filePath, name) {
    try {
      const data = await API.get(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
      const base = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
      const newPath = this.currentPath + '/' + base + '_copy' + ext;
      await API.post('/api/files/save', { path: newPath, content: data.content });
      this.loadDir(this.currentPath);
    } catch (err) {
      alert('Duplicate failed: ' + err.message);
    }
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
      try {
        await API.post('/api/files/rename', { oldPath, newPath: dir + newName });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Rename failed: ' + err.message);
      }
    });
  },

  promptNewFile() {
    this.showPrompt('New File', '', async (name) => {
      if (!name) return;
      try {
        await API.post('/api/files/save', { path: this.currentPath + '/' + name, content: '' });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Create failed: ' + err.message);
      }
    });
  },

  promptNewFolder() {
    this.showPrompt('New Folder', '', async (name) => {
      if (!name) return;
      try {
        await API.post('/api/files/mkdir', { path: this.currentPath + '/' + name });
        this.loadDir(this.currentPath);
      } catch (err) {
        alert('Create failed: ' + err.message);
      }
    });
  },

  showPrompt(title, defaultValue, callback) {
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
    const close = () => { overlay.remove(); prompt.remove(); };
    overlay.addEventListener('click', close);
    prompt.querySelector('.cancel-prompt').addEventListener('click', close);
    prompt.querySelector('.confirm-prompt').addEventListener('click', () => { callback(input.value.trim()); close(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { callback(input.value.trim()); close(); }
      if (e.key === 'Escape') close();
    });
  },

  fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const map = {
      js: 'file-json', mjs: 'file-json', cjs: 'file-json',
      ts: 'file-type', tsx: 'file-type',
      jsx: 'file-code-2',
      py: 'file-code', rb: 'file-code', go: 'file-code', rs: 'file-code', java: 'file-code', c: 'file-code', cpp: 'file-code', h: 'file-code',
      html: 'file-code-2', htm: 'file-code-2', xml: 'file-code-2', svg: 'file-code-2',
      css: 'file-code-2', scss: 'file-code-2', less: 'file-code-2',
      json: 'file-json', yaml: 'file-cog', yml: 'file-cog', toml: 'file-cog',
      md: 'file-text', txt: 'file-text', log: 'file-text', csv: 'file-text',
      sh: 'file-terminal', bash: 'file-terminal', zsh: 'file-terminal',
      env: 'file-lock', lock: 'file-lock',
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', ico: 'image', bmp: 'image',
      zip: 'file-archive', tar: 'file-archive', gz: 'file-archive', rar: 'file-archive', '7z': 'file-archive',
      pdf: 'file-text',
      sql: 'database', db: 'database', sqlite: 'database',
      php: 'file-code',
      vue: 'file-code-2', svelte: 'file-code-2',
      dockerfile: 'container',
      makefile: 'file-cog',
    };
    return map[ext] || 'file';
  },

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  },

  escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
  escapeAttr(str) { return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); },
};
