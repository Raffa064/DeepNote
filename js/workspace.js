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

cardDescriptionExpand.onclick = () => {
  document.body.style.overflow = "hidden";
  cardDescriptionContainer.classList.add("expanded");
  cardDescriptionInput.focus();
};

cardDescriptionColapse.onclick = () => {
  document.body.style.overflow = "scroll";
  cardDescriptionContainer.classList.remove("expanded");
  cardDescriptionInput.blur();
};

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
