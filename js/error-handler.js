const DISMISS_ERROR_NOTIFICATION_TIME = 5000;

const errorList = document.createElement("div");
errorList.id = "error-list";

addEventListener("load", () => {
  document.body.appendChild(errorList);
});

window.onerror = (_, source, lineno, colno, error) => {
  const errorNotification = createErrorNotification(
    source,
    lineno,
    colno,
    error,
  );
  errorList.appendChild(errorNotification);
};

function createErrorNotification(source, lineno, colno, error) {
  const errNotificationItem = document.createElement("li");
  const errNotificationTitle = document.createElement("lineno");
  const errNotificationMessage = document.createElement("p");
  const errNotificationProgress = document.createElement("span");

  errNotificationItem.className = "error-notification";
  errNotificationTitle.className = "error-notification-title";
  errNotificationTitle.textContent = `${source} ${lineno}:${colno}`;
  errNotificationMessage.className = "error-notification-message";
  errNotificationMessage.textContent = error;
  errNotificationProgress.className = "error-notification-progress";

  var deleteProgress = 0;
  var interval = setInterval(() => {
    deleteProgress++;
    errNotificationProgress.style.setProperty("--progress", deleteProgress);

    if (deleteProgress === 100) {
      errNotificationItem.remove();
      clearInterval(interval);
    }
  }, DISMISS_ERROR_NOTIFICATION_TIME / 100);

  errNotificationItem.appendChild(errNotificationTitle);
  errNotificationItem.appendChild(errNotificationMessage);
  errNotificationItem.appendChild(errNotificationProgress);

  return errNotificationItem;
}
