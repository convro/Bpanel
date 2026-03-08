// Bpanel API client
const API = {
  async request(method, url, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (data) opts.body = JSON.stringify(data);

    const res = await fetch(url, opts);
    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401 && typeof App !== 'undefined') App.showView('auth');
      throw new Error(json.error || 'Request failed');
    }
    return json;
  },

  get(url)           { return this.request('GET',    url); },
  post(url, data)    { return this.request('POST',   url, data); },
  put(url, data)     { return this.request('PUT',    url, data); },
  del(url)           { return this.request('DELETE', url); },

  async upload(url, formData) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json;
  },
};
