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

  function createElement(tag, id, ...classes) {
    const elt = document.createElement(tag)
    
    if (id) {
      elt.id = id
    }
    
    if (classes?.length > 0) {
      elt.classList.add(classes)
    }

    return elt
  }

  function includeCSS(path) {
    const link = createElement("link")
    link.rel = "stylesheet"
    link.href= path

    document.head.appendChild(link);
  }

  return {
    createTreeObserver,
    getParams,
    getElementById,
    createElement,
    includeCSS
  };
})()
