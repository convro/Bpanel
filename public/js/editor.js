const Editor = {
  tabs: [], // { path, name, content, originalContent, element }
  activeTab: null,

  init() {
    // Ctrl+S to save
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveActive();
      }
    });
  },

  openFile(filePath, content) {
    // Check if already open
    let tab = this.tabs.find(t => t.path === filePath);
    if (tab) {
      this.activateTab(tab);
      return;
    }

    const name = filePath.split('/').pop();
    tab = {
      path: filePath,
      name,
      content,
      originalContent: content,
    };

    this.tabs.push(tab);
    this.renderTabs();
    this.activateTab(tab);
  },

  activateTab(tab) {
    // Save current editor content before switching
    if (this.activeTab) {
      const textarea = document.querySelector('.code-editor');
      if (textarea) {
        this.activeTab.content = textarea.value;
      }
    }

    this.activeTab = tab;

    // Update tab styles
    document.querySelectorAll('.editor-tab').forEach(el => el.classList.remove('active'));
    const tabEl = document.querySelector(`.editor-tab[data-path="${CSS.escape(tab.path)}"]`);
    if (tabEl) tabEl.classList.add('active');

    // Show editor
    document.getElementById('editor-placeholder').style.display = 'none';
    const container = document.getElementById('editor-container');
    container.style.display = 'flex';

    // Create textarea editor
    container.innerHTML = '';
    const textarea = document.createElement('textarea');
    textarea.className = 'code-editor';
    textarea.value = tab.content;
    textarea.spellcheck = false;
    textarea.setAttribute('autocapitalize', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');

    // Handle tab key for indentation
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        tab.content = textarea.value;
        this.updateModifiedState(tab);
      }
    });

    textarea.addEventListener('input', () => {
      tab.content = textarea.value;
      this.updateModifiedState(tab);
    });

    container.appendChild(textarea);
    textarea.focus();
  },

  renderTabs() {
    const container = document.getElementById('editor-tabs');
    container.innerHTML = this.tabs.map(tab => `
      <div class="editor-tab ${this.activeTab === tab ? 'active' : ''} ${tab.content !== tab.originalContent ? 'modified' : ''}"
           data-path="${tab.path}">
        <span class="tab-name">${this.escapeHtml(tab.name)}</span>
        <span class="tab-close" data-path="${tab.path}">✕</span>
      </div>
    `).join('');

    container.querySelectorAll('.editor-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) return;
        const tab = this.tabs.find(t => t.path === el.dataset.path);
        if (tab) this.activateTab(tab);
      });
    });

    container.querySelectorAll('.tab-close').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(el.dataset.path);
      });
    });
  },

  closeTab(path) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;

    if (tab.content !== tab.originalContent) {
      if (!confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;
    }

    this.tabs = this.tabs.filter(t => t.path !== path);

    if (this.activeTab === tab) {
      if (this.tabs.length > 0) {
        this.activateTab(this.tabs[this.tabs.length - 1]);
      } else {
        this.activeTab = null;
        document.getElementById('editor-container').style.display = 'none';
        document.getElementById('editor-placeholder').style.display = 'flex';
      }
    }

    this.renderTabs();
  },

  updateModifiedState(tab) {
    const tabEl = document.querySelector(`.editor-tab[data-path="${CSS.escape(tab.path)}"]`);
    if (tabEl) {
      tabEl.classList.toggle('modified', tab.content !== tab.originalContent);
    }
  },

  async saveActive() {
    if (!this.activeTab) return;

    const textarea = document.querySelector('.code-editor');
    if (textarea) {
      this.activeTab.content = textarea.value;
    }

    try {
      await API.post('/api/files/save', {
        path: this.activeTab.path,
        content: this.activeTab.content,
      });
      this.activeTab.originalContent = this.activeTab.content;
      this.updateModifiedState(this.activeTab);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  },

  closeAll() {
    this.tabs = [];
    this.activeTab = null;
    document.getElementById('editor-tabs').innerHTML = '';
    document.getElementById('editor-container').style.display = 'none';
    document.getElementById('editor-placeholder').style.display = 'flex';
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
