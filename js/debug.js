const Debug = (() => {
  var DEBUG = false;

  var erudaScript = document.createElement("script");
  erudaScript.src = "https://cdn.jsdelivr.net/npm/eruda";
  document.body.appendChild(erudaScript);

  erudaScript.onload = setupErudaConsole;

  function setupErudaConsole() {
    KeyBindings.setKey({ which: "d", ctrl: true }, toggleErudaConsole).hide();
    function toggleErudaConsole() {
      DEBUG = !DEBUG;

      if (DEBUG) {
        eruda.init();
      } else {
        eruda.destroy();
      }
    }
  }

  function reload() {
    location.reload();
  }

  function localhost(port = 8000) {
    location.href = "http://localhost:" + port;
  }

  function origin(android = true) {
    var url = null;

    if (android) {
      url = "file:///data/user/0/com.raffa064.deepnote/files/latest/index.html";
    } else {
      url = "https://raffa064.github.io/DeepNote/index.html";
    }

    location.href = url;
  }

  function log() {
    var logLines = [
      ["DeepNote V", DeepNote.DN_VERSION],
      ["Workspace Count: ", DeepNote.getWorkspaceNames().length],
      ["Host: ", location.host],
      ["JSON length: ", localStorage.dn_data.length, "ch"],
    ];

    return logLines
      .reduce((prev, curr) => {
        const line = curr.reduce((prev, curr) => {
          return prev + curr;
        }, "");

        return prev + line + "\n";
      }, "")
      .trim();
  }

  function backup(name) {
    if (!name) throw new Error("Backup name can't be empty");

    const bkp = {
      store: (force = false) => {
        if (localStorage[name] === undefined || force) {
          localStorage[name] = localStorage.dn_data;
        } else {
          throw new Error("To override existing backup, enable 'force' flag");
        }
      },
      load: (safe) => {
        if (!localStorage[name]) {
          throw new Error("Unexisting backup named '" + name + "'");
        }

        if (safe) {
          backup(safe).store();
        }

        localStorage.dn_data = localStorage[name];
        reload();
      },
      delete: () => {
        delete localStorage[name];
      },
      rename: (newName) => {
        if (localStorage[newName]) {
          throw new Error("Backup '" + newName + "' already exists");
        }

        localStorage[newName] = localStorage[name];
        delete localStorage[name];

        name = newName;
      },
    };

    return bkp;
  }

  function wipe(safe) {
    if (safe) {
      backup(safe).store();
    }

    delete localStorage.dn_data;
    reload();
  }

  return {
    reload,
    localhost,
    origin,
    log,
    backup,
    wipe,
  };
})();
