const Domains = {
  editingDomain: null,

  init() {
    document.getElementById('add-domain-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-domain').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-domain').addEventListener('click', () => this.addDomain());
    document.getElementById('domain-type-select').addEventListener('change', (e) => {
      document.getElementById('domain-root-group').style.display = e.target.value === 'static' ? 'block' : 'none';
      document.getElementById('domain-port-group').style.display = e.target.value === 'proxy' ? 'block' : 'none';
    });
    document.getElementById('domain-name-input').addEventListener('input', (e) => {
      const domain = e.target.value.trim();
      document.getElementById('domain-root-input').value = domain ? `/var/www/${domain}` : '';
    });
  },

  showModal() { document.getElementById('add-domain-modal').style.display = 'flex'; },
  hideModal() {
    document.getElementById('add-domain-modal').style.display = 'none';
    document.getElementById('domain-name-input').value = '';
    document.getElementById('domain-root-input').value = '';
    document.getElementById('domain-port-input').value = '';
  },

  async load() {
    try {
      const domains = await API.get('/api/domains');
      this.render(domains);
      try {
        const sys = await API.get('/api/system/info');
        const ip = document.getElementById('server-ip-display');
        if (ip) ip.innerHTML = `<strong>${sys.hostname}</strong>`;
      } catch {}
    } catch (err) {
      document.getElementById('domains-list').innerHTML = `<div class="info-box" style="border-color:var(--warning)"><p>Could not load domains. Is Nginx installed? <code>apt install nginx</code></p></div>`;
    }
  },

  render(domains) {
    const container = document.getElementById('domains-list');
    if (domains.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">No domains configured yet.</div>';
      return;
    }

    container.innerHTML = domains.map(d => `
      <div class="domain-card" data-file="${this.esc(d.file)}">
        <div class="domain-info">
          <div class="domain-name">
            <i data-lucide="${d.hasSSL ? 'lock' : 'globe'}" class="icon-sm" style="color:${d.hasSSL ? 'var(--success)' : 'var(--text-muted)'}"></i>
            <strong>${this.esc(d.domain)}</strong>
            ${d.enabled ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-muted">Disabled</span>'}
            ${d.hasSSL ? '<span class="badge badge-accent">SSL</span>' : ''}
          </div>
          ${d.root ? `<div class="domain-detail"><i data-lucide="folder" class="icon-xs"></i> ${this.esc(d.root)}</div>` : ''}
        </div>
        <div class="domain-actions">
          <button class="btn btn-sm edit-vhost" data-name="${this.esc(d.file)}" title="Edit vhost config"><i data-lucide="file-edit" class="icon-xs"></i> Config</button>
          <button class="btn btn-sm toggle-domain" data-name="${this.esc(d.file)}">${d.enabled ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-sm btn-danger delete-domain" data-name="${this.esc(d.file)}"><i data-lucide="trash-2" class="icon-xs"></i></button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    container.querySelectorAll('.edit-vhost').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openConfigEditor(btn.dataset.name);
      });
    });

    container.querySelectorAll('.toggle-domain').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.post(`/api/domains/${btn.dataset.name}/toggle`);
          this.load();
        } catch (err) { alert(err.message); }
      });
    });

    container.querySelectorAll('.delete-domain').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this domain config?')) return;
        try {
          await API.del(`/api/domains/${btn.dataset.name}`);
          this.load();
        } catch (err) { alert(err.message); }
      });
    });
  },

  async openConfigEditor(name) {
    this.editingDomain = name;
    try {
      const data = await API.get(`/api/domains/${name}/config`);
      this.showConfigModal(name, data.content);
    } catch (err) {
      alert('Failed to load config: ' + err.message);
    }
  },

  showConfigModal(name, content) {
    document.querySelectorAll('.vhost-editor-modal').forEach(el => el.remove());

    const modal = document.createElement('div');
    modal.className = 'modal vhost-editor-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:700px;max-height:80vh;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="display:flex;align-items:center;gap:8px"><i data-lucide="file-cog" class="icon-sm"></i> ${this.esc(name)} - Nginx Config</h3>
          <button class="btn btn-sm close-vhost-editor"><i data-lucide="x" class="icon-xs"></i></button>
        </div>
        <div id="vhost-test-result" style="display:none;margin-bottom:12px"></div>
        <textarea id="vhost-editor-textarea" spellcheck="false" autocomplete="off" autocorrect="off" style="
          flex:1;min-height:300px;width:100%;
          background:var(--bg-primary);color:var(--text-primary);
          border:1px solid var(--border);border-radius:var(--radius);
          padding:12px 16px;font-family:var(--font-mono);font-size:13px;
          line-height:1.6;resize:none;outline:none;tab-size:2;white-space:pre;
        ">${this.esc(content)}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <span id="vhost-save-status" style="font-size:12px;color:var(--text-muted)"></span>
          <div style="display:flex;gap:8px">
            <button class="btn close-vhost-editor">Cancel</button>
            <button class="btn btn-primary" id="save-vhost-btn"><i data-lucide="save" class="icon-xs"></i> Save & Test</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const ta = document.getElementById('vhost-editor-textarea');
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.substring(0, s) + '    ' + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveConfig(name);
      }
    });

    modal.querySelectorAll('.close-vhost-editor').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });
    document.getElementById('save-vhost-btn').addEventListener('click', () => this.saveConfig(name));
  },

  async saveConfig(name) {
    const ta = document.getElementById('vhost-editor-textarea');
    const resultEl = document.getElementById('vhost-test-result');
    const statusEl = document.getElementById('vhost-save-status');
    const saveBtn = document.getElementById('save-vhost-btn');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Testing...';
    statusEl.textContent = '';
    resultEl.style.display = 'none';

    try {
      const result = await API.put(`/api/domains/${name}/config`, { content: ta.value });
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="info-box" style="border-color:var(--success);margin-bottom:0">
        <p style="display:flex;align-items:center;gap:6px"><i data-lucide="check-circle" class="icon-sm" style="color:var(--success)"></i> <strong>Config saved & nginx reloaded!</strong></p>
        <pre style="margin-top:8px;font-size:11px;color:var(--text-secondary)">${this.esc(result.testResult || '')}</pre>
      </div>`;
      statusEl.style.color = 'var(--success)';
      statusEl.textContent = 'Saved successfully';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      this.load();
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="info-box" style="border-color:var(--danger);margin-bottom:0">
        <p style="display:flex;align-items:center;gap:6px"><i data-lucide="alert-circle" class="icon-sm" style="color:var(--danger)"></i> <strong>Nginx test FAILED - changes reverted!</strong></p>
        <pre style="margin-top:8px;font-size:11px;color:var(--danger);white-space:pre-wrap">${this.esc(err.message)}</pre>
      </div>`;
      statusEl.style.color = 'var(--danger)';
      statusEl.textContent = 'Config restored to previous version';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i data-lucide="save" class="icon-xs"></i> Save & Test';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  async addDomain() {
    const domain = document.getElementById('domain-name-input').value.trim();
    const type = document.getElementById('domain-type-select').value;
    const rootDir = document.getElementById('domain-root-input').value.trim();
    const proxyPort = document.getElementById('domain-port-input').value.trim();

    if (!domain) return alert('Domain name required');

    try {
      const result = await API.post('/api/domains', {
        domain,
        rootDir: type === 'static' ? rootDir : null,
        proxyPort: type === 'proxy' ? proxyPort : null,
      });
      this.hideModal();
      this.load();

      if (result.dnsRecord) {
        alert(`Domain added! Set this DNS record at your registrar:\n\nType: A\nName: ${domain}\nValue: ${result.dnsRecord.value}\nTTL: 3600`);
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  },

  esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
};
