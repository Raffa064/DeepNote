DeepNote = (() => {
  const WORKSPACES = loadWorkspaces();

  function loadWorkspaces() {
    if (localStorage.dn_workspaces !== undefined) {
      const workspaces = JSON.parse(localStorage.dn_workspaces);

      return workspaces;
    }

    return {};
  }

  function createWorkspace(title, description = "") {
    const workspace =
      title.title !== undefined
        ? createCard(title)
        : createCard(false, title, description, []);

    workspace.save = () => {
      saveWorkspace(workspace);
    };

    return new Proxy(workspace, {
      set: (obj, prop, value) => {
        if (prop === "title") {
          renameWorkspace(obj[prop], value);
        }

        obj[prop] = value;
      },
    });
  }

  function getWorkspace(title) {
    const json = WORKSPACES[title.trim()];
    const parsed = JSON.parse(json);

    return createWorkspace(parsed);
  }

  function getWorkspaceList() {
    const list = [];

    for (const workspaceName in WORKSPACES) {
      list.push(workspaceName);
    }

    return list;
  }

  function renameWorkspace(oldTitle, newTitle) {
    const workspaceJSON = WORKSPACES[oldTitle];
    WORKSPACES[newTitle.trim()] = workspaceJSON;
    delete WORKSPACES[oldTitle];
  }

  function saveWorkspace(workspace) {
    const json = JSON.stringify(workspace, (k, v) => {
      if (k == "parent") {
        return undefined;
      }

      return v;
    });

    WORKSPACES[workspace.title] = json;
    localStorage.dn_workspaces = JSON.stringify(WORKSPACES);
  }

  function createCard(checked, title, description, children) {
    if (title == undefined) {
      const card = checked;

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
      },
      hasChildren: function () {
        return this.children.length > 0;
      },
    };

    children.forEach((child) => {
      child.parent = card;
    });

    return card;
  }

  return {
    createWorkspace,
    getWorkspace,
    getWorkspaceList,
    saveWorkspace,
    createCard,
  };
})();
