const SSL = {
  init() {
    document.getElementById('issue-ssl-btn').addEventListener('click', () => this.showModal());
    document.getElementById('cancel-ssl').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-ssl').addEventListener('click', () => this.issueCert());

    const renewBtn = document.getElementById('renew-ssl-btn');
    if (renewBtn) renewBtn.addEventListener('click', () => this.renewAll());
  },

  showModal() {
    document.getElementById('issue-ssl-modal').style.display = 'flex';
    document.getElementById('ssl-domain-input').focus();
  },
  hideModal() {
    document.getElementById('issue-ssl-modal').style.display = 'none';
    document.getElementById('ssl-domain-input').value = '';
    document.getElementById('ssl-email-input').value = '';
  },

  async load() {
    const statusEl = document.getElementById('ssl-status');
    const listEl   = document.getElementById('ssl-list');

    statusEl.innerHTML = '<div class="loading"><div class="spinner"></div> Checking Certbot...</div>';

    try {
      const data = await API.get('/api/ssl');

      if (!data.installed) {
        statusEl.innerHTML = `
          <div class="info-box" style="border-color:var(--warning)">
            <div class="info-box-header"><i data-lucide="alert-triangle" class="icon-sm" style="color:var(--warning)"></i> Certbot not installed</div>
            <p>Certbot is required for SSL certificates.</p>
            <button class="btn btn-primary" id="install-certbot-btn" style="margin-top:12px">
              <i data-lucide="download" class="icon-sm"></i> Install Certbot
            </button>
          </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: statusEl });
        document.getElementById('install-certbot-btn').addEventListener('click', () => this.installCertbot());
        listEl.innerHTML = '';
        return;
      }

      statusEl.innerHTML = `
        <div class="info-box" style="border-color:var(--success);margin-bottom:16px">
          <div class="info-box-header" style="margin-bottom:0">
            <i data-lucide="check-circle" class="icon-sm" style="color:var(--success)"></i>
            Certbot installed &amp; ready
          </div>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: statusEl });

      if (data.certs.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:48px 0;color:var(--text-muted)">No SSL certificates yet. Issue one above.</div>';
      } else {
        listEl.innerHTML = data.certs.map(cert => `
          <div class="ssl-card">
            <div class="ssl-info">
              <div class="ssl-name">
                <i data-lucide="shield-check" class="icon-sm" style="color:${cert.valid ? 'var(--success)' : 'var(--danger)'}"></i>
                <strong>${esc(cert.name)}</strong>
                ${cert.valid ? '<span class="badge badge-success">Valid</span>' : '<span class="badge badge-danger">Expired</span>'}
              </div>
              <div class="ssl-detail">${cert.domains.map(d => esc(d)).join(', ')}</div>
              ${cert.expiry ? `<div class="ssl-detail">Expires: ${esc(cert.expiry)}</div>` : ''}
            </div>
            <div class="ssl-actions">
              <button class="btn btn-sm btn-danger revoke-ssl" data-domain="${esc(cert.name)}">
                <i data-lucide="trash-2" class="icon-xs"></i> Delete
              </button>
            </div>
          </div>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ el: listEl });
        listEl.querySelectorAll('.revoke-ssl').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm(`Delete SSL certificate for ${btn.dataset.domain}?`)) return;
            try {
              await API.del(`/api/ssl/${btn.dataset.domain}`);
              Toast.success('Certificate deleted');
              this.load();
            } catch (err) { Toast.error(err.message); }
          });
        });
      }
    } catch (err) {
      statusEl.innerHTML = `<div class="info-box" style="border-color:var(--danger)">
        <p>Error loading SSL data: ${esc(err.message)}</p></div>`;
    }
  },

  async issueCert() {
    const domain = document.getElementById('ssl-domain-input').value.trim();
    const email  = document.getElementById('ssl-email-input').value.trim();
    if (!domain) return Toast.error('Domain required');

    const btn = document.getElementById('confirm-ssl');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Issuing (may take up to 60s)...';

    try {
      await API.post('/api/ssl/issue', { domain, email: email || null });
      this.hideModal();
      Toast.success('SSL certificate issued for ' + domain);
      this.load();
    } catch (err) {
      Toast.error('Failed: ' + err.message, 8000);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Issue Certificate';
    }
  },

  async renewAll() {
    const btn = document.getElementById('renew-ssl-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Renewing...';
    try {
      const result = await API.post('/api/ssl/renew');
      Toast.success('Certificates renewed');
      this.load();
    } catch (err) {
      Toast.error('Renewal failed: ' + err.message);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i data-lucide="refresh-cw" class="icon-sm"></i> Renew All';
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn });
    }
  },

  async installCertbot() {
    const btn = document.getElementById('install-certbot-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Installing...';
    try {
      await API.post('/api/ssl/install-certbot');
      Toast.success('Certbot installed!');
      this.load();
    } catch (err) {
      Toast.error('Failed: ' + err.message);
      btn.disabled = false; btn.textContent = 'Install Certbot';
    }
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
