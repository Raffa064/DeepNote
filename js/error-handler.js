const DISMISS_ERROR_NOTIFICATION_TIME = 2000;

const errorList = document.createElement("div");
errorList.id = "error-list";

addEventListener("load", () => {
  document.body.appendChild(errorList);
});

window.onerror = (event, source, lineno, colno, error) => {
  const errorNotification = createErrorNotification(
    source,
    lineno,
    colno,
    error,
  );
  errorList.appendChild(errorNotification);
};

function createErrorNotification(source, lineno, colno, error) {
  const errorItem = document.createElement("li");
  const errorTitle = document.createElement("lineno");
  const errorMessage = document.createElement("p");
  const errorProgress = document.createElement("span");

  errorItem.className = "error-notification";
  errorTitle.className = "error-notification-title";
  errorTitle.textContent = `${source} ${lineno}:${colno}`;
  errorMessage.className = "error-notification-message";
  errorMessage.textContent = error;
  errorProgress.className = "error-notification-progress";

  var deleteProgress = 0;
  var interval = setInterval(() => {
    deleteProgress++;
    errorProgress.style.setProperty("--progress", deleteProgress);

    if (deleteProgress === 100) {
      errorItem.remove();
      clearInterval(deleteProgress);
    }
  }, DISMISS_ERROR_NOTIFICATION_TIME / 100);

  errorItem.appendChild(errorTitle);
  errorItem.appendChild(errorMessage);
  errorItem.appendChild(errorProgress);

  return errorItem;
}
