// Imports
const { loadWorkspace, createCard } = DeepNote;

// Constants
const { WORKSPACE_NAME } = getParams();
const AUTO_SAVE_DELAY = 500;
const DELETION_HOLD_DELAY = 2000;

// UI Elements
const workspaceName = getElementById("workspace-name");
const cardContainer = getElementById("card");
const cardCheckbox = getElementById("card-checkbox");
const cardTitleInput = getElementById("card-title");
const cardDescription = getElementById("card-description");
const cardDescriptionExpand = getElementById("card-description-expand");
const cardDescriptionColapse = getElementById("card-description-colapse");
const cardDescriptionContainer = getElementById("card-description-container");
var cardDescriptionEditor = null; // Rich text editor
const cardDescriptionToolbar = getElementById("card-description-toolbar")
const clipboardList = getElementById("clipboard-list");
const cardChildrenList = getElementById("card-list");
const cardButtonUp = getElementById("card-button-up");
const cardButtonDown = getElementById("card-button-down");

// Application state (dinamic/data)
const workspace = loadWorkspace(WORKSPACE_NAME);
var current = workspace.root;
const selectionMode = createSelectionMode();

mainSetup();

function setupRichTextEditor() {
  const quill = new Quill(cardDescriptionContainer, {
    placeholder: 'Description',
    theme: "snow",
    syntax: true,
    modules: {
      toolbar: {
        container: "#card-description-toolbar"
      }
    }
  });

  const { keyboard } = quill;

  const listHandler = (range, format, value) => {
    const lineFormats = quill.getFormat(range)
    
    if (lineFormats["list"]) {
      quill.format("list", false)
    } else {
      quill.formatLine(range.index, 0, format, value)
    }

    return true
  }

  const formatKeys = [
    //Key   Format        Option          Custom behavior
    ["b",   "bold",       undefined,      undefined],
    ["i",   "italic",     undefined,      undefined],
    ["u",   "underline",  undefined,      undefined],
    ["s",   "strike",     true,           undefined],
    ["9",   "script",     "sub",          undefined],
    ["0",   "script",     "super",        undefined],
    ["l",   "list",       "bullet",       listHandler],
  ];

  formatKeys.forEach(([key, format, value, _handler]) => {
    keyboard.addBinding({
      key,
      ctrlKey: true,
      handler: (range) => {
        if (_handler) {
          _handler(range, format, value)
          return true
        }

        const lineFormats = quill.getFormat(range)
    
        console.log(lineFormats[format])
        if (lineFormats[format] && lineFormats[format] === value) {
          quill.format(format, false)
        } else {
          quill.formatText(range.index, range.length, format, value)
        }

        return true
      }
    })
  })

  cardDescriptionEditor = quill;
}

function mainSetup() {
  workspaceName.textContent = WORKSPACE_NAME;

  cardDescriptionExpand.onclick = toggleExpandedDescription;
  cardDescriptionColapse.onclick = toggleExpandedDescription;
  cardButtonDown.onclick = addNewCard;
  cardButtonUp.onclick = goBack;

  setupRichTextEditor();

  const CARD_LISTS = {
    "clipboard-list": {
      move: function (from, fIndex, tIndex) {
        const clipboard = workspace.clipboard;
        var card = null;

        if (from === this) {
          // Clipboard to Clipboard
          card = clipboard.splice(fIndex, 1)[0];
        } else {
          // Children to Clipboard
          const children = current.getChildren();
          const len = children.length - 1;
          const reverseFIndex = len - fIndex;

          card = children.splice(reverseFIndex, 1)[0];
        }

        clipboard.splice(tIndex, 0, card);
      },
    },
    "card-list": {
      move: function (from, fIndex, tIndex) {
        const children = current.getChildren();
        var card = null;
        const len = children.length - 1;
        const reverseTIndex = len - tIndex;

        if (from === this) {
          // Children to Children
          const reverseFIndex = len - fIndex;
          card = children.splice(reverseFIndex, 1)[0];
        } else {
          // Clipboard to Children
          const clipboard = workspace.clipboard;
          card = clipboard.splice(fIndex, 1)[0];
        }

        current.addChild(card, reverseTIndex);
      },
    },
  };

  const updateClipboardCounter = () => {
    clipboardList.dataset.cardAmount = workspace.clipboard.length;
  }

  const closeClipboardAnimation = () => {
    const classes = ["dragging", "not-empty", "closing-animation"];
    const containsAlmostOneClass = classes.find((clazz) => {
      return clipboardList.classList.contains(clazz);
    });

    if (containsAlmostOneClass) {
      return;
    }

    const afterAnimation = () => {
      clipboardList.classList.remove("closing-animation", "minimized");
      clipboardList.removeEventListener("animationend", afterAnimation);
    };

    clipboardList.classList.add("closing-animation");
    clipboardList.addEventListener("animationend", afterAnimation);
  }

  const sortableOptions = {
    group: "card-list",
    handle: ".handler",
    animation: 150,
    ghostClass: "ghost",
    onStart: () => {
      clipboardList.classList.add("dragging");
    },
    onEnd: (evt) => {
      clipboardList.classList.remove("dragging");
      closeClipboardAnimation();

      const fromList = CARD_LISTS[evt.from.id];
      const toList = CARD_LISTS[evt.to.id];

      toList.move(fromList, evt.oldIndex, evt.newIndex);
      updateClipboardCounter();
    },
  };

  Sortable.create(clipboardList, {
    ...sortableOptions,
  });

  Sortable.create(cardChildrenList, {
    ...sortableOptions,
  });

  updateClipboardCounter();

  clipboardList.onclick = () => {
    clipboardList.classList.toggle("minimized");
  };

  createTreeObserver(clipboardList, () => {
    if (clipboardList.children.length === 0) {
      clipboardList.classList.remove("not-empty");
      closeClipboardAnimation();
    } else {
      clipboardList.classList.add("not-empty");
    }
  });

  const noChildren = document.createElement("span");
  noChildren.id = "card-no-children";
  noChildren.textContent =
    "Create a new child card with the arrow down button.";
  cardContainer.insertBefore(noChildren, cardChildrenList);

  createTreeObserver(cardChildrenList, () => {
    if (cardChildrenList.children.length === 0) {
      cardContainer.insertBefore(noChildren, cardChildrenList);
    } else {
      noChildren.remove();
    }
  });

  setupKeyBindings();
  renderCard();
  setInterval(workspace.save, AUTO_SAVE_DELAY);
}

function createTreeObserver(target, callback) {
  const mObjserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        callback();
      }
    });
  });

  mObjserver.observe(target, {
    childList: true,
    subtree: false,
  });

  return mObjserver;
}

function toggleExpandedDescription() {
  if (cardDescription.classList.contains("expanded")) {
    // Close expanded description
    document.body.style.overflow = "scroll";
    cardDescription.classList.remove("expanded");
    cardDescriptionEditor.blur();
    return false;
  }

  // Open expanded description
  document.body.style.overflow = "hidden";
  cardDescription.classList.add("expanded");
  cardDescriptionEditor.focus();
  return true;
}

function isSelectionModeEnabled() {
  return cardChildrenList.classList.contains("selection");
}

function createSelectionMode() {
  const selectionMode = {};

  var selectedIndex = 0;
  var selectedElt = null;

  function moveSelection() {
    if (selectedElt) {
      selectedElt.classList.remove("selected");
    }

    selectedElt = cardChildrenList.children.item(selectedIndex);
    selectedElt.classList.add("selected");
    selectedElt.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  selectionMode.unselect = () => {
    selectedElt.classList.remove("selected");
  };

  selectionMode.backSelection = () => {
    selectedIndex--;

    if (selectedIndex < 0) {
      selectedIndex = current.children.length - 1;
    }

    moveSelection();
  };

  selectionMode.nextSelection = () => {
    selectedIndex = ++selectedIndex % current.children.length;
    moveSelection();
  };

  selectionMode.openSelection = () => {
    const length = current.children.length - 1;

    if (length < 0) {
      toggleSelectionMode(); // can't open selection mode on a card with no children
      return;
    }

    current = current.children[length - selectedIndex];
    renderCard();
  };

  selectionMode.resetSelection = () => {
    cardChildrenList.dataset.cardTitle = current.title; // selection mode title
    selectedIndex = 0;
    moveSelection();
  };

  return selectionMode;
}

function toggleSelectionMode() {
  const enabled = cardChildrenList.classList.toggle("selection");

  if (enabled) {
    if (current.children.length == 0) {
      cardChildrenList.classList.remove("selection");
      return;
    }

    document.body.style.overflow = "hidden";
    selectionMode.resetSelection();
  } else {
    document.body.style.overflow = "scroll";
    selectionMode.unselect();
  }
}

function renderCard() {
  // Reset page scroll
  scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });

  // Openning animation
  cardContainer.classList.add("card-opening-animation");
  cardContainer.onanimationend = () => {
    cardContainer.classList.remove("card-opening-animation");
  };

  // Display values
  cardCheckbox.checked = current.isChecked();
  cardCheckbox.disabled = current.hasChildren();
  cardTitleInput.value = current.getTitle();

  const delta = cardDescriptionEditor.clipboard.convert({
    html: current.getDescription()
  });

  cardDescriptionEditor.setContents(delta, "silent");

  // Interations
  cardCheckbox.onchange = () => {
    const checked = current.setChecked(cardCheckbox.checked);
    cardCheckbox.checked = checked;
  };

  cardTitleInput.oninput = () => {
    current.setTitle(cardTitleInput.value);
  };

  cardDescriptionEditor.on("text-change", () => {
    current.setDescription(cardDescriptionEditor.getSemanticHTML());
  });

  // Clipboard
  clipboardList.innerHTML = "";
  workspace.clipboard.forEach((card) => {
    const listItem = renderChildCard(card);
    clipboardList.appendChild(listItem);
  });

  // Child card list
  cardChildrenList.innerHTML = "";
  if (current.hasChildren()) {
    current.children.forEach((child) => {
      const listItem = renderChildCard(child);
      cardChildrenList.insertBefore(listItem, cardChildrenList.firstChild);
    });

    selectionMode.resetSelection();
  } else {
    if (isSelectionModeEnabled()) {
      toggleSelectionMode(); // disable selection mode
    }
  }
}

function renderChildCard(child) {
  // Instanciating elements
  var childItem = document.createElement("li");
  var childCheckbox = document.createElement("input");
  var childTitle = document.createElement("span");

  // Display values
  childItem.classList.add("child-card");
  childCheckbox.classList.add("handler");
  childCheckbox.type = "checkbox";
  childCheckbox.disabled = true;
  childCheckbox.checked = child.isChecked();
  childTitle.innerText = child.getTitle();

  // Completion counter
  if (child.hasChildren()) {
    const childrenCount = child.getChildrenCount();
    const checkedChildrenCount = child.getCheckedChildrenCount();

    childItem.dataset.counter = checkedChildrenCount + "/" + childrenCount;
  }

  // Interations
  childItem.onclick = () => {
    if (childItem.parentNode !== cardChildrenList) return;

    current = child;
    renderCard(current);
  };

  var warningTimeout;
  var deleteTimeout;

  childItem.ontouchstart = (evt) => {
    if (evt.target === childCheckbox) {
      return;
    }

    if (childItem.parentNode !== cardChildrenList) return;
    
    warningTimeout = setTimeout(() => {
      childItem.classList.add("deleting"); // display deletion warning
    }, 100);

    deleteTimeout = setTimeout(() => {
      childItem.classList.add("anim-scale-down"); // deleting animation

      setTimeout(() => {
        current.removeChild(child);
        cardCheckbox.disabled = current.hasChildren();
        childItem.remove();
      }, 200);
    }, DELETION_HOLD_DELAY);
  };

  const cancelDeletion = () => {
    if (childItem.parentNode !== cardChildrenList) return;

    childItem.classList.remove("deleting");
    clearTimeout(warningTimeout);
    clearTimeout(deleteTimeout);
  };

  childItem.ontouchmove = cancelDeletion;
  childItem.ontouchend = cancelDeletion;

  childItem.appendChild(childCheckbox);
  childItem.appendChild(childTitle);

  return childItem;
}

function addNewCard() {
  var newCard = createCard(false, "", "", []);
  current.addChild(newCard);
  current = newCard;

  renderCard();
  cardTitleInput.focus();
}

function goBack() {
  if (current.parent) {
    current = current.parent;
    renderCard(current);
  }
}

function goHome() {
  location.replace("index.html");
}

function setupKeyBindings() {
  const { setKey } = KeyBindings;

  setKey({ which: "h", ctrl: true, manualEventLocker: true }, () => {
    if (!cardDescriptionEditor.hasFocus()) {
      goHome()
      return true;
    }
  }, "Go Home");

  setKey(
    { which: "m", ctrl: true },
    () => {
      cardCheckbox.click();
    },
    "Check/Uncheck",
  );

  setKey(
    { which: "e", ctrl: true },
    toggleExpandedDescription,
    "Expand description",
  );

  setKey({ which: "b", ctrl: true, manualEventLocker: true }, () => {
    if (!cardDescriptionEditor.hasFocus()) {
      goBack()
      return true
    }
  }, "Go Back");

  setKey({ which: "n", ctrl: true }, addNewCard, "New Card");

  setKey({ which: "l", ctrl: true, manualEventLocker: true }, () => {
    if (!cardDescriptionEditor.hasFocus()) {
      toggleSelectionMode()
      return true
    }
  }, "Selection mode");

  setKey(
    { which: "ArrowUp", manualEventLocker: true },
    (evt) => {
      if (isSelectionModeEnabled()) {
        evt.preventDefault();
        selectionMode.backSelection();
      }
    },
    "Selection up",
  );

  setKey(
    { which: "ArrowDown", manualEventLocker: true },
    (evt) => {
      if (isSelectionModeEnabled()) {
        evt.preventDefault();
        selectionMode.nextSelection();
      }
    },
    "Selection down",
  );

  setKey(
    { which: "Enter", manualEventLocker: true },
    (evt) => {
      if (isSelectionModeEnabled()) {
        evt.preventDefault();
        selectionMode.openSelection();
      }
    },
    "Open selection",
  );
}

function onMenuOptionClick(id) {
  switch (id) {
    case "show-keybindings":
      KeyBindings.showKeyBindingList();
      break;
    case "go-home":
      goHome();
      break;
  }
}

function getParams() {
  const params = {};

  const urlParams = location.search.substring(1).split("&");

  for (const param of urlParams) {
    const [name, value] = param.split("=").map((x) => x.trim());
    params[name] = decodeURI(value);
  }

  return params;
}

function getElementById(id) {
  return document.getElementById(id);
}
