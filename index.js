const AUTO_SAVE_DELAY = 500;
const DELETION_HOLD_DELAY = 2000;

const cardDiv = document.querySelector("#card");
const checkbox = document.getElementById("card-checkbox");
const titleInput = document.getElementById("card-title");
const descriptionInput = document.getElementById("card-description");
const listElement = document.getElementById("card-list");
const buttonUp = document.getElementById("card-button-up");
const buttonDown = document.getElementById("card-button-down");

const root = load() || createCard(false, "", "", []);
var current = root;
renderCard(current);

Sortable.create(listElement, {
  handle: ".handler",
  animation: 150,
  onEnd: function (evt) {
    var movedChild = current.children.splice(evt.oldIndex, 1)[0];
    current.children.splice(evt.newIndex, 0, movedChild);
  },
});

buttonDown.onclick = addNewCard;
buttonUp.onclick = goBack;

setInterval(save, AUTO_SAVE_DELAY);

function load() {
  try {
    const json = localStorage.dn_root;
    const parsed = JSON.parse(json);

    if (parsed.title !== undefined) {
      return createCard(parsed);
    }

    return null;
  } catch {
    return null;
  }
}

function save() {
  const json = JSON.stringify(root, (k, v) => {
    if (k == "parent") {
      return undefined;
    }

    return v;
  });

  localStorage.dn_root = json;
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

function addNewCard() {
  var newCard = createCard(false, "", "", []);
  current.addChild(newCard);
  current = newCard;

  renderCard(current);
  titleInput.focus();
}

function goBack() {
  if (current.parent) {
    current = current.parent;
    renderCard(current);
  }
}

function renderCard() {
  cardDiv.classList.add("anim-stretch");
  cardDiv.onanimationend = function () {
    cardDiv.classList.remove("anim-stretch");
  };

  current.verifyChecked();
  checkbox.checked = current.checked;
  checkbox.disabled = current.hasChildren();
  titleInput.value = current.title;
  descriptionInput.value = current.description;

  checkbox.onchange = function () {
    current.checked = checkbox.checked;
  };

  titleInput.oninput = function () {
    current.title = titleInput.value;
  };

  descriptionInput.oninput = function () {
    current.description = descriptionInput.value;
  };

  listElement.innerHTML = "";
  current.children.forEach(function (child) {
    var listItem = document.createElement("li");

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
          checkbox.disabled = current.hasChildren();
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

    listElement.appendChild(listItem);
  });
}
