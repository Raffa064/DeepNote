const Utils = (() => {
  function createTreeObserver(target, callback) {
    const mObjserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          callback();
        }
      });
    });

    mObjserver.observe(target, {
      childList: true,
      subtree: false,
    });

    return mObjserver;
  }

  function getParams() {
    const params = {};

    const urlParams = location.search.substring(1).split("&");

    for (const param of urlParams) {
      const [name, value] = param.split("=").map((x) => x.trim());
      params[name] = decodeURI(value);
    }

    return params;
  }

  function getElementById(id) {
    return document.getElementById(id);
  }

  return {
    createTreeObserver,
    getParams,
    getElementById
  };
})()
