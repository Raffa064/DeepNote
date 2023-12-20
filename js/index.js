const { getWorkspaceList } = DeepNote;

const workspaceList = document.querySelector("#workspace-list");

for (const workspace of getWorkspaceList()) {
  const li = renderWorkspace(workspace);
  workspaceList.appendChild(li);
}

function renderWorkspace(name) {
  const listItem = document.createElement("li");
  listItem.className = "workspace ";

  const spanElement = document.createElement("span");
  spanElement.style.setProperty("--length", name.length);
  spanElement.className = "workspace-title";
  spanElement.textContent = name;

  listItem.appendChild(spanElement);

  listItem.onclick = () => {
    location.replace("workspace.html?WORKSPACE_NAME=" + name);
  };

  return listItem;
}
