const Auth = {
  isSetup: false,

  init() {
    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });

    const toggle = document.getElementById('auth-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleMode());
    }
  },

  async checkStatus() {
    const status = await API.get('/api/auth/status');
    this.isSetup = !status.needsSetup;

    const toggle = document.getElementById('auth-toggle');
    if (status.needsSetup) {
      document.getElementById('auth-title').textContent = 'Create Admin Account';
      document.getElementById('auth-submit').textContent = 'Create Account';
      if (toggle) toggle.innerHTML = '';
    } else {
      document.getElementById('auth-title').textContent = 'Sign in';
      document.getElementById('auth-submit').textContent = 'Sign in';
      if (toggle) toggle.innerHTML = '';
    }

    return status;
  },

  async submit() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errEl    = document.getElementById('auth-error');
    const btn      = document.getElementById('auth-submit');

    errEl.textContent = '';
    if (!username || !password) { errEl.textContent = 'Username and password required'; return; }

    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = 'Please wait...';

    try {
      const endpoint = !this.isSetup ? '/api/auth/register' : '/api/auth/login';
      const result = await API.post(endpoint, { username, password });
      App.currentUser = result.user;
      document.getElementById('user-display').textContent = '@' + result.user.username;
      App.showView('dashboard');
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  },

  async logout() {
    try { await API.post('/api/auth/logout'); } catch {}
    App.currentUser = null;
    App.currentSessionId = null;
    App.showView('auth');
    Auth.checkStatus();
  },
};
