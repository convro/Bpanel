const SystemInfo = {
  init() {
    document.getElementById('refresh-system-btn').addEventListener('click', () => this.load());
  },

  async load() {
    const container = document.getElementById('system-info-content');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Loading system info...</div>';

    try {
      const data = await API.get('/api/system/info');
      this.render(data);
    } catch (err) {
      container.innerHTML = `<div class="info-box" style="border-color:var(--danger)"><p>Error loading system info: ${err.message}</p></div>`;
    }
  },

  render(data) {
    const container = document.getElementById('system-info-content');
    const memPct = ((data.memory.used / data.memory.total) * 100).toFixed(1);
    const diskPct = data.disk.total ? ((data.disk.used / data.disk.total) * 100).toFixed(1) : 0;
    const uptime = this.formatUptime(data.uptime);
    const osName = data.osInfo.PRETTY_NAME || `${data.platform} ${data.release}`;

    let versionsHtml = '';
    const categories = {
      'Web Servers': ['nginx', 'apache2'],
      'Languages': ['node', 'php', 'python3', 'python', 'ruby', 'go', 'rustc', 'java'],
      'Package Managers': ['npm', 'yarn', 'composer', 'pm2'],
      'Databases': ['mysql', 'psql', 'redis', 'mongod'],
      'DevOps': ['docker', 'docker-compose', 'git', 'make', 'gcc', 'certbot'],
      'Utilities': ['curl', 'wget', 'ufw'],
    };

    for (const [cat, keys] of Object.entries(categories)) {
      const found = keys.filter(k => data.versions[k]);
      if (found.length === 0) continue;
      versionsHtml += `<div class="sys-category"><h4>${this.esc(cat)}</h4><div class="sys-versions-grid">`;
      for (const key of found) {
        versionsHtml += `
          <div class="sys-version-item">
            <span class="sys-ver-name">${this.esc(key)}</span>
            <span class="sys-ver-val">${this.esc(data.versions[key])}</span>
          </div>`;
      }
      versionsHtml += `</div></div>`;
    }

    container.innerHTML = `
      <div class="sys-grid">
        <div class="sys-card">
          <div class="sys-card-header"><i data-lucide="server" class="icon-sm"></i> Server</div>
          <div class="sys-card-body">
            <div class="sys-row"><span>OS</span><span>${this.esc(osName)}</span></div>
            <div class="sys-row"><span>Hostname</span><span>${this.esc(data.hostname)}</span></div>
            <div class="sys-row"><span>Arch</span><span>${this.esc(data.arch)}</span></div>
            <div class="sys-row"><span>Kernel</span><span>${this.esc(data.release)}</span></div>
            <div class="sys-row"><span>Uptime</span><span>${uptime}</span></div>
            <div class="sys-row"><span>CPUs</span><span>${data.cpus}</span></div>
            <div class="sys-row"><span>Load Avg</span><span>${data.loadavg.map(l => l.toFixed(2)).join(', ')}</span></div>
          </div>
        </div>

        <div class="sys-card">
          <div class="sys-card-header"><i data-lucide="cpu" class="icon-sm"></i> Memory</div>
          <div class="sys-card-body">
            <div class="sys-bar-label"><span>RAM Usage</span><span>${memPct}%</span></div>
            <div class="sys-bar"><div class="sys-bar-fill" style="width:${memPct}%;background:${memPct > 85 ? 'var(--danger)' : memPct > 60 ? 'var(--warning)' : 'var(--success)'}"></div></div>
            <div class="sys-row"><span>Used</span><span>${this.formatBytes(data.memory.used)}</span></div>
            <div class="sys-row"><span>Free</span><span>${this.formatBytes(data.memory.free)}</span></div>
            <div class="sys-row"><span>Total</span><span>${this.formatBytes(data.memory.total)}</span></div>
          </div>
        </div>

        <div class="sys-card">
          <div class="sys-card-header"><i data-lucide="hard-drive" class="icon-sm"></i> Disk</div>
          <div class="sys-card-body">
            <div class="sys-bar-label"><span>Disk Usage</span><span>${diskPct}%</span></div>
            <div class="sys-bar"><div class="sys-bar-fill" style="width:${diskPct}%;background:${diskPct > 85 ? 'var(--danger)' : diskPct > 60 ? 'var(--warning)' : 'var(--success)'}"></div></div>
            <div class="sys-row"><span>Used</span><span>${this.formatBytes(data.disk.used)}</span></div>
            <div class="sys-row"><span>Free</span><span>${this.formatBytes(data.disk.free)}</span></div>
            <div class="sys-row"><span>Total</span><span>${this.formatBytes(data.disk.total)}</span></div>
          </div>
        </div>
      </div>

      <div class="sys-section">
        <h3><i data-lucide="package" class="icon-sm"></i> Installed Software</h3>
        ${versionsHtml || '<p style="color:var(--text-muted)">No software detected.</p>'}
      </div>

      ${data.nginxInfo ? `
      <div class="sys-section">
        <h3><i data-lucide="globe" class="icon-sm"></i> Nginx</h3>
        <div class="sys-row"><span>Config Test</span><span style="font-size:12px">${this.esc(data.nginxInfo.configTest)}</span></div>
        <div class="sys-row"><span>Enabled Sites</span><span>${data.nginxInfo.sites.map(s => this.esc(s)).join(', ') || 'none'}</span></div>
      </div>` : ''}
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  },

  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  },

  esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
};
