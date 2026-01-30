const SSL = {
  init() {
    document.getElementById('issue-ssl-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-ssl').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-ssl').addEventListener('click', () => this.issueCert());
  },

  showModal() { document.getElementById('issue-ssl-modal').style.display = 'flex'; },
  hideModal() {
    document.getElementById('issue-ssl-modal').style.display = 'none';
    document.getElementById('ssl-domain-input').value = '';
    document.getElementById('ssl-email-input').value = '';
  },

  async load() {
    const statusEl = document.getElementById('ssl-status');
    const listEl = document.getElementById('ssl-list');

    try {
      const data = await API.get('/api/ssl');

      if (!data.installed) {
        statusEl.innerHTML = `
          <div class="info-box" style="border-color:var(--warning)">
            <h4><i data-lucide="alert-triangle" class="icon-sm"></i> Certbot not installed</h4>
            <p>Certbot is required for SSL certificates. Click below to install it.</p>
            <button class="btn btn-primary" id="install-certbot-btn" style="margin-top:12px"><i data-lucide="download" class="icon-sm"></i> Install Certbot</button>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('install-certbot-btn').addEventListener('click', () => this.installCertbot());
        listEl.innerHTML = '';
        return;
      }

      statusEl.innerHTML = `<div class="info-box" style="border-color:var(--success)"><p><i data-lucide="check-circle" class="icon-sm" style="color:var(--success)"></i> Certbot is installed and ready.</p></div>`;

      if (data.certs.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">No SSL certificates found.</div>';
      } else {
        listEl.innerHTML = data.certs.map(cert => `
          <div class="ssl-card">
            <div class="ssl-info">
              <div class="ssl-name">
                <i data-lucide="shield-check" class="icon-sm" style="color:${cert.valid ? 'var(--success)' : 'var(--danger)'}"></i>
                <strong>${this.esc(cert.name)}</strong>
                ${cert.valid ? '<span class="badge badge-success">Valid</span>' : '<span class="badge badge-danger">Invalid</span>'}
              </div>
              <div class="ssl-detail">Domains: ${cert.domains.map(d => this.esc(d)).join(', ')}</div>
              ${cert.expiry ? `<div class="ssl-detail">Expires: ${cert.expiry}</div>` : ''}
            </div>
            <div class="ssl-actions">
              <button class="btn btn-sm btn-danger revoke-ssl" data-domain="${this.esc(cert.name)}"><i data-lucide="trash-2" class="icon-xs"></i> Revoke</button>
            </div>
          </div>
        `).join('');

        listEl.querySelectorAll('.revoke-ssl').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm(`Revoke SSL for ${btn.dataset.domain}?`)) return;
            try {
              await API.del(`/api/ssl/${btn.dataset.domain}`);
              this.load();
            } catch (err) { alert(err.message); }
          });
        });
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      statusEl.innerHTML = `<div class="info-box" style="border-color:var(--danger)"><p>Error loading SSL data: ${err.message}</p></div>`;
    }
  },

  async issueCert() {
    const domain = document.getElementById('ssl-domain-input').value.trim();
    const email = document.getElementById('ssl-email-input').value.trim();
    if (!domain) return alert('Domain required');

    const btn = document.getElementById('confirm-ssl');
    btn.disabled = true;
    btn.textContent = 'Issuing...';

    try {
      await API.post('/api/ssl/issue', { domain, email: email || null });
      this.hideModal();
      alert('SSL certificate issued successfully!');
      this.load();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Issue Certificate';
    }
  },

  async installCertbot() {
    const btn = document.getElementById('install-certbot-btn');
    btn.disabled = true;
    btn.textContent = 'Installing...';
    try {
      await API.post('/api/ssl/install-certbot');
      alert('Certbot installed successfully!');
      this.load();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  },

  esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
};
