/*
 <div id="modal-container">
      <div id="modal">
        <h2 id="modal-title"></h2>
        <p id="modal-message"></p>
        <input id="modal-input" />
        <button class="modal-button" id="modal-positive-button"></button>
        <button class="modal-button" id="modal-negative-button"></button>
      </div>
    </div>

*/

const { includeCSS, createElement } = Utils

const Modal = (() => {
  const modalObj = {};

  includeCSS("../css/modal.css")

  const modalContainer = createElement("div", "modal-container");
  const modal = createElement("div", "modal");
  const modalTitle = createElement("h2", "modal-title");
  const modalMessage = createElement("p", "modal-message");
  const modalInput = createElement("input","modal-input");
  const modalPositiveButton = createElement("button", "modal-positive-button", "modal-button");
  const modalNegativeButton = createElement("button", "modal-negative-button", "modal-button");

  document.body.appendChild(modalContainer);
  modalContainer.appendChild(modal);
  modal.appendChild(modalTitle);
  modal.appendChild(modalMessage);
  modal.appendChild(modalInput);
  modal.appendChild(modalPositiveButton);
  modal.appendChild(modalNegativeButton);

  modalContainer.onanimationend = () => {
    modalContainer.classList.remove("anim-fade-in", "anim-fade-out");
  };

  modalContainer.ontouchstart = (e) => {
    if (e.target === modalContainer) {
      e.preventDefault();
      close();
    }
  };

  const formJS = FormJS();
  var validator = null;

  modalInput.oninput = () => {
    if (validator) {
      const isValid = validator(modalInput.value);

      if (isValid) {
        modalInput.classList.remove("invalid");
      } else {
        modalInput.classList.add("invalid");
      }

      modalNegativeButton.disabled = !isValid;
      modalPositiveButton.disabled = !isValid;
    }
  };

  function open() {
    document.body.style.overflow = "hidden";
    modalContainer.style.display = "flex";

    modalContainer.querySelectorAll("#modal *").forEach((elt) => {
      elt.style.display = "none"; // Hide all modal elements
    });

    modalContainer.classList.add("anim-fade-in");

    validator = null;
    modalInput.classList.remove("invalid");
    modalNegativeButton.disabled = false;
    modalPositiveButton.disabled = false;

    return modalObj;
  }

  function close() {
    modalContainer.classList.add("anim-fade-out");

    var closeCallback;
    function then(_callback) {
      closeCallback = _callback;
    }

    const onAnimationEnd = () => {
      document.body.style.overflow = "scroll";
      modalContainer.style.display = "none";
      modalContainer.removeEventListener("animationend", onAnimationEnd);

      if (closeCallback) {
        closeCallback();
      }
    };

    modalContainer.addEventListener("animationend", onAnimationEnd);

    return {
      then,
    };
  }

  function setTitle(title) {
    modalTitle.style.display = "block";
    modalTitle.textContent = title;

    return modalObj;
  }

  function setMessage(message) {
    modalMessage.style.display = "block";
    modalMessage.textContent = message;

    return modalObj;
  }

  function setInput(value, placeholder) {
    modalInput.style.display = "block";
    modalInput.value = value;
    modalInput.placeholder = placeholder;
    modalInput.focus();

    return modalObj;
  }

  function setInputValidator() {
    return (validator = formJS());
  }

  function getInput() {
    return modalInput.value;
  }

  function setButton(btn, text, onclick) {
    const buttons = {
      positive: modalPositiveButton,
      negative: modalNegativeButton,
    };

    const _button = buttons[btn];
    _button.style.display = "block";
    _button.textContent = text;
    _button.onclick = onclick;

    return modalObj;
  }

  Object.assign(modalObj, {
    open,
    close,
    setTitle,
    setMessage,
    setInput,
    getInput,
    setInputValidator,
    setPositive: (text, onclick) => setButton("positive", text, onclick),
    setNegative: (text, onclick) => setButton("negative", text, onclick),
  });

  return modalObj;
})()
