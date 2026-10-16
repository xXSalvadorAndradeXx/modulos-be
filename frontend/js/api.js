/* Cliente REST reutilizable para las próximas fases. No simula operaciones exitosas. */
window.WoodStoneAPI = Object.freeze({
  async request(path, options = {}) {
    const response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Accept': 'application/json', ...(options.body ? {'Content-Type':'application/json'} : {}), ...options.headers }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error || `Error HTTP ${response.status}`);
    return body;
  },
  health() { return this.request('/health'); }
});
