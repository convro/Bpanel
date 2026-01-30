<?php require 'header.php'; ?>

  <section class="docs-hero">
    <div class="container">
      <h1>Installation Guide</h1>
      <p>From zero to Bpanel in under 2 minutes.</p>
    </div>
  </section>

  <section class="install-content">
    <div class="container">
      <div class="install-steps">

        <div class="install-step" data-aos>
          <div class="step-number">1</div>
          <div class="step-content">
            <h2>Get a VPS</h2>
            <p>You need a VPS running <strong>Ubuntu 20.04+</strong> or <strong>Debian 11+</strong> with root access. Any provider works &mdash; Hetzner, DigitalOcean, OVH, Contabo, whatever.</p>
            <div class="step-reqs">
              <div class="req">
                <span class="req-label">OS</span>
                <span>Ubuntu 20.04+ / Debian 11+</span>
              </div>
              <div class="req">
                <span class="req-label">RAM</span>
                <span>512 MB minimum</span>
              </div>
              <div class="req">
                <span class="req-label">Disk</span>
                <span>~50 MB for Bpanel</span>
              </div>
              <div class="req">
                <span class="req-label">Access</span>
                <span>Root</span>
              </div>
            </div>
          </div>
        </div>

        <div class="install-step" data-aos>
          <div class="step-number">2</div>
          <div class="step-content">
            <h2>Run the Installer</h2>
            <p>SSH into your VPS as root and run:</p>
            <div class="code-block">
              <div class="code-header">
                <span>bash</span>
                <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)">Copy</button>
              </div>
              <pre>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</pre>
            </div>
            <p>The installer automatically:</p>
            <ul>
              <li>Installs Node.js 20 (if not present)</li>
              <li>Installs build tools (gcc, python3, make)</li>
              <li>Clones Bpanel to <code>/opt/bpanel</code></li>
              <li>Installs npm dependencies</li>
              <li>Creates a systemd service</li>
              <li>Starts Bpanel on port 9390</li>
            </ul>
            <div class="doc-info">
              <strong>Alternative:</strong> Manual install
              <div class="code-block" style="margin-top:12px">
                <div class="code-header"><span>bash</span></div>
                <pre>git clone https://github.com/convro/Bpanel.git /opt/bpanel
cd /opt/bpanel
npm install
node bpanel.js</pre>
              </div>
            </div>
          </div>
        </div>

        <div class="install-step" data-aos>
          <div class="step-number">3</div>
          <div class="step-content">
            <h2>Open Firewall</h2>
            <p>Make sure port <strong>9390</strong> is open. If you use UFW:</p>
            <div class="code-block">
              <div class="code-header">
                <span>bash</span>
                <button class="copy-btn" data-copy="ufw allow 9390/tcp">Copy</button>
              </div>
              <pre>ufw allow 9390/tcp</pre>
            </div>
            <p>Also check your VPS provider's firewall/security group settings if they have one.</p>
          </div>
        </div>

        <div class="install-step" data-aos>
          <div class="step-number">4</div>
          <div class="step-content">
            <h2>Open Bpanel</h2>
            <p>Navigate to your VPS IP + port in the browser:</p>
            <div class="code-block">
              <div class="code-header"><span>URL</span></div>
              <pre>http://YOUR_VPS_IP:9390</pre>
            </div>
            <p>You'll see the registration form. Create your account &mdash; the first user registered becomes the admin and registration locks after that.</p>
          </div>
        </div>

        <div class="install-step" data-aos>
          <div class="step-number">5</div>
          <div class="step-content">
            <h2>Create a Session</h2>
            <p>After logging in, click <strong>+ New Session</strong>. Give it a name and set the working directory (e.g. <code>/root</code> or <code>/var/www/myapp</code>).</p>
            <p>Click into the session to access the file manager, code editor, and terminal. You're done.</p>
          </div>
        </div>

      </div>

      <div class="install-extra">
        <h2>Optional: Domain + HTTPS</h2>
        <p>Want to use a domain like <code>panel.yourdomain.com</code>? Set up Nginx as a reverse proxy:</p>
        <div class="code-block">
          <div class="code-header">
            <span>/etc/nginx/sites-available/bpanel</span>
            <button class="copy-btn" data-copy="server {
    listen 80;
    server_name panel.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:9390;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection &quot;upgrade&quot;;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}">Copy</button>
          </div>
          <pre>server {
    listen 80;
    server_name panel.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:9390;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}</pre>
        </div>

        <div class="code-block" style="margin-top:16px">
          <div class="code-header"><span>bash</span></div>
          <pre>ln -s /etc/nginx/sites-available/bpanel /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install certbot python3-certbot-nginx
certbot --nginx -d panel.yourdomain.com</pre>
        </div>
      </div>

    </div>
  </section>

  <section class="cta-section">
    <div class="container">
      <h2>Need help?<br><span>Check the docs.</span></h2>
      <div class="cta-actions">
        <a href="/docs.php" class="btn btn-primary btn-lg">Full Documentation</a>
        <a href="https://github.com/convro/Bpanel/issues" class="btn btn-outline btn-lg" target="_blank">Report an Issue</a>
      </div>
    </div>
  </section>

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
