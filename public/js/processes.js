const Processes = {
  allProcesses: [],

  init() {
    document.getElementById('refresh-processes-btn').addEventListener('click', () => this.load());
    document.getElementById('process-filter').addEventListener('input', (e) => this.filterProcesses(e.target.value));
  },

  async load() {
    await Promise.all([this.loadPm2(), this.loadProcesses()]);
  },

  async loadPm2() {
    try {
      const data = await API.get('/api/processes/pm2');
      const section = document.getElementById('pm2-section');
      const list = document.getElementById('pm2-list');

      if (!data.installed || data.processes.length === 0) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';
      list.innerHTML = data.processes.map(p => `
        <div class="pm2-card">
          <div>
            <div class="pm2-name">${esc(p.name || p.pm2_env?.name || 'unknown')}</div>
            <div class="pm2-meta">
              PID: ${p.pid || '-'} &nbsp;•&nbsp;
              Status: <span style="color:${p.pm2_env?.status === 'online' ? 'var(--success)' : 'var(--danger)'}">${esc(p.pm2_env?.status || '-')}</span> &nbsp;•&nbsp;
              CPU: ${p.monit?.cpu ?? '-'}% &nbsp;•&nbsp;
              Mem: ${fmtBytes(p.monit?.memory ?? 0)}
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm pm2-action" data-action="restart" data-name="${esc(p.name)}">Restart</button>
            <button class="btn btn-sm pm2-action" data-action="stop" data-name="${esc(p.name)}">Stop</button>
            <button class="btn btn-sm btn-danger pm2-action" data-action="delete" data-name="${esc(p.name)}">Delete</button>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('.pm2-action').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            await API.post(`/api/processes/pm2/${btn.dataset.action}/${btn.dataset.name}`);
            Toast.success(`PM2: ${btn.dataset.name} ${btn.dataset.action}ed`);
            this.loadPm2();
          } catch (err) { Toast.error(err.message); btn.disabled = false; }
        });
      });
    } catch {}
  },

  async loadProcesses() {
    const tbody = document.getElementById('process-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading"><div class="spinner"></div> Loading...</td></tr>';
    try {
      this.allProcesses = await API.get('/api/processes');
      this.renderProcesses(this.allProcesses);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="padding:12px;color:var(--danger)">${esc(err.message)}</td></tr>`;
    }
  },

  renderProcesses(processes) {
    const tbody = document.getElementById('process-tbody');
    const top100 = processes.slice(0, 100);

    tbody.innerHTML = top100.map(p => `
      <tr>
        <td>${p.pid}</td>
        <td>${esc(p.user)}</td>
        <td style="color:${p.cpu > 50 ? 'var(--danger)' : p.cpu > 20 ? 'var(--warning)' : ''}">${p.cpu.toFixed(1)}</td>
        <td>${p.mem.toFixed(1)}</td>
        <td><span class="badge ${p.stat?.startsWith('S') ? 'badge-muted' : p.stat?.startsWith('R') ? 'badge-success' : 'badge-warning'}">${esc(p.stat)}</span></td>
        <td class="cmd-cell" title="${esc(p.command)}">${esc(p.command)}</td>
        <td>
          <button class="btn btn-sm btn-danger kill-proc" data-pid="${p.pid}" title="Kill process">
            <i data-lucide="x" class="icon-xs"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ el: tbody });

    tbody.querySelectorAll('.kill-proc').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Kill process ${btn.dataset.pid}?`)) return;
        try {
          await API.del(`/api/processes/${btn.dataset.pid}`);
          Toast.success('Process killed');
          this.loadProcesses();
        } catch (err) { Toast.error(err.message); }
      });
    });
  },

  filterProcesses(q) {
    if (!q) {
      this.renderProcesses(this.allProcesses);
      return;
    }
    const filtered = this.allProcesses.filter(p =>
      p.command.toLowerCase().includes(q.toLowerCase()) ||
      p.user.toLowerCase().includes(q.toLowerCase()) ||
      String(p.pid).includes(q)
    );
    this.renderProcesses(filtered);
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function fmtBytes(b) {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
}
