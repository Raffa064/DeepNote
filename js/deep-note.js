DeepNote = (() => {
  const data = loadData();

  function loadData() {
    const dataJson = localStorage.dn_data; // Workspce list

    if (dataJson !== undefined) {
      const dataObj = JSON.parse(dataJson);

      if (dataObj.length !== undefined) {
        return dataObj;
      }

      throw new Error("Invalid dn_data structure.");
    }

    return [];
  }

  function save() {
    const dataJson = JSON.stringify(data, (key, value) => {
      return key === "root" ? undefined : value; // Prevent circular structure
    });

    localStorage.dn_data = dataJson;
  }

  function createCard(checked, title, description, children) {
    var card;

    if (typeof checked === "object") {
      card = checked;
    } else {
      card = {
        checked,
        title,
        description,
        children,
        parent: null,
      };
    }

    card.setChecked = (checked) => {
      if (!card.hasChildren()) {
        return (card.checked = checked);
      }

      return card.isChecked();
    };

    card.isChecked = () => {
      const verifyChildrenChecked = () => {
        const uncheckedChild = card.children.find((childCard) => {
          return childCard.checked === false;
        });

        return uncheckedChild !== undefined;
      };

      return !card.hasChildren() ? card.checked : verifyChildrenChecked();
    };

    card.setTitle = (title) => {
      return (card.title = title);
    };

    card.getTitle = () => {
      return card.title;
    };

    card.setDescription = (description) => {
      return (card.description = description);
    };

    card.getDescription = () => {
      return card.description;
    };

    card.hasChildren = () => {
      return card.children.length > 0;
    };

    card.getChildren = () => {
      return card.children;
    };

    card.addChild = (childCard) => {
      childCard.parent = card;
      card.children.push(childCard);
    };

    card.removeChild = (childCard) => {
      childCard.parent = null;

      const index = card.children.indexOf(childCard);
      card.children.splice(index, 1);

      return childCard;
    };

    card.json = () => {
      return JSON.stringify(card, (key, value) => {
        return key === "parent" ? undefined : value; // Prevent circular structure
      });
    };

    card.children = card.children.map((childCard) => {
      createCard(childCard); // inject functions
      childCard.parent = card;

      return childCard;
    });

    return card;
  }

  function createWorkspace(name) {
    var workspace;

    if (typeof name === "string") {
      const root = createCard(false, "", "", []);
      workspace = {
        name,
        content: root.json(),
      };
    } else {
      workspace = name;
    }

    workspace.save = () => {
      workspace.content = workspace.root.json();

      const index = data.indexOf(workspace);

      if (index < 0) {
        data.push(workspace); // add to workspace list
      }

      save(); // save state
    };

    workspace.delete = () => {
      const index = data.indexOf(workspace);

      if (index >= 0) {
        data.splice(index, 1); // delete from workspace list
        save(); // save state
      }
    };

    workspace.json = () => {
      return JSON.stringify(workspace);
    };

    return workspace;
  }

  function loadWorkspace(name) {
    const workspace = data.find((w) => w.name === name);

    if (workspace !== undefined) {
      const rootJson = workspace.content;
      const rootParsed = JSON.parse(rootJson);
      const root = createCard(rootParsed);

      workspace.root = root;
      return createWorkspace(workspace); // inject functions
    }

    throw new Error("Trying to load unnexisting workspace '" + name + "'");
  }

  function getWorkspaceNames() {
    const nameList = data.map((workspace) => {
      return workspace.name;
    });

    return nameList;
  }

  return {
    createCard,
    createWorkspace,
    loadWorkspace,
    getWorkspaceNames,
  };
})();

/*DeepNote = (() => {
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
    if (title === undefined) {
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

      const exists = deep_note.find((w) => w.name === workspace.name);
      if (!exists) {
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
})();*/
