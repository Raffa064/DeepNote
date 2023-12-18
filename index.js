var cardDiv = document.querySelector("#card");
var checkbox = document.getElementById("card-checkbox");
var titleInput = document.getElementById("card-title");
var descriptionInput = document.getElementById("card-description");
var listElement = document.getElementById("card-list");
var buttonUp = document.getElementById("card-button-up");
var buttonDown = document.getElementById("card-button-down");

var root = load() || createCard(false, "Root Card", "Descrição do Root Card", []);
var current = root;

Sortable.create(listElement, {	
  handle: ".handler",
  animation: 150, 
  onEnd: function (evt) {
    var movedChild = current.children.splice(evt.oldIndex, 1)[0];
    current.children.splice(evt.newIndex, 0, movedChild);
  }
});
  
buttonDown.onclick = addNewCard;
buttonUp.onclick = goBack;

renderCard(current);

setInterval(save, 500);

function load() {
  try {
    const json = localStorage.dn_root;
    const parsed = JSON.parse(json);
    if (parsed.title) {
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

    console.log(_children);

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
	}
  };
  
  children.forEach(child => {
	  child.parent = card
  });

  return card;
}

function addNewCard() {
  var newCard = createCard(false, "Novo Card", "Descrição do Novo Card", []);
  current.addChild(newCard);
  current = newCard;

  renderCard(current);
}

function goBack() {
  if (current.parent) {
    current = current.parent;
    renderCard(current);
  }
}

function renderCard(card) {
  cardDiv.classList.add("anim-stretch");
  cardDiv.onanimationend = function () {
    cardDiv.classList.remove("anim-stretch");
  };

  if (card.children.length > 0) {
    card.checked = card.children.every(child => child.checked === true);
  }

  checkbox.checked = card.checked;
  checkbox.disabled = card.children.length > 0;
  titleInput.value = card.title;
  descriptionInput.value = card.description;

  checkbox.onchange = function () {
    card.checked = checkbox.checked;
  };

  titleInput.oninput = function () {
    card.title = titleInput.value;
  };

  descriptionInput.oninput = function () {
    card.description = descriptionInput.value;
  };
  
  listElement.innerHTML = "";
  card.children.forEach(function (child) {
    var listItem = document.createElement("li");

    var childCheckbox = document.createElement("input");
  	childCheckbox.classList.add("handler")
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
				card.removeChild(child);
				listItem.remove();
			}, 200);
		}, 3000)
	}
	
	const cancelDeletion = function () {
		listItem.classList.remove("deleting");
		clearTimeout(warningTimeout);		
		clearTimeout(deleteTimeout);
	}
	
	listItem.ontouchmove = cancelDeletion;
	listItem.ontouchend = cancelDeletion;
	
    listElement.appendChild(listItem);
  });
}
