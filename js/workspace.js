const { getWorkspace, createCard, saveWorkspaces } = DeepNote();
const { WORKSPACE_NAME } = getParams();
const AUTO_SAVE_DELAY = 500;
const DELETION_HOLD_DELAY = 2000;

const cardDiv = document.querySelector("#card");
const checkbox = document.getElementById("card-checkbox");
const titleInput = document.getElementById("card-title");
const descriptionInput = document.getElementById("card-description");
const listElement = document.getElementById("card-list");
const buttonUp = document.getElementById("card-button-up");
const buttonDown = document.getElementById("card-button-down");

var workspace = getWorkspace(WORKSPACE_NAME);
var root = workspace.root || createCard(false, "", "", []);
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

setInterval(saveWorkspaces, AUTO_SAVE_DELAY);

function getParams() {
  const params = {};

  const urlParams = location.search.substring(1).split("&");

  for (const param of urlParams) {
    const [name, value] = param.split("=").map((x) => x.trim());
    params[name] = value;
  }

  return params;
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
