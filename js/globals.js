window.onerror = (event, source, lineno, colno, error) => {
  document.body.innerHTML =
    '<span style="color: var(--color-error)">\
    <strong>' +
    source +
    " " +
    lineno +
    ":" +
    colno +
    "</strong>\
    <div>" +
    error +
    "</div>\
  </span>";

  setTimeout(() => {
    location.reload();
  }, 2000);
};
