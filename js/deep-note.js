function DeepNote() {
  const WORKSPACES = loadWorkspaces();

  function loadWorkspaces() {
    if (localStorage.dn_workspaces !== undefined) {
      const json = JSON.parse(localStorage.dn_workspaces);

      const workspaces = [];
      for (const workspace of json) {
        const rootCard = createCard(workspace.root);
        workspaces.push({
          name: workspace.name,
          root: rootCard,
        });
      }

      return workspaces;
    }

    return [];
  }

  function saveWorkspaces() {
    const json = JSON.stringify(WORKSPACES, (k, v) => {
      if (k == "parent") {
        return undefined;
      }

      return v;
    });

    localStorage.dn_workspaces = json;
  }

  function createWorkspace(name) {
    const workspace = {
      name,
      root: createCard(false, "", "", []),
    };

    WORKSPACES.push(workspace);

    return workspace;
  }

  function getWorkspace(name) {
    return WORKSPACES.find((w) => w.name === name);
  }

  function listWorkspaces() {
    return WORKSPACES;
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
    loadWorkspaces,
    saveWorkspaces,
    createWorkspace,
    getWorkspace,
    listWorkspaces,
    createCard,
  };
}
