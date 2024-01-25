const appInfoList = createLabeledList("AppInfo", [
  { label: "Package:", description: App.package },
  {
    label: "Version:",
    description: App.versionCode + " (" + App.versionName + ")",
  },
]);

const commitInfoList = createLabeledList("Local commit", [
  { label: "Author:", description: App.author },
  { label: "SHA:", description: App.sha },
  { label: "Message:", description: App.message },
]);

const actionsList = createLabeledList("Actions", [
  {
    isButton: true,
    action: "reload-page",
    label: "Reload",
    description: "Reload this page.",
  },
  {
    isButton: true,
    action: "force-update",
    label: "Force Update",
    description: "Force download resources.",
  },
  {
    isButton: true,
    action: "show-contents",
    label: "Show contents",
    description: "Show internal folder contents.",
  },
  {
    isButton: true,
    action: "clear-cache",
    label: "Clear cache",
    description: "This might resolve some cache problems.",
  },
]);

document.body.innerHTML = "";
document.body.appendChild(appInfoList);
document.body.appendChild(commitInfoList);
document.body.appendChild(actionsList);

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

function createListItem({ isButton, action, label, description }) {
  const itemElt = document.createElement("li");
  const labelElt = document.createElement(isButton ? "button" : "span");
  const descriptionElt = document.createElement("span");

  if (isButton) {
    labelElt.onclick = () => onListItemClick(action);
  }

  labelElt.innerText = label;
  descriptionElt.innerText = description;

  itemElt.appendChild(labelElt);
  itemElt.appendChild(descriptionElt);

  return itemElt;
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
