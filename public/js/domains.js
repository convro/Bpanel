const Domains = {
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

      // Also load server IP
      try {
        const sys = await API.get('/api/system/info');
        const ip = document.getElementById('server-ip-display');
        if (ip) ip.innerHTML = `<strong>${sys.hostname}</strong>`;
        // Try to get public IP from hostname
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
      <div class="domain-card">
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
          <button class="btn btn-sm toggle-domain" data-name="${this.esc(d.file)}">${d.enabled ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-sm btn-danger delete-domain" data-name="${this.esc(d.file)}"><i data-lucide="trash-2" class="icon-xs"></i></button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

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
