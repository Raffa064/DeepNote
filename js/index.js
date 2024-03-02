const { getWorkspaceNames, createWorkspace, loadWorkspace } = DeepNote;

const HOLD_TO_EDIT_DELAY = 300;

const searchInput = document.querySelector("#workspace-search");
const workspaceList = document.querySelector("#workspace-list");
const workspaceCreateButton = document.querySelector("#workspace-create");

const modal = createModal();

searchInput.oninput = () => {
  const result = searchWorkspace((name, elt, match) => {
    elt.classList.remove("highlight");

    if (match) {
      elt.style.display = "flex";
    } else {
      elt.style.display = "none";
    }
  });

  if (result.matched.length > 0) {
    result.matched[0].elt.classList.add("highlight");
  }
};

setupKeyBindings();
refreshList();

workspaceCreateButton.onclick = function () {
  modal
    .open()
    .setTitle("New Workspace")
    .setInput("", "Workspace name")
    .setPositive("Create Workspace", () => {
      const name = modal.getInput();
      createWorkspace(name).save();
      openWorkspace(name);
    })
    .setInputValidator()
    .createRule("checkWorkspaceName", ([], value) => {
      const workspaceNames = getWorkspaceNames();

      return !workspaceNames.includes(value);
    })
    .checkWorkspaceName();
};

function createModal() {
  const modalObj = {};

  const modalContainer = document.querySelector("#modal-container");
  const modalTitle = document.querySelector("#modal-title");
  const modalMessage = document.querySelector("#modal-message");
  const modalInput = document.querySelector("#modal-input");
  const modalPositiveButton = document.querySelector("#modal-positive-button");
  const modalNegativeButton = document.querySelector("#modal-negative-button");

  modalContainer.onanimationend = () => {
    modalContainer.classList.remove("anim-fade-in", "anim-fade-out");
  };

  modalContainer.ontouchstart = (e) => {
    if (e.target === modalContainer) {
      e.preventDefault();
      close();
    }
  };

  const formJS = FormJS();
  var validator = null;

  modalInput.oninput = () => {
    if (validator) {
      const isValid = validator(modalInput.value);

      if (isValid) {
        modalInput.classList.remove("invalid");
      } else {
        modalInput.classList.add("invalid");
      }

      modalNegativeButton.disabled = !isValid;
      modalPositiveButton.disabled = !isValid;
    }
  };

  function open() {
    document.body.style.overflow = "hidden";
    modalContainer.style.display = "flex";

    modalContainer.querySelectorAll("#modal *").forEach((elt) => {
      elt.style.display = "none"; // Hide all modal elements
    });

    modalContainer.classList.add("anim-fade-in");

    validator = null;
    modalInput.classList.remove("invalid");
    modalNegativeButton.disabled = false;
    modalPositiveButton.disabled = false;

    return modalObj;
  }

  function close() {
    modalContainer.classList.add("anim-fade-out");

    var closeCallback;
    function then(_callback) {
      closeCallback = _callback;
    }

    const onAnimationEnd = () => {
      document.body.style.overflow = "scroll";
      modalContainer.style.display = "none";
      modalContainer.removeEventListener("animationend", onAnimationEnd);

      if (closeCallback) {
        closeCallback();
      }
    };

    modalContainer.addEventListener("animationend", onAnimationEnd);

    return {
      then,
    };
  }

  function setTitle(title) {
    modalTitle.style.display = "block";
    modalTitle.textContent = title;

    return modalObj;
  }

  function setMessage(message) {
    modalMessage.style.display = "block";
    modalMessage.textContent = message;

    return modalObj;
  }

  function setInput(value, placeholder) {
    modalInput.style.display = "block";
    modalInput.value = value;
    modalInput.placeholder = placeholder;
    modalInput.focus();

    return modalObj;
  }

  function setInputValidator() {
    return (validator = formJS());
  }

  function getInput() {
    return modalInput.value;
  }

  function setButton(btn, text, onclick) {
    const buttons = {
      positive: modalPositiveButton,
      negative: modalNegativeButton,
    };

    const _button = buttons[btn];
    _button.style.display = "block";
    _button.textContent = text;
    _button.onclick = onclick;

    return modalObj;
  }

  Object.assign(modalObj, {
    open,
    close,
    setTitle,
    setMessage,
    setInput,
    getInput,
    setInputValidator,
    setPositive: (text, onclick) => setButton("positive", text, onclick),
    setNegative: (text, onclick) => setButton("negative", text, onclick),
  });

  return modalObj;
}

function refreshList() {
  workspaceList.innerHTML = "";
  for (const workspaceName of getWorkspaceNames()) {
    const li = renderWorkspace(workspaceName);
    workspaceList.appendChild(li);
  }
}

function openWorkspace(name) {
  location.replace("workspace.html?WORKSPACE_NAME=" + encodeURI(name));
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
      modal
        .open()
        .setTitle("Edit Workspace")
        .setMessage("You can change workspace name bellow:")
        .setInput(name, "Workspace name")
        .setPositive("Save Changes", () => {
          const workspace = loadWorkspace(name);

          name = modal.getInput();
          workspace.name = name;
          workspaceName.textContent = name;
          workspaceName.style.setProperty("--length", name.length);
          workspace.save();

          modal.close();
        })
        .setNegative("Delete permanently", () => {
          modal.close().then(() => {
            modal
              .open()
              .setTitle("Delete workspace")
              .setMessage(
                "Are you sure to delete the workspace '" + name + "'?",
              )
              .setPositive("Cancel", () => modal.close())
              .setNegative("Yes, delete it", () => {
                loadWorkspace(name).delete();
                workspaceItem.remove();

                modal.close();
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

function searchWorkspace(matcherCallback = (name, elt, match) => {}) {
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

    const match = name
      .toLowerCase()
      .trim()
      .includes(searchQuery.toLowerCase().trim());

    matcherCallback(name, workspaceItem, match);

    if (match) {
      results.matched.push(workspace);
      continue;
    }

    results.unmatched.push(workspace);
  }

  return results;
}

function setupKeyBindings() {
  const { setKey } = KeyBindings;

  setKey(
    { which: "Tab" },
    () => {
      searchInput.focus();
    },
    "Focus on input",
  );

  setKey(
    { which: "Enter" },
    () => {
      const { matched } = searchWorkspace();

      if (matched.length > 0) {
        openWorkspace(matched[0].name);
      }
    },
    "Enter workspace",
  );

  setKey(
    { which: "c", ctrl: true },
    () => {
      modal.close();
    },
    "Close modal",
  );

  setKey(
    { which: "n", ctrl: true },
    () => {
      workspaceCreateButton.click();
      modal.setInput(searchInput.value, "Workspace name");
    },
    "New workspace",
  );
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
