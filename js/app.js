const App = (() => {
  var isAndroidApp = false;
  var info = {};

  try {
    // "app" is provided by android app (@JavaScriptInterface)
    const app = window.app;
    const appInfo = JSON.parse(app.getInfo());
    const commitInfo = JSON.parse(app.getCommitInfo());

    info = {
      ...appInfo,
      ...commitInfo,
      forceUpdate: () => app.forceUpdate(),
      showFolderContents: () => app.showFolderContents(),
      clearCache: () => app.clearCache(),
    };

    isAndroidApp = true;
  } catch {
    isAndroidApp = false;
  }

  if (isAndroidApp) {
    document.body.classList.add("mobile-app");
  }

  return {
    isAndroidApp,
    ...info,
  };
})();
