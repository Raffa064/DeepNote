const KeyBindings = (() => {
  const { includeCSS } = Utils
  includeCSS("../css/keybindings.css")

  const KEY_BINDINGS = []; // Current page key bindings

  // Floating window Elements
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

  const DEFAULT_KEY_OBJECT = {
    which: "",
    ctrl: false,
    alt: false,
    shift: false,
    manualEventLocker: false,
  };

  function setKey(key = DEFAULT_KEY_OBJECT, command, label) {
    // Function used to setup a keybinding
    const keybinding = {
      key,
      command,
      label,
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
      hide: () => {
        const index = KEY_BINDINGS.indexOf(keybinding);
        KEY_BINDINGS.splice(index, 1);
      },
    };
  }

  function getKeySymbol(key = DEFAULT_KEY_OBJECT) {
    var symbol = "";

    if (key.ctrl) symbol += "Ctrl+";
    if (key.shift) symbol += "Shift+";
    if (key.alt) symbol += "Alt+";

    return symbol + key.which;
  }

  function renderKeybinding(keybinding) {
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

    return item;
  }

  function showKeyBindingList() {
    if (container.classList.contains("visible")) {
      return;
    }

    container.classList.add("visible");

    list.innerHTML = "";
    KEY_BINDINGS.forEach((keybinding) => {
      const keybindingItem = renderKeybinding(keybinding);
      list.appendChild(keybindingItem);
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
    const hideAfterAnimation = () => {
      container.classList.remove("visible", "fade-out");
      container.removeEventListener("animationend", hideAfterAnimation);
    };

    container.classList.add("fade-out");
    container.addEventListener("animationend", hideAfterAnimation);
  }

  return {
    setKey,
    showKeyBindingList,
  };
})();
