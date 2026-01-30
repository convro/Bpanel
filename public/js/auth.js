const Auth = {
  isSetup: false,

  init() {
    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('auth-toggle');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });

    toggle.addEventListener('click', () => {
      this.isSetup = !this.isSetup;
      this.updateUI();
    });
  },

  updateUI() {
    const title = document.getElementById('auth-title');
    const submit = document.getElementById('auth-submit');
    const toggle = document.getElementById('auth-toggle');
    const error = document.getElementById('auth-error');

    error.textContent = '';

    if (this.isSetup) {
      title.textContent = 'Create Account';
      submit.textContent = 'Register';
      toggle.textContent = 'Already have an account? Login';
    } else {
      title.textContent = 'Login';
      submit.textContent = 'Login';
      toggle.textContent = '';
    }
  },

  async checkStatus() {
    try {
      const data = await API.get('/api/auth/status');
      if (data.needsSetup) {
        this.isSetup = true;
        this.updateUI();
        return { needsSetup: true, user: null };
      }
      return { needsSetup: false, user: data.user };
    } catch {
      return { needsSetup: true, user: null };
    }
  },

  async submit() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const error = document.getElementById('auth-error');

    if (!username || !password) {
      error.textContent = 'Fill in all fields';
      return;
    }

    try {
      const endpoint = this.isSetup ? '/api/auth/register' : '/api/auth/login';
      const data = await API.post(endpoint, { username, password });
      App.currentUser = data.user;
      App.showView('dashboard');
    } catch (err) {
      error.textContent = err.message;
    }
  },

  async logout() {
    try { await API.post('/api/auth/logout'); } catch {}
    App.currentUser = null;
    App.showView('auth');
  },
};
