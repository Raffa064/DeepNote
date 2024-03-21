const { createElement } = Utils
const container = document.getElementById("container") 

const lists = {
  "AppInfo": [
    { label: "Package:", description: App.package },
    { 
      label: "Version:",
      description: App.versionName + " (" + App.versionCode + ")",
    },
  ],
  "Local commit": [
    { label: "Author:", description: App.author },
    { label: "SHA:", description: App.sha, expandable: true },
    { label: "Message:", description: App.message },
  ],
  "Environment": [
    { label: "Screen:", description: screen.width + "x" + screen.height },
    { label: "Pixel depth:", description: screen.pixelDepth + " bits" },
    { label: "URI:", description: location, expandable: true },
    { label: "Agent:", description: navigator.userAgent, expandable: true }
  ],
    "Actions": [
      {
        action: "reload-page",
        label: "Reload",
        description: "Reload this page.",
      },
      {
        action: "force-update",
        label: "Force Update",
        description: "Force download resources.",
      },
      {
        action: "show-contents",
        label: "Show contents",
        description: "List internal files.",
      },
      {
        action: "clear-cache",
        label: "Clear cache",
        description: "Resolve cache problems.",
      },
  ]
}

for (let listName in lists) {
  const list = createLabeledList(listName, lists[listName])
  container.appendChild(list)
}

function createLabeledList(label = "", items = []) {
  const listElt = document.createElement("ul");
  const labelElt = document.createElement("label");

  labelElt.innerText = label;

  listElt.appendChild(labelElt);

  items.forEach((item) => {
    const itemElt = createListItem(item);
    listElt.appendChild(itemElt);
  });

  return listElt;
}

function createListItem({ action, label, description, expandable }) {
  const isButton = action != null;

  const itemElt = createElement("li");
  const labelElt = createElement(isButton ? "button" : "strong");
  const descriptionElt = createElement("span", undefined, "description");

  if (isButton) {
    labelElt.onclick = () => onListItemClick(action);
  }
 
  labelElt.innerText = label;
  descriptionElt.innerText = description;

  if (expandable) {
    // TODO: Use Utils.js to create
    const content = createElement("span", undefined, "hidden")
    const toggler = createElement("span", undefined, "toggler")
    
   content.innerText = description;
   toggler.innerText = "Show";
     
    toggler.onclick = () => {
      const hidden = content.classList.toggle("hidden");
      toggler.innerText = hidden? "Show" : "Hide";
    }

    descriptionElt.innerText = "";
    descriptionElt.appendChild(content);
    descriptionElt.appendChild(toggler);
  }

  itemElt.appendChild(labelElt);
  itemElt.appendChild(descriptionElt);

  return itemElt;
}

function onMenuOptionClick(id) {
  switch (id) {
    case "go-home":
      location.replace("index.html");
      break;
  }
}

function onListItemClick(action) {
  switch (action) {
    case "reload-page":
      location.reload();
      break;
    case "force-update":
      App.forceUpdate();
      break;
    case "show-contents":
      App.showFolderContents();
      break;
    case "clear-cache":
      App.clearCache();
      break;
  }
}
