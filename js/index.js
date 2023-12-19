const { listWorkspaces } = DeepNote();

const workspaceList = document.querySelector("#workspace-list");

for (const workspace of listWorkspaces()) {
  const li = renderWorkspace(workspace);
  workspaceList.appendChild(li);
}

function renderWorkspace(workspace) {
  const { name, root } = workspace;

  const listItem = document.createElement("li");
  listItem.className = "workspace " + (root.checked ? "complete" : "");

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
