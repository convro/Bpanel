<?php require 'header.php'; ?>

  <section class="docs-hero">
    <div class="container">
      <h1>Documentation</h1>
      <p>Everything you need to know about Bpanel.</p>
    </div>
  </section>

  <section class="docs-content">
    <div class="container docs-layout">
      <aside class="docs-sidebar" id="docs-sidebar">
        <nav class="docs-nav">
          <h4>Getting Started</h4>
          <a href="#overview" class="active">Overview</a>
          <a href="#requirements">Requirements</a>
          <a href="#quickstart">Quick Start</a>

          <h4>Features</h4>
          <a href="#file-manager">File Manager</a>
          <a href="#code-editor">Code Editor</a>
          <a href="#web-terminal">Web Terminal</a>
          <a href="#sessions">Sessions</a>
          <a href="#auth">Authentication</a>
          <a href="#domain-manager">Domain Manager</a>
          <a href="#ssl-manager">SSL Manager</a>
          <a href="#database-manager">Database Manager</a>
          <a href="#system-info">System Monitor</a>

          <h4>Configuration</h4>
          <a href="#port">Port</a>
          <a href="#env-vars">Environment Variables</a>
          <a href="#systemd">Systemd Service</a>

          <h4>Advanced</h4>
          <a href="#reverse-proxy">Reverse Proxy (Nginx)</a>
          <a href="#ssl">SSL / HTTPS</a>
          <a href="#updating">Updating</a>
        </nav>
      </aside>

      <main class="docs-main">
        <article>
          <section id="overview" class="doc-section">
            <h2>Overview</h2>
            <p>Bpanel is a web-based VPS management panel built with Node.js. It gives you a file manager, code editor, and full terminal &mdash; all from your browser. No SSH client needed.</p>
            <p>It runs as a single Node.js process on port <code>9390</code> and uses SQLite for storage. No external databases, no Docker, no complexity.</p>
            <div class="doc-info">
              <strong>Key Points:</strong>
              <ul>
                <li>Runs on port 9390 by default</li>
                <li>SQLite database (zero configuration)</li>
                <li>First registered user becomes admin</li>
                <li>Full root filesystem access</li>
                <li>Systemd managed service</li>
              </ul>
            </div>
          </section>

          <section id="requirements" class="doc-section">
            <h2>Requirements</h2>
            <table class="doc-table">
              <tr><td>OS</td><td>Ubuntu 20.04+ / Debian 11+</td></tr>
              <tr><td>Node.js</td><td>18+ (auto-installed)</td></tr>
              <tr><td>RAM</td><td>512 MB minimum</td></tr>
              <tr><td>Disk</td><td>~50 MB for Bpanel itself</td></tr>
              <tr><td>Access</td><td>Root privileges</td></tr>
            </table>
          </section>

          <section id="quickstart" class="doc-section">
            <h2>Quick Start</h2>
            <p>Run this as root on your VPS:</p>
            <div class="code-block">
              <div class="code-header">
                <span>bash</span>
                <button class="copy-btn" data-copy="bash <(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)">Copy</button>
              </div>
              <pre>bash &lt;(curl -fsSL https://raw.githubusercontent.com/convro/Bpanel/main/install.sh)</pre>
            </div>
            <p>The installer will:</p>
            <ol>
              <li>Install Node.js 20 if not present</li>
              <li>Install build dependencies (gcc, python3, git)</li>
              <li>Clone Bpanel to <code>/opt/bpanel</code></li>
              <li>Run <code>npm install</code></li>
              <li>Create and start a systemd service</li>
              <li>Print the access URL</li>
            </ol>
            <p>Open <code>http://your-vps-ip:9390</code> in your browser and create your account.</p>
          </section>

          <section id="file-manager" class="doc-section">
            <h2>File Manager</h2>
            <p>The sidebar shows your current directory. Files and folders are sorted logically &mdash; directories first (alphabetical), then files (alphabetical).</p>
            <h3>Actions</h3>
            <ul>
              <li><strong>Click folder</strong> &mdash; open directory</li>
              <li><strong>Click file</strong> &mdash; open in editor</li>
              <li><strong>Right-click</strong> &mdash; context menu (rename, delete)</li>
              <li><strong>+f button</strong> &mdash; create new file</li>
              <li><strong>+d button</strong> &mdash; create new folder</li>
              <li><strong>&uarr; button</strong> &mdash; go up one directory</li>
            </ul>
            <p>The sidebar is resizable &mdash; drag the border between sidebar and editor.</p>
          </section>

          <section id="code-editor" class="doc-section">
            <h2>Code Editor</h2>
            <p>Click any file in the sidebar to open it in the editor. Multiple files can be open as tabs.</p>
            <h3>Keyboard Shortcuts</h3>
            <table class="doc-table">
              <tr><td><kbd>Ctrl + S</kbd></td><td>Save current file</td></tr>
              <tr><td><kbd>Tab</kbd></td><td>Insert 2 spaces</td></tr>
            </table>
            <p>Modified files show a <span style="color:#d29922">&bull;</span> dot in the tab. Closing an unsaved tab prompts a confirmation.</p>
          </section>

          <section id="web-terminal" class="doc-section">
            <h2>Web Terminal</h2>
            <p>Click the <strong>Terminal</strong> button in the top bar to toggle the terminal panel. It opens a full bash shell via PTY (node-pty + xterm.js).</p>
            <ul>
              <li>Full 256-color support</li>
              <li>Resizable (drag the top border)</li>
              <li>Works with vim, htop, nano, and any CLI tool</li>
              <li>Terminal starts in the session's working directory</li>
            </ul>
          </section>

          <section id="sessions" class="doc-section">
            <h2>Sessions</h2>
            <p>Sessions are workspaces tied to a directory. Each session remembers its working directory. You can create multiple sessions for different projects.</p>
            <div class="code-block">
              <div class="code-header"><span>Example</span></div>
              <pre>Session: "My API"     &rarr; /root/api-project
Session: "Frontend"   &rarr; /var/www/frontend
Session: "Configs"    &rarr; /etc</pre>
            </div>
          </section>

          <section id="auth" class="doc-section">
            <h2>Authentication</h2>
            <p>On first visit, Bpanel shows a registration form. The first user registered becomes the only user. After that, registration is locked.</p>
            <ul>
              <li>Passwords hashed with bcrypt (12 rounds)</li>
              <li>JWT tokens stored in httpOnly cookies</li>
              <li>Tokens expire after 7 days</li>
              <li>Minimum password length: 6 characters</li>
            </ul>
          </section>

          <section id="domain-manager" class="doc-section">
            <h2>Domain Manager</h2>
            <p>Manage Nginx virtual hosts directly from Bpanel. Add domains, configure static sites or reverse proxies, edit raw configs &mdash; all without SSH.</p>

            <h3>Adding a Domain</h3>
            <p>Go to the <strong>Domains</strong> tab in the dashboard. Click <strong>Add Domain</strong> and fill in:</p>
            <ul>
              <li><strong>Domain name</strong> &mdash; e.g., <code>example.com</code></li>
              <li><strong>Type</strong> &mdash; Static (HTML/PHP) or Reverse Proxy</li>
              <li><strong>Root directory</strong> &mdash; for static sites (e.g., <code>/var/www/example</code>)</li>
              <li><strong>Proxy port</strong> &mdash; for reverse proxy (e.g., <code>3000</code>)</li>
            </ul>
            <p>Bpanel automatically creates the Nginx config, enables the site, tests the configuration, and reloads Nginx.</p>

            <h3>Configuration Types</h3>
            <div class="code-block">
              <div class="code-header"><span>Static Site (HTML/PHP)</span></div>
              <pre>server {
    listen 80;
    server_name example.com;
    root /var/www/example.com;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }
}</pre>
            </div>
            <div class="code-block">
              <div class="code-header"><span>Reverse Proxy (Node.js, Python, etc.)</span></div>
              <pre>server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}</pre>
            </div>

            <h3>Actions</h3>
            <ul>
              <li><strong>Edit Config</strong> &mdash; Open raw Nginx config in editor</li>
              <li><strong>Enable/Disable</strong> &mdash; Toggle site without deleting</li>
              <li><strong>Delete</strong> &mdash; Remove config file entirely</li>
            </ul>
            <div class="doc-info">
              <strong>Note:</strong> All config changes are tested with <code>nginx -t</code> before applying. If test fails, changes are rolled back automatically.
            </div>
          </section>

          <section id="ssl-manager" class="doc-section">
            <h2>SSL Manager</h2>
            <p>Manage Let's Encrypt SSL certificates through Certbot &mdash; directly from the UI. Issue, view, and revoke certificates without touching the command line.</p>

            <h3>Prerequisites</h3>
            <p>SSL Manager requires Certbot. If not installed, Bpanel shows an install button that runs:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>apt install -y certbot python3-certbot-nginx</pre>
            </div>

            <h3>Issuing a Certificate</h3>
            <p>Go to the <strong>SSL</strong> tab. Click <strong>Issue Certificate</strong> and provide:</p>
            <ul>
              <li><strong>Domain</strong> &mdash; Must already have DNS pointing to this server</li>
              <li><strong>Email</strong> &mdash; For renewal notifications (optional but recommended)</li>
            </ul>
            <p>Bpanel runs:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>certbot --nginx -d example.com --email you@email.com --agree-tos --non-interactive --redirect</pre>
            </div>
            <p>This automatically configures HTTPS and sets up HTTP &rarr; HTTPS redirect.</p>

            <h3>Certificate List</h3>
            <p>View all certificates with:</p>
            <ul>
              <li>Certificate name</li>
              <li>Covered domains</li>
              <li>Expiration date (with color indicators)</li>
              <li>Certificate path on disk</li>
              <li>Status (VALID / INVALID / EXPIRING SOON)</li>
            </ul>

            <h3>Actions</h3>
            <ul>
              <li><strong>Renew All</strong> &mdash; Runs <code>certbot renew</code></li>
              <li><strong>Revoke</strong> &mdash; Revokes individual certificate</li>
            </ul>
            <div class="doc-warning">
              <strong>Note:</strong> Domain DNS must point to your server before issuing. Let's Encrypt validates by connecting to port 80.
            </div>
          </section>

          <section id="database-manager" class="doc-section">
            <h2>Database Manager</h2>
            <p>Create and manage PostgreSQL and MariaDB databases. Set up users, permissions, and get connection strings &mdash; all from the dashboard.</p>

            <h3>Supported Databases</h3>
            <table class="doc-table">
              <tr><th>Engine</th><th>Port</th><th>Status</th></tr>
              <tr><td>PostgreSQL</td><td>5432</td><td>Auto-detected</td></tr>
              <tr><td>MariaDB / MySQL</td><td>3306</td><td>Auto-detected</td></tr>
            </table>
            <p>If not installed, click the <strong>Install</strong> button to set up the engine.</p>

            <h3>Creating a Database</h3>
            <p>Go to the <strong>Databases</strong> tab. Click <strong>Create Database</strong> and provide:</p>
            <ul>
              <li><strong>Engine</strong> &mdash; PostgreSQL or MariaDB</li>
              <li><strong>Database name</strong></li>
              <li><strong>Username</strong> &mdash; A new user is created</li>
              <li><strong>Password</strong> &mdash; For the new user</li>
            </ul>
            <p>Bpanel automatically:</p>
            <ol>
              <li>Creates the database</li>
              <li>Creates the user with password</li>
              <li>Grants all privileges on the database</li>
              <li>Shows you the connection string</li>
            </ol>

            <h3>Connection Strings</h3>
            <div class="code-block">
              <div class="code-header"><span>PostgreSQL</span></div>
              <pre>postgresql://username:password@localhost:5432/dbname</pre>
            </div>
            <div class="code-block">
              <div class="code-header"><span>MariaDB / MySQL</span></div>
              <pre>mysql://username:password@localhost:3306/dbname</pre>
            </div>

            <h3>SQL Terminal</h3>
            <p>Click the <strong>Connect</strong> button on any database to open a terminal session directly connected to that database (<code>psql</code> or <code>mysql</code> client).</p>
          </section>

          <section id="system-info" class="doc-section">
            <h2>System Monitor</h2>
            <p>View server resources and installed software at a glance. CPU, memory, disk usage, plus auto-detection of 25+ common tools.</p>

            <h3>Resource Monitoring</h3>
            <table class="doc-table">
              <tr><th>Metric</th><th>Details</th></tr>
              <tr><td>CPU</td><td>Core count, load average (1m, 5m, 15m)</td></tr>
              <tr><td>Memory</td><td>Total, used, free &mdash; with percentage bar</td></tr>
              <tr><td>Disk</td><td>Total, used, free &mdash; with percentage bar</td></tr>
              <tr><td>Uptime</td><td>System uptime in days/hours/minutes</td></tr>
            </table>
            <p>Progress bars change color based on usage: green (&lt;60%), yellow (60-85%), red (&gt;85%).</p>

            <h3>Server Information</h3>
            <ul>
              <li>Hostname</li>
              <li>Operating System (Ubuntu, Debian, etc.)</li>
              <li>Architecture (x64, arm64)</li>
              <li>Kernel version</li>
            </ul>

            <h3>Installed Software Detection</h3>
            <p>Bpanel auto-detects and shows versions for:</p>
            <div class="code-block">
              <div class="code-header"><span>Detected Software</span></div>
              <pre>Web Servers:    nginx, apache2
Languages:      node, php, python3, ruby, go, rust, java
Package Mgrs:   npm, yarn, composer, pip
Databases:      postgresql, mysql, redis, mongodb
DevOps:         docker, git, make, gcc
Utilities:      certbot, pm2, curl, wget, ufw</pre>
            </div>

            <h3>Nginx Status</h3>
            <p>If Nginx is installed, the System tab also shows:</p>
            <ul>
              <li>Config test result (<code>nginx -t</code>)</li>
              <li>List of enabled sites from <code>/etc/nginx/sites-enabled/</code></li>
            </ul>
          </section>

          <section id="port" class="doc-section">
            <h2>Port Configuration</h2>
            <p>Default port is <code>9390</code>. Change it with the environment variable:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>BPANEL_PORT=8080 node bpanel.js</pre>
            </div>
            <p>Or edit the systemd service:</p>
            <div class="code-block">
              <div class="code-header"><span>/etc/systemd/system/bpanel.service</span></div>
              <pre>Environment=NODE_ENV=production
Environment=BPANEL_PORT=8080</pre>
            </div>
            <p>Then reload: <code>systemctl daemon-reload && systemctl restart bpanel</code></p>
          </section>

          <section id="env-vars" class="doc-section">
            <h2>Environment Variables</h2>
            <table class="doc-table">
              <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
              <tr><td><code>BPANEL_PORT</code></td><td>9390</td><td>HTTP port</td></tr>
              <tr><td><code>BPANEL_JWT_SECRET</code></td><td>random</td><td>JWT signing secret (auto-generated if not set)</td></tr>
            </table>
            <div class="doc-warning">
              <strong>Note:</strong> If you don't set <code>BPANEL_JWT_SECRET</code>, a random secret is generated on each restart. This means all users get logged out when the service restarts. Set a fixed secret in production.
            </div>
          </section>

          <section id="systemd" class="doc-section">
            <h2>Systemd Service</h2>
            <p>The installer creates a systemd service automatically. Useful commands:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>systemctl status bpanel     # Check status
systemctl restart bpanel    # Restart
systemctl stop bpanel       # Stop
systemctl start bpanel      # Start
journalctl -u bpanel -f     # Live logs
journalctl -u bpanel -n 50  # Last 50 lines</pre>
            </div>
          </section>

          <section id="reverse-proxy" class="doc-section">
            <h2>Reverse Proxy (Nginx)</h2>
            <p>To use Bpanel with a domain and Nginx:</p>
            <div class="code-block">
              <div class="code-header"><span>/etc/nginx/sites-available/bpanel</span></div>
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}</pre>
            </div>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>ln -s /etc/nginx/sites-available/bpanel /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx</pre>
            </div>
          </section>

          <section id="ssl" class="doc-section">
            <h2>SSL / HTTPS</h2>
            <p>With Nginx set up, add SSL with Certbot:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>apt install certbot python3-certbot-nginx
certbot --nginx -d panel.yourdomain.com</pre>
            </div>
            <p>Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.</p>
          </section>

          <section id="updating" class="doc-section">
            <h2>Updating</h2>
            <p>To update Bpanel to the latest version:</p>
            <div class="code-block">
              <div class="code-header"><span>bash</span></div>
              <pre>cd /opt/bpanel
git pull origin main
npm install
systemctl restart bpanel</pre>
            </div>
          </section>
        </article>
      </main>
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
