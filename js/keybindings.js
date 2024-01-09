const KeyBindings = (() => {
  const KEY_BINDINGS = [];

  const container = document.createElement("div");
  const title = document.createElement("h1");
  const list = document.createElement("ul");

  container.id = "keybindings-container";
  title.id = "keybindings-title";
  title.innerText = "Keybindings";
  list.id = "keybindings-list";

  container.appendChild(title);
  container.appendChild(list);

  document.body.appendChild(container);

  function setKey(key, command) {
    const keybinding = {
      key,
      command,
      label: "",
    };

    KEY_BINDINGS.push(keybinding);

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

    return {
      label: (label) => (keybinding.label = label),
    };
  }

  function getKeySymbol(key) {
    var symbol = "";

    if (key.ctrl) symbol += "Ctrl+";
    if (key.shift) symbol += "Shift+";
    if (key.alt) symbol += "Alt+";

    return symbol + key.which;
  }

  function showKeyBindingList() {
    container.classList.add("visible");

    list.innerHTML = "";
    KEY_BINDINGS.forEach((keybinding) => {
      const item = document.createElement("li");
      const keys = document.createElement("span");
      const label = document.createElement("span");

      item.classList.add("keybinding");
      keys.classList.add("keybinding-keys");
      keys.innerText = getKeySymbol(keybinding.key);
      label.classList.add("keybinding-label");
      label.innerText = keybinding.label;

      item.appendChild(keys);
      item.appendChild(label);
      list.appendChild(item);
    });

    const closeHandler = (evt) => {
      evt.preventDefault();
      hideKeybindingList();

      removeEventListener("touchstart", closeHandler);
      removeEventListener("mousedown", closeHandler);
    };

    addEventListener("touchstart", closeHandler);
    addEventListener("mousedown", closeHandler);
  }

  function hideKeybindingList() {
    container.classList.remove("visible");
  }

  return {
    setKey,
    showKeyBindingList,
  };
})();
