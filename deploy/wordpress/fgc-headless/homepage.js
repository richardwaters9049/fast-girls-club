(() => {
  const button = document.getElementById('fgc-save-placement');
  if (!button) return;
  const select = document.getElementById('fgc-placement');
  const status = document.getElementById('fgc-placement-status');
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Saving…';
    const placement = select.value;
    const save = async (confirmation = '') => {
      const response = await fetch(window.ajaxurl, {
        method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams({ action: 'fgc_homepage_save', post_id: button.dataset.post,
          nonce: button.dataset.nonce, placement, confirmation }),
      });
      const result = await response.json();
      if (result.data?.replace) {
        if (window.confirm(result.data.message)) return save(result.data.token);
        return { success: false, data: { message: 'Cancelled. Homepage placement was not changed.' } };
      }
      return result;
    };
    try { const result = await save(); status.textContent = result.data?.message || 'Could not save. Please reload and try again.'; }
    catch { status.textContent = 'Could not save. Please reload and try again.'; }
    finally { button.disabled = false; }
  });
})();
