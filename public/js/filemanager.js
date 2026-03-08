const FileManager = {
  currentPath: '/',
  entries: [],
  activeFile: null,

  init() {
    document.getElementById('go-up-btn').addEventListener('click', () => this.goUp());
    document.getElementById('refresh-btn').addEventListener('click', () => this.loadDir(this.currentPath));
    document.getElementById('new-file-btn').addEventListener('click', () => this.promptNewFile());
    document.getElementById('new-folder-btn').addEventListener('click', () => this.promptNewFolder());
    document.getElementById('upload-btn').addEventListener('click', () => this.toggleUploadZone());

    // File input for upload
    const fileInput = document.getElementById('upload-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', () => this.uploadFiles(fileInput.files));
    }

    // Drag & drop on workspace
    const workspace = document.querySelector('.workspace');
    if (workspace) {
      workspace.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
      workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) this.uploadFiles(e.dataTransfer.files);
      });
    }

    // Drag & drop on dropzone
    const dropzone = document.getElementById('upload-dropzone');
    if (dropzone) {
      dropzone.addEventListener('click', () => document.getElementById('upload-file-input').click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) this.uploadFiles(e.dataTransfer.files);
      });
    }

    document.addEventListener('click', () => this.dismissContextMenu());
  },

  toggleUploadZone() {
    const zone = document.getElementById('upload-dropzone');
    zone.style.display = zone.style.display === 'none' ? '' : 'none';
  },

  async uploadFiles(files) {
    if (!files || files.length === 0) return;

    const toast = Toast.info(`Uploading ${files.length} file(s)...`, 0);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      fd.append('path', this.currentPath);

      const result = await API.upload('/api/files/upload', fd);
      Toast.success(`Uploaded ${result.uploaded.length} file(s)`);
      this.loadDir(this.currentPath);
      if (toast) toast.remove();

      // Hide dropzone after upload
      const zone = document.getElementById('upload-dropzone');
      if (zone) zone.style.display = 'none';
      const input = document.getElementById('upload-file-input');
      if (input) input.value = '';
    } catch (err) {
      if (toast) toast.remove();
      Toast.error('Upload failed: ' + err.message);
    }
  },

  async loadDir(dirPath) {
    try {
      const data = await API.get(`/api/files/list?path=${encodeURIComponent(dirPath)}`);
      this.currentPath = data.path;
      this.entries = data.entries;
      this.render();
      this.renderBreadcrumbs();
      document.getElementById('current-path').textContent = this.currentPath;
      // Refresh git status when navigating
      if (App.currentSessionData) {
        const wsPanel = document.getElementById('ws-git-panel');
        if (wsPanel && wsPanel.style.display !== 'none') {
          Git.loadStatus(this.currentPath);
        }
        Git.currentDir = this.currentPath;
      }
    } catch (err) {
      Toast.error('Cannot open directory: ' + err.message);
    }
  },

  renderBreadcrumbs() {
    const container = document.getElementById('path-breadcrumbs');
    const parts = this.currentPath.split('/').filter(Boolean);
    let html = `<span class="breadcrumb-item" data-path="/">/</span>`;
    let accumulated = '';
    for (const part of parts) {
      accumulated += '/' + part;
      html += `<span class="breadcrumb-sep">/</span><span class="breadcrumb-item" data-path="${ea(accumulated)}">${eh(part)}</span>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.breadcrumb-item').forEach(el => {
      el.addEventListener('click', () => this.loadDir(el.dataset.path));
    });
  },

  render() {
    const tree = document.getElementById('file-tree');
    if (this.entries.length === 0) {
      tree.innerHTML = '<div style="padding:12px 16px;color:var(--text-muted);font-size:12px">Empty directory</div>';
      return;
    }

    tree.innerHTML = this.entries.map(e => `
      <div class="file-entry ${e.isDirectory ? 'is-dir' : ''} ${this.activeFile === e.path ? 'active' : ''}"
           data-path="${ea(e.path)}" data-isdir="${e.isDirectory}" data-name="${ea(e.name)}">
        <i data-lucide="${e.isDirectory ? 'folder' : this.fileIcon(e.name)}" class="file-icon"></i>
        <span class="name">${eh(e.name)}</span>
        ${!e.isDirectory ? `<span class="size">${fmtSize(e.size)}</span>` : ''}
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: tree });

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
      Toast.error('Cannot read file: ' + err.message);
    }
  },

  goUp() {
    if (this.currentPath === '/') return;
    const parts = this.currentPath.split('/').filter(Boolean);
    parts.pop();
    this.loadDir('/' + parts.join('/') || '/');
  },

  showContextMenu(x, y, path, isDir, name) {
    this.dismissContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';

    const items = [];
    if (isDir) {
      items.push({ icon: 'folder-open', label: 'Open', action: () => this.loadDir(path) });
      items.push({ icon: 'terminal', label: 'Open in Terminal', action: () => this.openInTerminal(path) });
      items.push({ icon: 'download', label: 'Download as ZIP', action: () => this.downloadEntry(path) });
    } else {
      items.push({ icon: 'file-edit', label: 'Edit', action: () => this.openFile(path) });
      items.push({ icon: 'download', label: 'Download', action: () => this.downloadEntry(path) });
      items.push({ icon: 'copy', label: 'Duplicate', action: () => this.duplicateFile(path, name) });
    }
    items.push({ divider: true });
    items.push({ icon: 'pencil', label: 'Rename', action: () => this.promptRename(path, name) });
    items.push({ icon: 'clipboard-copy', label: 'Copy Path', action: () => { navigator.clipboard?.writeText(path); Toast.info('Path copied'); } });
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
      el.innerHTML = `<i data-lucide="${item.icon}" class="icon-sm"></i> ${eh(item.label)}`;
      el.addEventListener('click', (e) => { e.stopPropagation(); this.dismissContextMenu(); item.action(); });
      menu.appendChild(el);
    });

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons({ el: menu });

    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (window.innerWidth  - rect.width  - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (window.innerHeight - rect.height - 8) + 'px';
  },

  dismissContextMenu() {
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
  },

  downloadEntry(path) {
    const a = document.createElement('a');
    a.href = `/api/files/download?path=${encodeURIComponent(path)}`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  openInTerminal(dirPath) {
    BTerminal.show();
    setTimeout(() => {
      if (BTerminal.socket && BTerminal.socket.connected) {
        BTerminal.socket.emit('data', `cd ${dirPath}\n`);
      }
    }, 200);
  },

  async duplicateFile(filePath, name) {
    try {
      const data = await API.get(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      const ext  = name.includes('.') ? '.' + name.split('.').pop() : '';
      const base = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
      const newPath = this.currentPath + '/' + base + '_copy' + ext;
      await API.post('/api/files/save', { path: newPath, content: data.content });
      this.loadDir(this.currentPath);
    } catch (err) { Toast.error('Duplicate failed: ' + err.message); }
  },

  async deleteEntry(path, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await API.del(`/api/files?path=${encodeURIComponent(path)}`);
      if (this.activeFile === path) {
        this.activeFile = null;
        Editor.closeTab(path);
      }
      this.loadDir(this.currentPath);
    } catch (err) { Toast.error('Delete failed: ' + err.message); }
  },

  promptRename(oldPath, oldName) {
    this.showPrompt('Rename', oldName, async (newName) => {
      if (!newName || newName === oldName) return;
      const dir = oldPath.substring(0, oldPath.length - oldName.length);
      try {
        await API.post('/api/files/rename', { oldPath, newPath: dir + newName });
        this.loadDir(this.currentPath);
      } catch (err) { Toast.error('Rename failed: ' + err.message); }
    });
  },

  promptNewFile() {
    this.showPrompt('New File', '', async (name) => {
      if (!name) return;
      try {
        await API.post('/api/files/save', { path: this.currentPath + '/' + name, content: '' });
        this.loadDir(this.currentPath);
      } catch (err) { Toast.error('Create failed: ' + err.message); }
    });
  },

  promptNewFolder() {
    this.showPrompt('New Folder', '', async (name) => {
      if (!name) return;
      try {
        await API.post('/api/files/mkdir', { path: this.currentPath + '/' + name });
        this.loadDir(this.currentPath);
      } catch (err) { Toast.error('Create failed: ' + err.message); }
    });
  },

  showPrompt(title, defaultValue, callback) {
    document.querySelectorAll('.inline-prompt,.prompt-overlay').forEach(el => el.remove());
    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';
    const prompt = document.createElement('div');
    prompt.className = 'inline-prompt';
    prompt.innerHTML = `
      <h4>${eh(title)}</h4>
      <input type="text" value="${ea(defaultValue)}" autofocus>
      <div class="prompt-actions">
        <button class="btn cancel-prompt">Cancel</button>
        <button class="btn btn-primary confirm-prompt">OK</button>
      </div>`;
    document.body.appendChild(overlay);
    document.body.appendChild(prompt);
    const input = prompt.querySelector('input');
    input.focus(); input.select();
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
    const m = {
      js:'file-json', mjs:'file-json', cjs:'file-json', ts:'file-type', tsx:'file-type', jsx:'file-code-2',
      py:'file-code', rb:'file-code', go:'file-code', rs:'file-code', java:'file-code', c:'file-code', cpp:'file-code',
      html:'file-code-2', htm:'file-code-2', xml:'file-code-2', svg:'file-code-2',
      css:'file-code-2', scss:'file-code-2', less:'file-code-2',
      json:'file-json', yaml:'file-cog', yml:'file-cog', toml:'file-cog',
      md:'file-text', txt:'file-text', log:'file-text', csv:'file-text',
      sh:'file-terminal', bash:'file-terminal', zsh:'file-terminal',
      env:'file-lock', lock:'file-lock',
      png:'image', jpg:'image', jpeg:'image', gif:'image', webp:'image', ico:'image',
      zip:'file-archive', tar:'file-archive', gz:'file-archive', rar:'file-archive',
      sql:'database', db:'database', sqlite:'database',
      php:'file-code', vue:'file-code-2', svelte:'file-code-2', dockerfile:'container',
    };
    return m[ext] || 'file';
  },
};

function eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function ea(s) { return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function fmtSize(b) {
  if (!b) return '';
  const u = ['B','KB','MB','GB']; const i = Math.floor(Math.log(b)/Math.log(1024));
  return (b/Math.pow(1024,i)).toFixed(i===0?0:1)+' '+u[i];
}
