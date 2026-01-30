<?php require 'header.php'; ?>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="container hero-content">
      <div class="hero-badge">Open Source VPS Panel</div>
      <h1 class="hero-title">B<span>panel</span></h1>
      <p class="hero-tagline">Something fucking refreshing</p>
      <p class="hero-desc">A web-based VPS management panel built with Node.js. Full file manager, code editor, and terminal &mdash; right in your browser. No bloat, no bullshit.</p>
      <div class="hero-actions">
        <a href="/install.php" class="btn btn-primary btn-lg">Get Started</a>
        <a href="/docs.php" class="btn btn-outline btn-lg">Documentation</a>
      </div>
      <div class="hero-install">
        <code>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</code>
        <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)">Copy</button>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features" id="features">
    <div class="container">
      <div class="section-header">
        <h2>Everything you need.<br><span>Nothing you don't.</span></h2>
        <p>Built for developers who want a clean, fast panel without the enterprise garbage.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card" data-aos>
          <div class="feature-icon">&#128193;</div>
          <h3>File Manager</h3>
          <p>Browse your entire filesystem. Create, rename, delete files and folders. Sorted logically &mdash; directories first, files second. Context menus, quick actions, the works.</p>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-icon">&#9998;</div>
          <h3>Code Editor</h3>
          <p>Edit any file directly in your browser. Multiple tabs, Ctrl+S to save, tab indentation, unsaved changes warnings. Clean, fast, no-nonsense editing.</p>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-icon">&#9000;</div>
          <h3>Web Terminal</h3>
          <p>Full PTY terminal powered by xterm.js. Bash, vim, htop &mdash; whatever you need. Real terminal emulation with 256 colors, resizable, right in the browser.</p>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-icon">&#128274;</div>
          <h3>Auth System</h3>
          <p>First user becomes admin. JWT tokens in httpOnly cookies, bcrypt password hashing. Registration locks after first setup. Simple and secure.</p>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-icon">&#128203;</div>
          <h3>Session Management</h3>
          <p>Create multiple workspaces, each with its own working directory. Switch between projects. Resume where you left off. Everything stays organized.</p>
        </div>

        <div class="feature-card" data-aos>
          <div class="feature-icon">&#9889;</div>
          <h3>One-Line Install</h3>
          <p>Single bash command. Installs Node.js, sets up systemd service, starts automatically. From zero to running panel in under 2 minutes. No Docker needed.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Tech Stack -->
  <section class="tech-section">
    <div class="container">
      <div class="section-header">
        <h2>Built with<br><span>solid tech.</span></h2>
        <p>No frameworks you'll regret in 6 months. Just battle-tested tools.</p>
      </div>

      <div class="tech-grid">
        <div class="tech-item">
          <div class="tech-name">Node.js</div>
          <div class="tech-role">Runtime</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">Express</div>
          <div class="tech-role">HTTP Server</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">Socket.IO</div>
          <div class="tech-role">Real-time</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">node-pty</div>
          <div class="tech-role">Terminal PTY</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">xterm.js</div>
          <div class="tech-role">Terminal UI</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">SQLite</div>
          <div class="tech-role">Database</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">JWT</div>
          <div class="tech-role">Auth Tokens</div>
        </div>
        <div class="tech-item">
          <div class="tech-name">bcrypt</div>
          <div class="tech-role">Password Hash</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Preview -->
  <section class="preview-section">
    <div class="container">
      <div class="section-header">
        <h2>Dark by default.<br><span>Beautiful by design.</span></h2>
        <p>No eye-burning white themes. Bpanel looks good at 3 AM.</p>
      </div>
      <div class="preview-window">
        <div class="preview-titlebar">
          <div class="preview-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="preview-url">http://your-vps:9390</span>
        </div>
        <div class="preview-body">
          <div class="preview-sidebar">
            <div class="preview-path">/root/myproject</div>
            <div class="preview-file dir">&#128193; src</div>
            <div class="preview-file dir">&#128193; public</div>
            <div class="preview-file dir">&#128193; node_modules</div>
            <div class="preview-file active">&#128196; server.js</div>
            <div class="preview-file">&#128196; package.json</div>
            <div class="preview-file">&#128196; README.md</div>
            <div class="preview-file">&#128196; .env</div>
          </div>
          <div class="preview-main">
            <div class="preview-tabs">
              <span class="preview-tab active">server.js</span>
              <span class="preview-tab">package.json</span>
            </div>
            <div class="preview-code"><span class="code-keyword">const</span> <span class="code-var">express</span> = <span class="code-func">require</span>(<span class="code-str">'express'</span>);
<span class="code-keyword">const</span> <span class="code-var">app</span> = <span class="code-func">express</span>();

app.<span class="code-func">get</span>(<span class="code-str">'/'</span>, (<span class="code-var">req</span>, <span class="code-var">res</span>) => {
  res.<span class="code-func">send</span>(<span class="code-str">'Hello World'</span>);
});

app.<span class="code-func">listen</span>(<span class="code-num">3000</span>, () => {
  console.<span class="code-func">log</span>(<span class="code-str">'Running'</span>);
});</div>
            <div class="preview-terminal">
              <div class="preview-term-header">Terminal</div>
              <div class="preview-term-body">
                <span class="term-prompt">root@vps:~$</span> node server.js<br>
                <span class="term-output">Running</span><br>
                <span class="term-prompt">root@vps:~$</span> <span class="term-cursor">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="container">
      <h2>Ready to try something<br><span>fucking refreshing?</span></h2>
      <p>One command. One minute. Full control.</p>
      <div class="hero-install">
        <code>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</code>
        <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)">Copy</button>
      </div>
      <div class="cta-actions">
        <a href="/install.php" class="btn btn-primary btn-lg">Installation Guide</a>
        <a href="https://github.com/convro/Bpanel" class="btn btn-outline btn-lg" target="_blank">View on GitHub</a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-logo">B<span>panel</span></div>
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/docs.php">Docs</a>
        <a href="/install.php">Install</a>
        <a href="https://github.com/convro/Bpanel" target="_blank">GitHub</a>
      </div>
      <div class="footer-copy">&copy; <?= date('Y') ?> Bpanel. MIT License.</div>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>
