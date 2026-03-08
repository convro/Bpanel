const Logs = {
  eventSource: null,
  lineCount: 0,

  init() {
    document.getElementById('log-stream-btn').addEventListener('click', () => this.startStream());
    document.getElementById('log-clear-btn').addEventListener('click', () => this.clear());
    document.getElementById('log-filter-input').addEventListener('input', (e) => this.filter(e.target.value));
  },

  async loadSources() {
    try {
      const sources = await API.get('/api/logs/sources');
      const select = document.getElementById('log-source-select');
      select.innerHTML = '<option value="">Select source...</option>' +
        sources.map(s => `<option value="${esc(s.key)}" ${!s.available ? 'disabled' : ''}>${esc(s.label)}${!s.available ? ' (not available)' : ''}</option>`).join('');
    } catch {}
  },

  startStream() {
    const source = document.getElementById('log-source-select').value;
    if (!source) { Toast.info('Select a log source first'); return; }

    this.stopStream();
    this.clear();

    const btn = document.getElementById('log-stream-btn');
    btn.innerHTML = '<div class="spinner"></div> Streaming';
    btn.classList.add('btn-danger');

    this.eventSource = new EventSource(`/api/logs/stream/${encodeURIComponent(source)}`);

    this.eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.addLine(data.line);
    };

    this.eventSource.onerror = () => {
      this.stopStream();
      btn.innerHTML = '<i data-lucide="play" class="icon-sm"></i> Stream';
      btn.classList.remove('btn-danger');
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn });
    };

    btn.removeEventListener('click', this._streamClickHandler);
    this._streamClickHandler = () => {
      this.stopStream();
      btn.innerHTML = '<i data-lucide="play" class="icon-sm"></i> Stream';
      btn.classList.remove('btn-danger');
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: btn });
      btn.removeEventListener('click', this._streamClickHandler);
      btn.addEventListener('click', () => this.startStream());
    };
    btn.addEventListener('click', this._streamClickHandler, { once: true });
  },

  stopStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  },

  addLine(text) {
    const output = document.getElementById('log-output');
    const span = document.createElement('span');
    span.className = 'log-line ' + this.detectClass(text);
    span.textContent = text;
    output.appendChild(span);
    this.lineCount++;

    // Max 2000 lines
    if (this.lineCount > 2000) {
      output.removeChild(output.firstChild);
      this.lineCount--;
    }

    // Apply current filter
    const q = document.getElementById('log-filter-input').value;
    if (q && !text.toLowerCase().includes(q.toLowerCase())) {
      span.classList.add('hidden');
    }

    if (document.getElementById('log-autoscroll').checked) {
      output.scrollTop = output.scrollHeight;
    }
  },

  detectClass(line) {
    const l = line.toLowerCase();
    if (l.includes('error') || l.includes('crit') || l.includes('emerg') || l.includes('alert')) return 'log-line-error';
    if (l.includes('warn') || l.includes('notice')) return 'log-line-warn';
    return 'log-line-info';
  },

  filter(q) {
    document.querySelectorAll('#log-output .log-line').forEach(line => {
      if (!q || line.textContent.toLowerCase().includes(q.toLowerCase())) {
        line.classList.remove('hidden');
      } else {
        line.classList.add('hidden');
      }
    });
  },

  clear() {
    document.getElementById('log-output').innerHTML = '';
    this.lineCount = 0;
  },
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
