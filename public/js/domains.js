const Domains = {
  init() {
    document.getElementById('add-domain-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-domain').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-domain').addEventListener('click', () => this.addDomain());
    document.getElementById('domain-type-select').addEventListener('change', (e) => {
      document.getElementById('domain-root-group').style.display = e.target.value === 'static' ? '' : 'none';
      document.getElementById('domain-port-group').style.display = e.target.value === 'proxy' ? '' : 'none';
    });
    document.getElementById('domain-name-input').addEventListener('input', (e) => {
      const domain = e.target.value.trim();
      const root = document.getElementById('domain-root-input');
      if (domain && document.getElementById('domain-type-select').value === 'static') {
        root.value = `/var/www/${domain}`;
      }
    });
  },

  showModal() {
    document.getElementById('add-domain-modal').style.display = 'flex';
    document.getElementById('domain-name-input').focus();
  },
  hideModal() {
    document.getElementById('add-domain-modal').style.display = 'none';
    document.getElementById('domain-name-input').value = '';
    document.getElementById('domain-root-input').value = '';
    document.getElementById('domain-port-input').value = '';
  },

  async load() {
    const list = document.getElementById('domains-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div> Loading domains...</div>';
    try {
      const domains = await API.get('/api/domains');
      this.render(domains);

      // Show server IP
      try {
        const sys = await API.get('/api/system/info');
        const el = document.getElementById('server-ip-display');
        if (el) el.textContent = sys.hostname;
      } catch {}
    } catch (err) {
      list.innerHTML = `<div class="info-box" style="border-color:var(--warning)">
        <div class="info-box-header"><i data-lucide="alert-triangle" class="icon-sm"></i> Nginx not available</div>
        <p>Is Nginx installed? Run: <code>apt install nginx</code></p>
        <p style="color:var(--text-muted);font-size:12px;margin-top:4px">${esc(err.message)}</p>
      </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: list });
    }
  },

  render(domains) {
    const container = document.getElementById('domains-list');
    if (domains.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:48px 0;color:var(--text-muted)">No domains configured yet. Add one above.</div>';
      return;
    }

    container.innerHTML = domains.map(d => `
      <div class="domain-card">
        <div class="domain-info">
          <div class="domain-name">
            <i data-lucide="${d.hasSSL ? 'lock' : 'globe'}" class="icon-sm" style="color:${d.hasSSL ? 'var(--success)' : 'var(--text-muted)'}"></i>
            <strong>${esc(d.domain)}</strong>
            ${d.enabled ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-muted">Disabled</span>'}
            ${d.hasSSL ? '<span class="badge badge-accent">HTTPS</span>' : ''}
            ${d.proxyPort ? `<span class="badge badge-warning">:${esc(d.proxyPort)}</span>` : ''}
          </div>
          ${d.root ? `<div class="domain-detail"><i data-lucide="folder" class="icon-xs"></i> ${esc(d.root)}</div>` : ''}
          ${d.proxyPort ? `<div class="domain-detail"><i data-lucide="arrow-right" class="icon-xs"></i> proxy → localhost:${esc(d.proxyPort)}</div>` : ''}
        </div>
        <div class="domain-actions">
          <button class="btn btn-sm edit-vhost" data-name="${esc(d.file)}" title="Edit Nginx config">
            <i data-lucide="file-cog" class="icon-xs"></i> Config
          </button>
          <button class="btn btn-sm toggle-domain" data-name="${esc(d.file)}" data-enabled="${d.enabled}">
            ${d.enabled ? 'Disable' : 'Enable'}
          </button>
          <button class="btn btn-sm btn-danger delete-domain" data-name="${esc(d.file)}">
            <i data-lucide="trash-2" class="icon-xs"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: container });

    container.querySelectorAll('.edit-vhost').forEach(btn => {
      btn.addEventListener('click', () => this.openConfigEditor(btn.dataset.name));
    });
    container.querySelectorAll('.toggle-domain').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await API.post(`/api/domains/${btn.dataset.name}/toggle`);
          Toast.success('Domain ' + (btn.dataset.enabled === 'true' ? 'disabled' : 'enabled'));
          this.load();
        } catch (err) { Toast.error(err.message); btn.disabled = false; }
      });
    });
    container.querySelectorAll('.delete-domain').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this domain config?')) return;
        try {
          await API.del(`/api/domains/${btn.dataset.name}`);
          Toast.success('Domain deleted');
          this.load();
        } catch (err) { Toast.error(err.message); }
      });
    });
  },

  async openConfigEditor(name) {
    try {
      const data = await API.get(`/api/domains/${name}/config`);
      this.showConfigModal(name, data.content);
    } catch (err) { Toast.error('Failed to load config: ' + err.message); }
  },

  showConfigModal(name, content) {
    document.querySelectorAll('.vhost-editor-modal').forEach(el => el.remove());

    const modal = document.createElement('div');
    modal.className = 'modal vhost-editor-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:720px;max-height:85vh;display:flex;flex-direction:column">
        <div class="modal-header">
          <h3><i data-lucide="file-cog" class="icon-sm"></i> ${esc(name)} — Nginx Config</h3>
          <button class="modal-close close-vhost"><i data-lucide="x" class="icon-sm"></i></button>
        </div>
        <div id="vhost-test-result" style="display:none;margin-bottom:12px"></div>
        <textarea id="vhost-editor-textarea" spellcheck="false" autocomplete="off" autocorrect="off" style="
          flex:1;min-height:300px;width:100%;
          background:var(--bg-input);color:var(--text);
          border:1px solid var(--border);border-radius:var(--radius-sm);
          padding:14px 16px;font-family:var(--font-mono);font-size:13px;
          line-height:1.7;resize:none;outline:none;tab-size:4;
        ">${esc(content)}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <span id="vhost-save-status" style="font-size:12px;color:var(--text-muted)"></span>
          <div style="display:flex;gap:8px">
            <button class="btn close-vhost">Cancel</button>
            <button class="btn btn-primary" id="save-vhost-btn">
              <i data-lucide="save" class="icon-xs"></i> Save & Test
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons({ el: modal });

    const ta = document.getElementById('vhost-editor-textarea');
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.substring(0, s) + '    ' + ta.value.substring(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveConfig(); }
    });

    modal.querySelectorAll('.close-vhost').forEach(el => el.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('save-vhost-btn').addEventListener('click', saveConfig);

    const saveConfig = async () => {
      const resultEl = document.getElementById('vhost-test-result');
      const saveBtn = document.getElementById('save-vhost-btn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<div class="spinner"></div> Testing...';
      resultEl.style.display = 'none';
      try {
        const result = await API.put(`/api/domains/${name}/config`, { content: ta.value });
        resultEl.style.display = 'block';
        resultEl.innerHTML = `<div class="info-box" style="border-color:var(--success);margin-bottom:0">
          <div class="info-box-header"><i data-lucide="check-circle" class="icon-sm" style="color:var(--success)"></i> Config saved & Nginx reloaded!</div>
          <pre style="font-size:11px;color:var(--text-muted);margin-top:8px;white-space:pre-wrap">${esc(result.testResult || '')}</pre>
        </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: resultEl });
        document.getElementById('vhost-save-status').style.color = 'var(--success)';
        document.getElementById('vhost-save-status').textContent = 'Saved';
        this.load();
      } catch (err) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = `<div class="info-box" style="border-color:var(--danger);margin-bottom:0">
          <div class="info-box-header"><i data-lucide="alert-circle" class="icon-sm" style="color:var(--danger)"></i> Test FAILED — changes reverted</div>
          <pre style="font-size:11px;color:var(--danger);margin-top:8px;white-space:pre-wrap">${esc(err.message)}</pre>
        </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: resultEl });
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="save" class="icon-xs"></i> Save & Test';
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: saveBtn });
      }
    };
  },

  async addDomain() {
    const domain    = document.getElementById('domain-name-input').value.trim();
    const type      = document.getElementById('domain-type-select').value;
    const rootDir   = document.getElementById('domain-root-input').value.trim();
    const proxyPort = document.getElementById('domain-port-input').value.trim();

    if (!domain) return Toast.error('Domain name required');

    const btn = document.getElementById('confirm-domain');
    btn.disabled = true; btn.textContent = 'Adding...';

    try {
      const result = await API.post('/api/domains', {
        domain,
        rootDir: type === 'static' ? rootDir : null,
        proxyPort: type === 'proxy' ? proxyPort : null,
      });
      this.hideModal();
      this.load();
      if (result.dnsRecord) {
        Toast.success(`Domain added! Set A record: ${domain} → ${result.dnsRecord.value}`, 8000);
      }
    } catch (err) {
      Toast.error('Failed: ' + err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Add Domain';
    }
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
