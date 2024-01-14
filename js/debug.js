const Debug = (() => {
  var DEBUG = false;

  var erudaScript = document.createElement("script");
  erudaScript.src = "//cdn.jsdelivr.net/npm/eruda";
  document.body.appendChild(erudaScript);

  erudaScript.onload = setupDebug;

  function setupDebug() {
    KeyBindings.setKey({ which: "d", ctrl: true }, toggleDebug);
  }

  function toggleDebug() {
    DEBUG = !DEBUG;

    if (DEBUG) {
      eruda.init();
    } else {
      eruda.destroy();
    }
  }
})();
