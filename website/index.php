<?php require 'header.php'; ?>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-grid"></div>
    </div>
    <div class="container hero-inner">
      <div class="hero-left">
        <a href="https://github.com/convro/Bpanel" target="_blank" class="hero-badge" rel="noopener">
          <span class="hero-badge-dot"></span>
          Open Source · MIT License
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>

        <h1 class="hero-title">
          The VPS panel<br>that <span>doesn't suck</span>.
        </h1>

        <p class="hero-desc">
          File manager, code editor, terminal, domains, SSL, databases, git, process manager, and live logs — all in your browser. Built with Node.js. No Docker. No configuration files. One command.
        </p>

        <div class="hero-actions">
          <a href="/install.php" class="btn btn-primary btn-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Get Started
          </a>
          <a href="https://github.com/convro/Bpanel" target="_blank" class="btn btn-ghost btn-lg" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            View on GitHub
          </a>
        </div>

        <div class="hero-install-wrap">
          <div class="hero-install">
            <span class="install-prompt">$</span>
            <code>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</code>
            <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)" aria-label="Copy install command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy
            </button>
          </div>
          <p class="install-note">Requires Ubuntu 20.04+ or Debian 11+ · Root access · ~2 min</p>
        </div>
      </div>

      <div class="hero-right">
        <div class="hero-window">
          <div class="window-bar">
            <div class="window-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="window-title">bpanel — root@vps-01</span>
          </div>
          <div class="hero-ui">
            <!-- Sidebar -->
            <div class="ui-sidebar">
              <div class="ui-logo">B<span>p</span></div>
              <nav class="ui-nav">
                <div class="ui-nav-item active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </div>
                <div class="ui-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                </div>
                <div class="ui-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="ui-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                </div>
                <div class="ui-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
              </nav>
            </div>
            <!-- Main content -->
            <div class="ui-main">
              <div class="ui-topbar">
                <div class="ui-search">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Quick search...
                  <span class="ui-kbd">⌘K</span>
                </div>
              </div>
              <div class="ui-content">
                <div class="ui-section-title">Sessions</div>
                <div class="ui-cards">
                  <div class="ui-card ui-card-active">
                    <div class="ui-card-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    </div>
                    <div>
                      <div class="ui-card-name">API Project</div>
                      <div class="ui-card-path">/root/api</div>
                    </div>
                  </div>
                  <div class="ui-card">
                    <div class="ui-card-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    </div>
                    <div>
                      <div class="ui-card-name">Frontend</div>
                      <div class="ui-card-path">/var/www</div>
                    </div>
                  </div>
                  <div class="ui-card ui-card-new">
                    <span>+</span> New Session
                  </div>
                </div>
                <div class="ui-stats-row">
                  <div class="ui-stat">
                    <div class="ui-stat-label">CPU</div>
                    <div class="ui-stat-bar"><div class="ui-stat-fill" style="width:34%"></div></div>
                    <div class="ui-stat-val">34%</div>
                  </div>
                  <div class="ui-stat">
                    <div class="ui-stat-label">RAM</div>
                    <div class="ui-stat-bar"><div class="ui-stat-fill" style="width:61%"></div></div>
                    <div class="ui-stat-val">61%</div>
                  </div>
                  <div class="ui-stat">
                    <div class="ui-stat-label">Disk</div>
                    <div class="ui-stat-bar"><div class="ui-stat-fill" style="width:22%"></div></div>
                    <div class="ui-stat-val">22%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="container stats-inner">
      <div class="stat-item">
        <span class="stat-num">10+</span>
        <span class="stat-label">Built-in tools</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">&lt;2min</span>
        <span class="stat-label">Install time</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">0</span>
        <span class="stat-label">Config files needed</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">MIT</span>
        <span class="stat-label">Open source</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">Node.js</span>
        <span class="stat-label">No Docker required</span>
      </div>
    </div>
  </div>

  <!-- Features -->
  <section class="features" id="features">
    <div class="container">
      <div class="section-label">Features</div>
      <div class="section-header">
        <h2>Everything you need.<br><span>Nothing you don't.</span></h2>
        <p>Built for developers who want full server control without the enterprise bloat of cPanel, Plesk, or Webmin.</p>
      </div>

      <div class="features-grid">

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            </div>
            <h3>File Manager</h3>
          </div>
          <p>Full filesystem access with directory-first sorting, drag & drop upload, ZIP download, context menus, rename, delete, and in-browser editing. No limits on what you can access.</p>
          <div class="feature-tags">
            <span>Drag & Drop</span><span>ZIP Download</span><span>Context Menu</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <h3>Code Editor</h3>
          </div>
          <p>Syntax highlighting for 30+ languages via highlight.js. Multi-file tabs with modified indicators, Ctrl+S to save, Tab indentation, unsaved change warnings.</p>
          <div class="feature-tags">
            <span>30+ Languages</span><span>Multi-tab</span><span>Syntax Highlight</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            </div>
            <h3>Web Terminal</h3>
          </div>
          <p>Full PTY terminal powered by xterm.js and node-pty. 256 colors, resizable, persistent sessions. Run bash, vim, htop, npm — real terminal emulation, right in the browser.</p>
          <div class="feature-tags">
            <span>PTY</span><span>256 Colors</span><span>Resizable</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            </div>
            <h3>Domain Manager</h3>
          </div>
          <p>Full Nginx vhost management. Add static sites or reverse proxies in seconds. Edit raw config with live <code>nginx -t</code> validation before saving. Enable/disable without deleting.</p>
          <div class="feature-tags">
            <span>Nginx</span><span>Config Editor</span><span>Reverse Proxy</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>SSL Certificates</h3>
          </div>
          <p>Let's Encrypt via Certbot — one click to issue, auto-installs Certbot if missing, HTTPS redirect configured automatically. See expiry dates. Renew all with one button.</p>
          <div class="feature-tags">
            <span>Let's Encrypt</span><span>Auto-renew</span><span>One click</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </div>
            <h3>Database Manager</h3>
          </div>
          <p>PostgreSQL and MariaDB. Create databases and users, set permissions, get instant connection strings. Built-in SQL query editor. Install engines with one click if not present.</p>
          <div class="feature-tags">
            <span>PostgreSQL</span><span>MariaDB</span><span>SQL Editor</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/></svg>
            </div>
            <h3>Process Manager</h3>
          </div>
          <p>Live process table sorted by CPU usage with filtering and kill signals. Full PM2 integration — restart, stop, reload, delete services. No SSH needed to manage running apps.</p>
          <div class="feature-tags">
            <span>Live Table</span><span>PM2</span><span>Kill Signals</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3>Live Log Viewer</h3>
          </div>
          <p>Real-time log streaming via Server-Sent Events. Nginx access/error logs, journald service logs. Filter by keyword, auto-scroll toggle, color-coded error/warn/info levels.</p>
          <div class="feature-tags">
            <span>SSE Streaming</span><span>Filter</span><span>journald</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
            </div>
            <h3>Git Integration</h3>
          </div>
          <p>Per-workspace git panel showing branch, status, staged/unstaged files. Commit with message, push, pull, discard file changes — without leaving the browser.</p>
          <div class="feature-tags">
            <span>Status</span><span>Commit</span><span>Push / Pull</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3>Command Palette</h3>
          </div>
          <p>Press <kbd>Ctrl+K</kbd> to open. Instantly search sessions, navigate between sections, trigger actions — keyboard-first workflow for power users.</p>
          <div class="feature-tags">
            <span>Ctrl+K</span><span>Fuzzy Search</span><span>Keyboard-first</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3>System Monitor</h3>
          </div>
          <p>CPU, memory, and disk usage with progress bars. Uptime, load average, OS info, kernel version. Auto-detects installed software — Node, PHP, Python, Docker, Go, Rust, and 20+ more.</p>
          <div class="feature-tags">
            <span>Resource Usage</span><span>Software Inventory</span><span>Live</span>
          </div>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-card-header">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h3>Auth & Security</h3>
          </div>
          <p>JWT tokens in httpOnly cookies, bcrypt password hashing, rate-limited auth (30 req/15min), security headers, path traversal protection. First user is admin, registration locks after setup.</p>
          <div class="feature-tags">
            <span>JWT</span><span>bcrypt</span><span>Rate Limiting</span>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Preview: Workspace -->
  <section class="preview-section">
    <div class="container">
      <div class="section-label">Workspace</div>
      <div class="section-header">
        <h2>Code, edit, deploy —<br><span>without leaving the browser.</span></h2>
        <p>File manager, code editor with syntax highlighting, and a real terminal — all in one split-pane workspace.</p>
      </div>

      <div class="preview-window preview-window-wide" data-aos>
        <div class="preview-titlebar">
          <div class="preview-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <span class="preview-url">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            bpanel.yourdomain.com
          </span>
          <div class="preview-tabs-bar">
            <span class="preview-tab-top active">Editor</span>
            <span class="preview-tab-top">Git</span>
          </div>
        </div>
        <div class="preview-workspace-body">
          <div class="preview-sidebar">
            <div class="preview-path">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              /root/myproject
            </div>
            <div class="preview-file pf-dir">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> src
            </div>
            <div class="preview-file pf-dir">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> public
            </div>
            <div class="preview-file pf-active">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> server.js
            </div>
            <div class="preview-file">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> package.json
            </div>
            <div class="preview-file">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> .env
            </div>
          </div>
          <div class="preview-editor-area">
            <div class="preview-tabs">
              <span class="preview-tab pf-active">server.js</span>
              <span class="preview-tab">package.json</span>
            </div>
            <div class="preview-code"><span class="pk">const</span> <span class="pv">express</span> = <span class="pf">require</span>(<span class="ps">'express'</span>);
<span class="pk">const</span> <span class="pv">app</span> = <span class="pf">express</span>();

app.<span class="pf">use</span>(express.<span class="pf">json</span>());

app.<span class="pf">get</span>(<span class="ps">'/'</span>, (<span class="pv">req</span>, <span class="pv">res</span>) => {
  res.<span class="pf">json</span>({ <span class="pv">status</span>: <span class="ps">'ok'</span> });
});

app.<span class="pf">listen</span>(<span class="pn">3000</span>);</div>
            <div class="preview-terminal">
              <div class="preview-term-header">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                Terminal
              </div>
              <div class="preview-term-body">
                <span class="tp">root@vps:~$</span> node server.js<br>
                <span class="to">Listening on port 3000</span><br>
                <span class="tp">root@vps:~$</span> <span class="tc">█</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tech Stack -->
  <section class="tech-section">
    <div class="container">
      <div class="section-label">Stack</div>
      <div class="section-header">
        <h2>Solid foundations.<br><span>Zero regrets.</span></h2>
        <p>Battle-tested tools. No frameworks you'll abandon in 6 months. No abstraction layers nobody asked for.</p>
      </div>
      <div class="tech-grid">
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
          </div>
          <div class="tech-name">Node.js 18+</div>
          <div class="tech-role">Runtime</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l3 3-3 3M13 15h3"/></svg>
          </div>
          <div class="tech-name">Express</div>
          <div class="tech-role">HTTP Server</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="tech-name">Socket.IO</div>
          <div class="tech-role">Real-time</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-yellow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <div class="tech-name">node-pty</div>
          <div class="tech-role">Terminal PTY</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div class="tech-name">xterm.js</div>
          <div class="tech-role">Terminal UI</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <div class="tech-name">SQLite</div>
          <div class="tech-role">Internal DB</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div class="tech-name">JWT + bcrypt</div>
          <div class="tech-role">Auth</div>
        </div>
        <div class="tech-card" data-aos>
          <div class="tech-icon tc-indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <div class="tech-name">Vanilla JS</div>
          <div class="tech-role">No framework</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Why Bpanel comparison -->
  <section class="compare-section">
    <div class="container">
      <div class="section-label">Why Bpanel</div>
      <div class="section-header">
        <h2>Not another<br><span>enterprise panel.</span></h2>
        <p>Designed for developers who just want to run their app, not configure infrastructure.</p>
      </div>

      <div class="compare-table-wrap" data-aos>
        <table class="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th class="col-bp"><span class="bp-logo-sm">Bpanel</span></th>
              <th>cPanel</th>
              <th>Plesk</th>
              <th>Cockpit</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>One-line install</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td><td><span class="chk">✓</span></td></tr>
            <tr><td>Free &amp; open source</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="cross">✗ $20+/mo</span></td><td><span class="cross">✗ $15+/mo</span></td><td><span class="chk">✓</span></td></tr>
            <tr><td>Code editor in browser</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="chk">basic</span></td><td><span class="chk">basic</span></td><td><span class="cross">✗</span></td></tr>
            <tr><td>Git integration</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td></tr>
            <tr><td>Process manager</td><td class="col-bp"><span class="chk">✓ + PM2</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td><td><span class="chk">basic</span></td></tr>
            <tr><td>Live log streaming</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td><td><span class="chk">✓</span></td></tr>
            <tr><td>Command palette</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td><td><span class="cross">✗</span></td></tr>
            <tr><td>SQL query editor</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="chk">via phpMyAdmin</span></td><td><span class="chk">via phpMyAdmin</span></td><td><span class="cross">✗</span></td></tr>
            <tr><td>No Docker required</td><td class="col-bp"><span class="chk">✓</span></td><td><span class="chk">✓</span></td><td><span class="chk">✓</span></td><td><span class="chk">✓</span></td></tr>
            <tr><td>RAM overhead</td><td class="col-bp"><span class="chk">~50 MB</span></td><td><span class="cross">&gt;1 GB</span></td><td><span class="cross">&gt;500 MB</span></td><td><span class="chk">~30 MB</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="cta-bg">
      <div class="cta-orb"></div>
    </div>
    <div class="container cta-inner">
      <div class="cta-text">
        <h2>One command.<br><span>Full control.</span></h2>
        <p>Ready to stop SSHing into your server for every little thing?</p>
      </div>
      <div class="cta-right">
        <div class="hero-install">
          <span class="install-prompt">$</span>
          <code>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</code>
          <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy
          </button>
        </div>
        <div class="cta-actions">
          <a href="/install.php" class="btn btn-primary btn-lg">Installation Guide →</a>
          <a href="https://github.com/convro/Bpanel" class="btn btn-ghost btn-lg" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="footer-logo"><span class="footer-logo-icon">B</span>panel</div>
        <p class="footer-tagline">Something fucking refreshing.</p>
        <p class="footer-copy">MIT License &copy; <?= date('Y') ?></p>
      </div>
      <div class="footer-links-group">
        <div class="footer-col">
          <div class="footer-col-title">Product</div>
          <a href="/">Home</a>
          <a href="/install.php">Install</a>
          <a href="/docs.php">Documentation</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Features</div>
          <a href="/#features">File Manager</a>
          <a href="/#features">Terminal</a>
          <a href="/#features">Domains & SSL</a>
          <a href="/#features">Databases</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Links</div>
          <a href="https://github.com/convro/Bpanel" target="_blank" rel="noopener">GitHub</a>
          <a href="https://github.com/convro/Bpanel/issues" target="_blank" rel="noopener">Report Issue</a>
          <a href="https://github.com/convro/Bpanel/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>
