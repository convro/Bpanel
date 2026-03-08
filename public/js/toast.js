// Toast notification system
const Toast = {
  show(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    toast.innerHTML = `
      <i data-lucide="${icon}" class="icon-sm" style="color:var(--${type === 'info' ? 'accent' : type === 'success' ? 'success' : 'danger'});flex-shrink:0"></i>
      <span class="toast-text">${esc(message)}</span>
      <button class="toast-close"><i data-lucide="x" class="icon-xs"></i></button>
    `;

    const close = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = '0.2s';
      setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.toast-close').addEventListener('click', close);
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ el: toast });

    if (duration > 0) setTimeout(close, duration);
    return toast;
  },

  success(msg, d) { return this.show(msg, 'success', d); },
  error(msg, d)   { return this.show(msg, 'error', d); },
  info(msg, d)    { return this.show(msg, 'info', d); },
};

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
