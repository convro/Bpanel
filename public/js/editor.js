const Editor = {
  tabs: [],
  activeTab: null,
  cm: null, // CodeMirror instance or null

  // Language map for highlight.js
  langMap: {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
    html: 'xml', htm: 'xml', xml: 'xml', svg: 'xml', vue: 'xml', svelte: 'xml',
    css: 'css', scss: 'scss', less: 'less',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'ini',
    md: 'markdown', markdown: 'markdown',
    sh: 'bash', bash: 'bash', zsh: 'bash',
    sql: 'sql',
    php: 'php',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    nginx: 'nginx',
    ini: 'ini', conf: 'ini', cfg: 'ini',
    lua: 'lua', perl: 'perl', pl: 'perl',
    swift: 'swift', kotlin: 'kotlin', scala: 'scala',
    r: 'r', R: 'r',
    dart: 'dart', elixir: 'elixir', haskell: 'haskell',
    txt: 'plaintext', log: 'plaintext', env: 'bash',
  },

  init() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveActive();
      }
    });

    // Load highlight.js from CDN
    this.loadHighlightJS();
  },

  loadHighlightJS() {
    if (document.getElementById('hljs-css')) return;

    const link = document.createElement('link');
    link.id = 'hljs-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js';
    script.onload = () => {
      // Load common languages
      const langs = [
        'javascript', 'typescript', 'python', 'ruby', 'go', 'rust', 'java',
        'c', 'cpp', 'css', 'scss', 'less', 'xml', 'json', 'yaml', 'markdown',
        'bash', 'sql', 'php', 'dockerfile', 'nginx', 'ini', 'lua', 'perl',
        'swift', 'kotlin', 'scala', 'r', 'dart', 'elixir', 'haskell', 'makefile',
      ];
      // highlight.js common bundle includes most languages
      console.log('highlight.js loaded with', Object.keys(window.hljs.listLanguages()).length, 'languages');
    };
    document.head.appendChild(script);
  },

  openFile(filePath, content) {
    let tab = this.tabs.find(t => t.path === filePath);
    if (tab) {
      this.activateTab(tab);
      return;
    }

    const name = filePath.split('/').pop();
    tab = { path: filePath, name, content, originalContent: content };
    this.tabs.push(tab);
    this.renderTabs();
    this.activateTab(tab);
  },

  activateTab(tab) {
    // Save current content
    if (this.activeTab) {
      const textarea = document.querySelector('.code-editor');
      if (textarea) this.activeTab.content = textarea.value;
    }

    this.activeTab = tab;

    document.querySelectorAll('.editor-tab').forEach(el => el.classList.remove('active'));
    const tabEl = document.querySelector(`.editor-tab[data-path="${CSS.escape(tab.path)}"]`);
    if (tabEl) tabEl.classList.add('active');

    document.getElementById('editor-placeholder').style.display = 'none';
    const container = document.getElementById('editor-container');
    container.style.display = 'flex';
    container.innerHTML = '';

    // Create highlighted editor
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-wrapper';

    const highlight = document.createElement('pre');
    highlight.className = 'editor-highlight';
    const code = document.createElement('code');
    highlight.appendChild(code);

    const textarea = document.createElement('textarea');
    textarea.className = 'code-editor';
    textarea.value = tab.content;
    textarea.spellcheck = false;
    textarea.setAttribute('autocapitalize', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');

    wrapper.appendChild(highlight);
    wrapper.appendChild(textarea);
    container.appendChild(wrapper);

    // Sync highlighting
    const ext = tab.name.split('.').pop().toLowerCase();
    const lang = this.langMap[ext] || 'plaintext';

    const updateHighlight = () => {
      const text = textarea.value;
      // Add newline at end to keep sizes synced
      code.textContent = text + (text.endsWith('\n') ? ' ' : '\n');
      code.className = `language-${lang}`;
      if (window.hljs) {
        try { window.hljs.highlightElement(code); } catch {}
      }
    };

    const syncScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('input', () => {
      tab.content = textarea.value;
      this.updateModifiedState(tab);
      updateHighlight();
    });

    textarea.addEventListener('scroll', syncScroll);

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        tab.content = textarea.value;
        this.updateModifiedState(tab);
        updateHighlight();
      }
    });

    updateHighlight();
    textarea.focus();
  },

  renderTabs() {
    const container = document.getElementById('editor-tabs');
    container.innerHTML = this.tabs.map(tab => {
      const ext = tab.name.split('.').pop().toLowerCase();
      const icon = FileManager.fileIcon(tab.name);
      return `
      <div class="editor-tab ${this.activeTab === tab ? 'active' : ''} ${tab.content !== tab.originalContent ? 'modified' : ''}"
           data-path="${tab.path}">
        <i data-lucide="${icon}" class="icon-xs"></i>
        <span class="tab-name">${this.escapeHtml(tab.name)}</span>
        <span class="tab-close" data-path="${tab.path}"><i data-lucide="x" class="icon-xs"></i></span>
      </div>
    `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    container.querySelectorAll('.editor-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) return;
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
    if (tabEl) tabEl.classList.toggle('modified', tab.content !== tab.originalContent);
  },

  async saveActive() {
    if (!this.activeTab) return;
    const textarea = document.querySelector('.code-editor');
    if (textarea) this.activeTab.content = textarea.value;
    try {
      await API.post('/api/files/save', { path: this.activeTab.path, content: this.activeTab.content });
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

  escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
};
