DeepNote = (() => {
  const DN_VERSION = 2;

  // Compatibility patch: Update storage structure
  if (localStorage.dnCoreVersion) {
    delete localStorage.dnCoreVersion;
    localStorage.dn_data = localStorage.deep_note;
    delete localStorage.deep_note;
  }

  const data = loadData();

  // Update workspaces from old versions
  data.forEach((workspace) => {
    console.log("CompPatch: " + workspace.name);
    if (workspace.dnVersion === undefined) {
      // Compatibility patch: new content structure
      const root = JSON.parse(workspace.content);
      const content = {
        root,
        clipboard: [],
      };

      workspace.dnVersion = DN_VERSION;
      workspace.content = JSON.stringify(content);
    }
  });

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
      if (key === "root" || key === "clipboard") {
        return undefined;
      }

      return value;
    });

    localStorage.dn_data = dataJson;
  }

  function createCard(checked, title, description, children) {
    var card;

    if (typeof checked === "object") {
      card = checked;

      if (card == null) {
        return createCard(
          false,
          "⚠️ Corrupted card",
          "Sorry, but this card has been corrupted and can't be recovered.",
          [],
        );
      }
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
      const isAllChildrenChecked = () => {
        return card.getChildrenCount() === card.getCheckedChildrenCount();
      };

      return card.hasChildren() ? isAllChildrenChecked() : card.checked;
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
      const description = card.description || ""

      if (description.startsWith('<span>')) {
        description = "<span>" + description + "</span>"
      }
      return description;
    };

    card.hasChildren = () => {
      return card.children.length > 0;
    };

    card.getChildren = () => {
      return card.children;
    };

    card.addChild = (childCard, index) => {
      childCard.parent = card;

      if (index === undefined) {
        card.children.push(childCard);
      } else {
        card.children.splice(index, 0, childCard);
      }
    };

    card.removeChild = (childCard) => {
      childCard.parent = null;

      const index = card.children.indexOf(childCard);
      card.children.splice(index, 1);

      return childCard;
    };

    card.getChildrenCount = () => {
      return card.children.length;
    };

    card.getCheckedChildrenCount = () => {
      return card.children.reduce((prev, curr) => {
        if (curr.isChecked()) prev++;
        return prev;
      }, 0);
    };

    card.json = () => {
      return JSON.stringify(card, (key, value) => {
        return key === "parent" ? undefined : value; // Prevent circular structure
      });
    };

    card.children = card.children.map((childCard) => {
      childCard = createCard(childCard); // inject functions
      childCard.parent = card;

      return childCard;
    });

    return card;
  }

  function createWorkspace(name) {
    var workspace;

    if (typeof name === "string") {
      const root = createCard(false, "", "", []);
      const clipboard = [];

      workspace = {
        dnVersion: DN_VERSION,
        name,
        root,
        clipboard,
      };
    } else {
      workspace = name;
    }

    workspace.save = () => {
      const content = {
        root: workspace.root,
        clipboard: workspace.clipboard || [],
      };

      workspace.content = JSON.stringify(content, (key, value) => {
        if (key === "parent") {
          return undefined;
        }

        return value;
      });

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
      const contentJson = workspace.content;
      const content = JSON.parse(contentJson);
      const root = createCard(content.root);
      const clipboard = content.clipboard.map((card) => {
        return createCard(card);
      });

      workspace.root = root;
      workspace.clipboard = clipboard;
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
    DN_VERSION,
    createCard,
    createWorkspace,
    loadWorkspace,
    getWorkspaceNames,
  };
})();
