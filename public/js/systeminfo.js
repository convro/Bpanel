const SystemInfo = {
  async load() {
    const container = document.getElementById('system-info-content');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading system info...</div>';
    try {
      const d = await API.get('/api/system/info');
      this.render(d, container);
    } catch (err) {
      container.innerHTML = `<div class="info-box" style="border-color:var(--danger)"><p>Failed to load: ${esc(err.message)}</p></div>`;
    }

    document.getElementById('refresh-system-btn').addEventListener('click', () => this.load());
  },

  render(d, container) {
    const memPct  = Math.round((d.memory.used / d.memory.total) * 100);
    const diskPct = Math.round((d.disk.used / d.disk.total) * 100);

    container.innerHTML = `
      <div class="sys-grid">
        <div class="sys-card">
          <div class="sys-card-label">CPU Cores</div>
          <div class="sys-card-value">${d.cpus}</div>
          <div class="sys-card-sub">Load: ${d.loadavg.map(l => l.toFixed(2)).join(' / ')}</div>
        </div>
        <div class="sys-card">
          <div class="sys-card-label">Memory</div>
          <div class="sys-card-value">${fmtBytes(d.memory.used)}</div>
          <div class="sys-card-sub">${fmtBytes(d.memory.total)} total (${memPct}% used)</div>
          <div class="progress-bar"><div class="progress-fill ${memPct > 90 ? 'danger' : memPct > 70 ? 'warning' : ''}" style="width:${memPct}%"></div></div>
        </div>
        <div class="sys-card">
          <div class="sys-card-label">Disk</div>
          <div class="sys-card-value">${fmtBytes(d.disk.used)}</div>
          <div class="sys-card-sub">${fmtBytes(d.disk.total)} total (${diskPct}% used)</div>
          <div class="progress-bar"><div class="progress-fill ${diskPct > 90 ? 'danger' : diskPct > 70 ? 'warning' : ''}" style="width:${diskPct}%"></div></div>
        </div>
        <div class="sys-card">
          <div class="sys-card-label">Uptime</div>
          <div class="sys-card-value" style="font-size:18px">${fmtUptime(d.uptime)}</div>
          <div class="sys-card-sub">${d.hostname}</div>
        </div>
        <div class="sys-card">
          <div class="sys-card-label">OS</div>
          <div class="sys-card-value" style="font-size:16px">${esc(d.osInfo.NAME || d.platform)}</div>
          <div class="sys-card-sub">${esc(d.osInfo.VERSION_ID || d.release)}</div>
        </div>
        <div class="sys-card">
          <div class="sys-card-label">Architecture</div>
          <div class="sys-card-value" style="font-size:18px">${esc(d.arch)}</div>
          <div class="sys-card-sub">${esc(d.platform)}</div>
        </div>
      </div>

      ${d.nginxInfo ? `
      <div style="margin-bottom:24px">
        <div class="section-header"><h3>Nginx</h3></div>
        <div class="info-box">
          <p><strong>Active sites:</strong> ${(d.nginxInfo.sites || []).filter(s => s !== 'default').map(esc).join(', ') || 'none'}</p>
        </div>
      </div>` : ''}

      <div>
        <div class="section-header"><h3>Installed Software</h3></div>
        <div class="software-grid">
          ${Object.entries(d.versions).map(([name, ver]) => `
            <div class="software-item">
              <div class="software-name">${esc(name)}</div>
              <div class="software-version">${esc(ver)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function fmtBytes(b) {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
}
function fmtUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}
