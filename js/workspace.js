const { loadWorkspace, createCard } = DeepNote;
const { WORKSPACE_NAME } = getParams();
const AUTO_SAVE_DELAY = 500;
const DELETION_HOLD_DELAY = 2000;

const workspaceName = document.getElementById("workspace-name");
const cardContainer = document.getElementById("card");
const cardCheckbox = document.getElementById("card-checkbox");
const cardTitleInput = document.getElementById("card-title");
const cardDescriptionContainer = document.getElementById(
  "card-description-container",
);
const cardDescriptionExpand = document.getElementById(
  "card-description-expand",
);
const cardDescriptionColapse = document.getElementById(
  "card-description-colapse",
);
const cardDescriptionInput = document.getElementById("card-description");
const cardChildrenList = document.getElementById("card-list");
const cardButtonUp = document.getElementById("card-button-up");
const cardButtonDown = document.getElementById("card-button-down");

var workspace = loadWorkspace(WORKSPACE_NAME);
var current = workspace.root;

workspaceName.textContent = WORKSPACE_NAME;
renderCard();

cardDescriptionExpand.onclick = toggleExpandedDescription;
cardDescriptionColapse.onclick = toggleExpandedDescription;

Sortable.create(cardChildrenList, {
  handle: ".handler",
  animation: 150,
  onEnd: function (evt) {
    const len = current.children.length - 1;
    var movedChild = current.children.splice(len - evt.oldIndex, 1)[0];
    current.children.splice(len - evt.newIndex, 0, movedChild);
  },
});

cardButtonDown.onclick = addNewCard;
cardButtonUp.onclick = goBack;

setupKeyBindings();
setInterval(workspace.save, AUTO_SAVE_DELAY);

function getParams() {
  const params = {};

  const urlParams = location.search.substring(1).split("&");

  for (const param of urlParams) {
    const [name, value] = param.split("=").map((x) => x.trim());
    params[name] = decodeURI(value);
  }

  return params;
}

function toggleExpandedDescription() {
  if (cardDescriptionContainer.classList.contains("expanded")) {
    document.body.style.overflow = "scroll";
    cardDescriptionContainer.classList.remove("expanded");
    cardDescriptionInput.blur();
  } else {
    document.body.style.overflow = "hidden";
    cardDescriptionContainer.classList.add("expanded");
    cardDescriptionInput.focus();
  }
}

function renderCard() {
  cardContainer.classList.add("anim-stretch");
  cardContainer.onanimationend = function () {
    cardContainer.classList.remove("anim-stretch");
  };

  current.verifyChecked();
  cardCheckbox.checked = current.checked;
  cardCheckbox.disabled = current.hasChildren();
  cardTitleInput.value = current.title;
  cardDescriptionInput.value = current.description;

  cardCheckbox.onchange = function () {
    current.checked = cardCheckbox.checked;
  };

  cardTitleInput.oninput = function () {
    current.title = cardTitleInput.value;
  };

  cardDescriptionInput.oninput = function () {
    current.description = cardDescriptionInput.value;
  };

  cardChildrenList.innerHTML = "";
  if (current.children.length > 0) {
    current.children.forEach(function (child) {
      var listItem = document.createElement("li");

      var totalChildren = child.children.length;
      if (totalChildren > 0) {
        var checkedChildren = child.children.reduce((prev, curr) => {
          return curr.checked ? prev + 1 : prev;
        }, 0);

        listItem.dataset.counter = checkedChildren + "/" + totalChildren;
      }

      var childCheckbox = document.createElement("input");
      childCheckbox.classList.add("handler");
      childCheckbox.type = "checkbox";
      childCheckbox.disabled = true;
      childCheckbox.checked = child.checked;
      listItem.appendChild(childCheckbox);

      var childTitle = document.createElement("span");
      childTitle.innerText = child.title;
      listItem.appendChild(childTitle);

      listItem.onclick = function () {
        current = child;
        renderCard(current);
      };

      var warningTimeout;
      var deleteTimeout;
      listItem.ontouchstart = function () {
        warningTimeout = setTimeout(() => {
          listItem.classList.add("deleting");
        }, 100);

        deleteTimeout = setTimeout(() => {
          listItem.classList.add("anim-scale-down");
          setTimeout(() => {
            current.removeChild(child);
            cardCheckbox.disabled = current.hasChildren();
            listItem.remove();
          }, 200);
        }, DELETION_HOLD_DELAY);
      };

      const cancelDeletion = function () {
        listItem.classList.remove("deleting");
        clearTimeout(warningTimeout);
        clearTimeout(deleteTimeout);
      };

      listItem.ontouchmove = cancelDeletion;
      listItem.ontouchend = cancelDeletion;

      cardChildrenList.insertBefore(listItem, cardChildrenList.firstChild);
    });

    if (cardChildrenList.classList.contains("selection")) {
      cardChildrenList.resetSelection();
    }
  } else {
    const cardNoChildren = document.createElement("li");
    cardNoChildren.id = "card-no-children";
    cardNoChildren.textContent =
      "This card has no children. You can add a new subcard by pressing arrow down button.";
    cardChildrenList.appendChild(cardNoChildren);

    if (cardChildrenList.classList.contains("selection")) {
      toggleListSelection();
    }
  }
}

function toggleListSelection() {
  const enabled = cardChildrenList.classList.toggle("selection");

  if (enabled) {
    if (current.children.length == 0) {
      cardChildrenList.classList.remove("selection");
      return;
    }

    document.body.style.overflow = "hidden";

    var selectedIndex = 0;
    var selectedElt = null;

    function select() {
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

    select();

    cardChildrenList.dataset.cardTitle = current.title;

    cardChildrenList.backSelection = () => {
      selectedIndex--;

      if (selectedIndex < 0) {
        selectedIndex = current.children.length - 1;
      }

      select();
    };

    cardChildrenList.nextSelection = () => {
      selectedIndex = ++selectedIndex % current.children.length;
      select();
    };

    cardChildrenList.openSelection = () => {
      const length = current.children.length - 1;

      if (length < 0) {
        toggleListSelection();
        return;
      }

      const card = current.children[length - selectedIndex];
      current = card;
      renderCard();
    };

    cardChildrenList.resetSelection = () => {
      cardChildrenList.dataset.cardTitle = current.title;
      selectedIndex = 0;
      select();
    };
  } else {
    document.body.style.overflow = "scroll";
    cardChildrenList.querySelectorAll(".selected").forEach((child) => {
      child.classList.remove("selected");
    });
  }
}

function addNewCard() {
  var newCard = createCard(false, "", "", []);
  current.addChild(newCard);
  current = newCard;

  renderCard(current);
  cardTitleInput.focus();
}

function goBack() {
  if (current.parent) {
    current = current.parent;
    renderCard(current);
  }
}

function setupKeyBindings() {
  const { setKey } = KeyBindings;

  setKey({ which: "h", ctrl: true }, () => {
    window.location.replace("index.html");
  }).label("Go Home");

  setKey({ which: "m", ctrl: true }, () => {
    cardCheckbox.click();
  }).label("Check/Uncheck");

  setKey({ which: "e", ctrl: true }, toggleExpandedDescription).label(
    "Expand description",
  );

  setKey({ which: "b", ctrl: true }, goBack).label("Go Back");

  setKey({ which: "n", ctrl: true }, addNewCard).label("New Card");

  setKey({ which: "l", ctrl: true }, toggleListSelection).label(
    "Selection mode",
  );

  setKey({ which: "ArrowUp", manualEventLocker: true }, (evt) => {
    if (cardChildrenList.classList.contains("selection")) {
      evt.preventDefault();
      cardChildrenList.backSelection();
    }
  }).label("Selection up");

  setKey({ which: "ArrowDown", manualEventLocker: true }, (evt) => {
    if (cardChildrenList.classList.contains("selection")) {
      evt.preventDefault();
      cardChildrenList.nextSelection();
    }
  }).label("Selection down");

  setKey({ which: "Enter", manualEventLocker: true }, (evt) => {
    if (cardChildrenList.classList.contains("selection")) {
      evt.preventDefault();
      cardChildrenList.openSelection();
    }
  }).label("Open selection");
}
