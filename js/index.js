const { getWorkspaceNames, createWorkspace, loadWorkspace } = DeepNote;
const { HOLD_TO_EDIT_DELAY } = Settings;

const searchInput = document.querySelector("#workspace-search");
const workspaceList = document.querySelector("#workspace-list");
const workspaceCreateButton = document.querySelector("#workspace-create");

searchInput.oninput = handleSearch;
workspaceCreateButton.onclick = handleWorkspaceCreation

setupKeyBindings();
renderWorkspaces();

function handleSearch() {
  const result = queryWorkspaces((_, elt, matches) => {
    elt.classList.remove("highlight");

    if (matches) {
      elt.style.display = "flex";
    } else {
      elt.style.display = "none";
    }
  });

  if (result.matched.length > 0) {
    result.matched[0].elt.classList.add("highlight");
  }
}

function handleWorkspaceCreation() {
  Modal
    .open()
    .setTitle("New Workspace")
    .setInput("", "Workspace name")
    .setPositive("Create Workspace", () => {
      const name = Modal.getInput();
      const workspace = createWorkspace(name);
      workspace.root.setTitle(name);
      workspace.save();
      openWorkspace(name);
    })
    .setInputValidator()
    .createRule("checkWorkspaceName", ([], value) => {
      const workspaceNames = getWorkspaceNames();
      return !workspaceNames.includes(value);
    })
    .checkWorkspaceName();
}

function renderWorkspaces() {
  workspaceList.innerHTML = "";
  for (const workspaceName of getWorkspaceNames()) {
    const li = renderWorkspace(workspaceName);
    workspaceList.appendChild(li);
  }
}

function renderWorkspace(name) {
  const workspaceItem = document.createElement("li");
  workspaceItem.className = "workspace";

  const workspaceName = document.createElement("span");
  workspaceName.style.setProperty("--length", name.length);
  workspaceName.className = "workspace-name";
  workspaceName.textContent = name;

  workspaceItem.appendChild(workspaceName);

  var editWorkspaceTimeout;
  workspaceItem.ontouchstart = () => {
    editWorkspaceTimeout = setTimeout(() => {
      Modal
        .open()
        .setTitle("Edit Workspace")
        .setMessage("You can change workspace name bellow:")
        .setInput(name, "Workspace name")
        .setPositive("Save Changes", () => {
          const workspace = loadWorkspace(name);

          name = Modal.getInput();
          workspace.name = name;
          workspaceName.textContent = name;
          workspaceName.style.setProperty("--length", name.length);
          workspace.save();

          Modal.close();
        })
        .setNegative("Delete permanently", () => {
          Modal
            .close()
            .then(() => {
              Modal
                .open()
                .setTitle("Delete workspace")
                .setMessage("Are you sure to delete the workspace '" + name + "'?")
                .setPositive("Cancel", () => Modal.close())
                .setNegative("Yes, delete it", () => {
                  loadWorkspace(name).delete();
                  workspaceItem.remove();
                  Modal.close();
                });
            });
        })
        .setInputValidator()
        .createRule("checkWorkspaceName", ([], value) => {
          if (value === name) {
            return true // No changes
          }

          const workspaceNames = getWorkspaceNames();
          return !workspaceNames.includes(value);
        })
        .checkWorkspaceName();
    }, HOLD_TO_EDIT_DELAY);
  };

  workspaceItem.ontouchend = () => {
    clearTimeout(editWorkspaceTimeout);
  };

  workspaceItem.onclick = () => {
    openWorkspace(name);
  };

  return workspaceItem;
}

function openWorkspace(name) {
  location.replace("workspace.html?WORKSPACE_NAME=" + encodeURI(name));
}

function queryWorkspaces(matcherCallback) {
  const searchQuery = searchInput.value;

  const results = {
    matched: [],
    unmatched: [],
  };

  for (let i = 0; i < workspaceList.children.length; i++) {
    const workspaceItem = workspaceList.children.item(i);
    const name = workspaceItem.querySelector(".workspace-name").textContent;

    const workspace = {
      name,
      elt: workspaceItem,
    };

    const matches = name
      .toLowerCase()
      .trim()
      .includes(searchQuery.toLowerCase().trim());

    if (matcherCallback) {
      matcherCallback(name, workspaceItem, matches);
    }

    if (matches) {
      results.matched.push(workspace);
      continue;
    }

    results.unmatched.push(workspace);
  }

  return results;
}

function setupKeyBindings() {
  const { setKey } = KeyBindings;

  setKey({ which: "Tab" }, () => {
    searchInput.focus();
  }, "Focus on input");

  setKey({ which: "Enter" }, () => {
    const { matched } = queryWorkspaces();

    if (matched.length > 0) {
      openWorkspace(matched[0].name);
    }
  }, "Enter workspace");

  setKey({ which: "c", ctrl: true }, () => {
    Modal.close();
  }, "Close modal");

  setKey({ which: "n", ctrl: true }, () => {
    workspaceCreateButton.click();
    Modal.setInput(searchInput.value, "Workspace name");
  }, "New workspace");
}

function onMenuOptionClick(id) {
  switch (id) {
    case "open-info":
      location.replace("info.html");
      break;
    case "show-keybindings":
      KeyBindings.showKeyBindingList();
      break;
  }
}
