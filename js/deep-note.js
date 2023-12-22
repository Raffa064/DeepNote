const DN_CORE_VERSION = 1;

DeepNote = (() => {
  if (localStorage.dnCoreVersion === undefined) {
    localStorage.dnCoreVersion = DN_CORE_VERSION;
  }

  applyUpdatePatchs();
  const deep_note = load();

  function load() {
    const json = localStorage.deep_note;

    if (json !== undefined) {
      const _workspaces = JSON.parse(json);

      if (_workspaces.length !== undefined) {
        return _workspaces;
      }

      throw new Error("Invalid dn_workspaces structure");
    }

    return [];
  }

  function save() {
    const json = JSON.stringify(deep_note, (k, v) => {
      return k === "root" ? undefined : v;
    });

    localStorage.deep_note = json;
  }

  function createCard(checked, title, description, children) {
    if (title == undefined) {
      const card = checked; // JSON-Parsed card, without functions

      const _checked = card.checked;
      const _title = card.title;
      const _description = card.description;
      const _children = card.children.map((child) => {
        return createCard(child);
      });

      return createCard(_checked, _title, _description, _children);
    }

    var card = {
      checked: checked,
      title: title,
      description: description,
      children: children,
      parent: null,
      addChild: function (child) {
        child.parent = this;
        this.children.push(child);
      },
      removeChild: function (child) {
        const index = this.children.indexOf(child);
        this.children.splice(index, 1);
      },
      verifyChecked: function () {
        if (this.hasChildren()) {
          this.checked = this.children.every((child) => child.checked === true);
        }

        return this.checked;
      },
      hasChildren: function () {
        return this.children.length > 0;
      },
      json: function () {
        return JSON.stringify(this, (k, v) => {
          return k == "parent" ? undefined : v;
        });
      },
    };

    children.forEach((child) => {
      child.parent = card;
    });

    return card;
  }

  function createWorkspace(name) {
    root = name.root || createCard(false, name, "", []);

    var workspace = null;

    if (name.name !== undefined && name.content !== undefined) {
      workspace = name; // creating from a existing workspace
    } else {
      workspace = {
        // Create from scratch
        name,
        content: root.json(),
        root,
      };
    }

    workspace.save = () => {
      workspace.content = root.json();

      if (!deep_note.find((w) => w.name === workspace.name)) {
        deep_note.push(workspace);
      }

      save();
    };

    workspace.delete = () => {
      const index = deep_note.indexOf(workspace);

      if (index >= 0) {
        deep_note.splice(index, 1);
        save();
      }
    };

    workspace.json = () => {
      return JSON.stringify(workspace, (k, v) => {
        return k == "root" ? undefined : v;
      });
    };

    return workspace;
  }

  function loadWorkspace(name) {
    const workspace = deep_note.find((w) => w.name === name);

    if (workspace !== undefined) {
      const parsedJson = JSON.parse(workspace.content);
      const root = createCard(parsedJson);

      workspace.root = root;
      createWorkspace(workspace); // inject functiions

      return workspace;
    }

    return null;
  }

  function getWorkspaceNames() {
    const names = [];

    for (const workspace of deep_note) {
      names.push(workspace.name);
    }

    return names;
  }

  return {
    createCard,
    createWorkspace,
    loadWorkspace,
    getWorkspaceNames,
  };
})();

function applyUpdatePatchs() {
  var version = parseInt(localStorage.dnCoreVersion);

  if (version < 1 || version > DN_CORE_VERSION) {
    throw new Error("Invalid core version");
  }

  // Apply version patchs

  localStorage.dnCoreVersion = version;
}
