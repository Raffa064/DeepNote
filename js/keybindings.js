function setKey(key, command) {
  window.addEventListener("keydown", (evt) => {
    if (key.which === evt.key) {
      if (key.ctrl && !evt.ctrlKey) return;
      if (key.alt && !evt.altKey) return;
      if (key.shift && !evt.shiftKey) return;

      if (!key.manualEventLocker) {
        evt.preventDefault();
      }

      command(evt);
    }
  });
}
