const Editor = {
  tabs: [],
  activeTab: null,
  hljsLoaded: false,

  langMap: {
    js:'javascript', mjs:'javascript', cjs:'javascript', jsx:'javascript',
    ts:'typescript', tsx:'typescript',
    py:'python', rb:'ruby', go:'go', rs:'rust', java:'java',
    c:'c', cpp:'cpp', h:'c', hpp:'cpp',
    html:'xml', htm:'xml', xml:'xml', svg:'xml', vue:'xml', svelte:'xml',
    css:'css', scss:'scss', less:'less',
    json:'json', yaml:'yaml', yml:'yaml', toml:'ini',
    md:'markdown', markdown:'markdown',
    sh:'bash', bash:'bash', zsh:'bash',
    sql:'sql', php:'php', dockerfile:'dockerfile',
    nginx:'nginx', ini:'ini', conf:'ini', cfg:'ini',
    lua:'lua', r:'r', dart:'dart',
    txt:'plaintext', log:'plaintext', env:'bash',
  },

  init() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.saveActive(); }
    });
    this.loadHighlightJS();
  },

  loadHighlightJS() {
    if (this.hljsLoaded || document.getElementById('hljs-css')) return;

    const link = document.createElement('link');
    link.id = 'hljs-css'; link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = () => {
      this.hljsLoaded = true;
      if (this.activeTab) {
        const wrapper  = document.querySelector('.editor-wrapper');
        const textarea = document.querySelector('.code-editor');
        const code     = wrapper?.querySelector('code');
        if (wrapper && textarea && code) this.doHighlight(wrapper, code, textarea.value, this.activeTab.name);
      }
    };
    document.head.appendChild(script);
  },

  doHighlight(wrapper, codeEl, text, filename) {
    const ext  = filename.split('.').pop().toLowerCase();
    const lang = this.langMap[ext] || 'plaintext';
    const content = text + (text.endsWith('\n') ? ' ' : '\n');

    if (window.hljs && this.hljsLoaded) {
      try {
        const result = window.hljs.highlight(content, { language: lang, ignoreIllegals: true });
        codeEl.innerHTML = result.value;
        codeEl.className = `hljs language-${lang}`;
        wrapper.classList.add('hl-active');
      } catch {
        codeEl.textContent = content;
        wrapper.classList.remove('hl-active');
      }
    } else {
      codeEl.textContent = content;
      wrapper.classList.remove('hl-active');
    }
  },

  openFile(filePath, content) {
    let tab = this.tabs.find(t => t.path === filePath);
    if (tab) { this.activateTab(tab); return; }
    const name = filePath.split('/').pop();
    tab = { path: filePath, name, content, originalContent: content };
    this.tabs.push(tab);
    this.renderTabs();
    this.activateTab(tab);
  },

  activateTab(tab) {
    if (this.activeTab) {
      const ta = document.querySelector('.code-editor');
      if (ta) this.activeTab.content = ta.value;
    }
    this.activeTab = tab;

    document.querySelectorAll('.editor-tab').forEach(el => el.classList.remove('active'));
    const tabEl = document.querySelector(`.editor-tab[data-path="${CSS.escape(tab.path)}"]`);
    if (tabEl) tabEl.classList.add('active');

    document.getElementById('editor-placeholder').style.display = 'none';
    const container = document.getElementById('editor-container');
    container.style.display = 'flex';
    container.innerHTML = '';

    const wrapper   = document.createElement('div');
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

    let hlTimeout;
    const updateHL = () => { clearTimeout(hlTimeout); hlTimeout = setTimeout(() => this.doHighlight(wrapper, code, textarea.value, tab.name), 30); };
    const syncScroll = () => { highlight.scrollTop = textarea.scrollTop; highlight.scrollLeft = textarea.scrollLeft; };

    textarea.addEventListener('input', () => { tab.content = textarea.value; this.updateModifiedState(tab); updateHL(); });
    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = textarea.selectionStart;
        textarea.value = textarea.value.substring(0, s) + '  ' + textarea.value.substring(textarea.selectionEnd);
        textarea.selectionStart = textarea.selectionEnd = s + 2;
        tab.content = textarea.value;
        updateHL();
      }
    });

    updateHL();
    textarea.focus();
  },

  renderTabs() {
    const container = document.getElementById('editor-tabs');
    container.innerHTML = this.tabs.map(tab => `
      <div class="editor-tab ${this.activeTab === tab ? 'active' : ''} ${tab.content !== tab.originalContent ? 'modified' : ''}" data-path="${tab.path}">
        <i data-lucide="${FileManager.fileIcon(tab.name)}" class="icon-xs"></i>
        <span class="tab-name">${eh(tab.name)}</span>
        <span class="tab-close" data-path="${tab.path}"><i data-lucide="x" class="icon-xs"></i></span>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: container });

    container.querySelectorAll('.editor-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) return;
        const tab = this.tabs.find(t => t.path === el.dataset.path);
        if (tab) this.activateTab(tab);
      });
    });
    container.querySelectorAll('.tab-close').forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); this.closeTab(el.dataset.path); });
    });
  },

  closeTab(path) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;
    if (tab.content !== tab.originalContent && !confirm(`"${tab.name}" has unsaved changes. Close?`)) return;
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
    const ta = document.querySelector('.code-editor');
    if (ta) this.activeTab.content = ta.value;
    try {
      await API.post('/api/files/save', { path: this.activeTab.path, content: this.activeTab.content });
      this.activeTab.originalContent = this.activeTab.content;
      this.updateModifiedState(this.activeTab);
      Toast.success('Saved');
    } catch (err) { Toast.error('Save failed: ' + err.message); }
  },

  closeAll() {
    this.tabs = [];
    this.activeTab = null;
    document.getElementById('editor-tabs').innerHTML = '';
    document.getElementById('editor-container').style.display = 'none';
    document.getElementById('editor-placeholder').style.display = 'flex';
  },
};

function eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
