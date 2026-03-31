import { b as bodyLockToggle, a as bodyLockStatus, i as isMobile, g as gotoBlock } from "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function menuInit$1() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit$1) : null;
class FullPage {
  constructor(element, options) {
    let config = {
      //===============================
      // Селектор, на якому не працює подія свайпа/колеса
      noEventSelector: "[data-fls-fullpage-noevent]",
      //===============================
      // Налаштування оболонки
      // Клас при ініціалізації плагіна
      classInit: "--fullpage-init",
      // Клас для врапера під час гортання
      wrapperAnimatedClass: "--fullpage-switching",
      //===============================
      // Налаштування секцій
      // СЕЛЕКТОР для секцій
      selectorSection: "[data-fls-fullpage-section]",
      // Клас для активної секції
      activeClass: "--fullpage-active-section",
      // Клас для Попередньої секції
      previousClass: "--fullpage-previous-section",
      // Клас для наступної секції
      nextClass: "--fullpage-next-section",
      // id початково активного класу
      idActiveSection: 0,
      //===============================
      // Інші налаштування
      // Свайп мишею
      // touchSimulator: false,
      //===============================
      // Ефекти
      // Ефекти: fade, cards, slider
      mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : "slider",
      //===============================
      // Булети
      // Активація буллетів
      bullets: element.hasAttribute("data-fls-fullpage-bullets") ? true : false,
      // Клас оболонки буллетів
      bulletsClass: "--fullpage-bullets",
      // Клас буллета
      bulletClass: "--fullpage-bullet",
      // Клас активного буллета
      bulletActiveClass: "--fullpage-bullet-active",
      //===============================
      // Події
      // Подія створення
      onInit: function() {
      },
      // Подія перегортання секції
      onSwitching: function() {
      },
      // Подія руйнування плагіна
      onDestroy: function() {
      }
    };
    this.options = Object.assign(config, options);
    this.wrapper = element;
    this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
    this.activeSection = false;
    this.activeSectionId = false;
    this.previousSection = false;
    this.previousSectionId = false;
    this.nextSection = false;
    this.nextSectionId = false;
    this.bulletsWrapper = false;
    this.stopEvent = false;
    if (this.sections.length) {
      this.init();
    }
  }
  //===============================
  // Початкова ініціалізація
  init() {
    if (this.options.idActiveSection > this.sections.length - 1) return;
    this.setId();
    this.activeSectionId = this.options.idActiveSection;
    this.setEffectsClasses();
    this.setClasses();
    this.setStyle();
    if (this.options.bullets) {
      this.setBullets();
      this.setActiveBullet(this.activeSectionId);
    }
    this.events();
    setTimeout(() => {
      document.documentElement.classList.add(this.options.classInit);
      this.options.onInit(this);
      document.dispatchEvent(new CustomEvent("fpinit", {
        detail: {
          fp: this
        }
      }));
    }, 0);
  }
  //===============================
  // Видалити
  destroy() {
    this.removeEvents();
    this.removeClasses();
    document.documentElement.classList.remove(this.options.classInit);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
    this.removeEffectsClasses();
    this.removeZIndex();
    this.removeStyle();
    this.removeId();
    this.options.onDestroy(this);
    document.dispatchEvent(new CustomEvent("fpdestroy", {
      detail: {
        fp: this
      }
    }));
  }
  //===============================
  // Встановлення ID для секцій
  setId() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.setAttribute("data-fls-fullpage-id", index);
    }
  }
  //===============================
  // Видалення ID для секцій
  removeId() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.removeAttribute("data-fls-fullpage-id");
    }
  }
  //===============================
  // Функція встановлення класів для першої, активної та наступної секцій
  setClasses() {
    this.previousSectionId = this.activeSectionId - 1 >= 0 ? this.activeSectionId - 1 : false;
    this.nextSectionId = this.activeSectionId + 1 < this.sections.length ? this.activeSectionId + 1 : false;
    this.activeSection = this.sections[this.activeSectionId];
    this.activeSection.classList.add(this.options.activeClass);
    for (let index = 0; index < this.sections.length; index++) {
      document.documentElement.classList.remove(`--fullpage-section-${index}`);
    }
    document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);
    if (this.previousSectionId !== false) {
      this.previousSection = this.sections[this.previousSectionId];
      this.previousSection.classList.add(this.options.previousClass);
    } else {
      this.previousSection = false;
    }
    if (this.nextSectionId !== false) {
      this.nextSection = this.sections[this.nextSectionId];
      this.nextSection.classList.add(this.options.nextClass);
    } else {
      this.nextSection = false;
    }
  }
  //===============================
  // Присвоєння класів із різними ефектами
  removeEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.remove("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.remove("cards-mode");
        this.setZIndex();
        break;
      case "fade":
        this.wrapper.classList.remove("fade-mode");
        this.setZIndex();
        break;
    }
  }
  //===============================
  // Присвоєння класів із різними ефектами
  setEffectsClasses() {
    switch (this.options.mode) {
      case "slider":
        this.wrapper.classList.add("slider-mode");
        break;
      case "cards":
        this.wrapper.classList.add("cards-mode");
        this.setZIndex();
        break;
      case "fade":
        this.wrapper.classList.add("fade-mode");
        this.setZIndex();
        break;
    }
  }
  //===============================
  // Блокування напрямків скролла
  //===============================
  // Функція встановлення стилів
  setStyle() {
    switch (this.options.mode) {
      case "slider":
        this.styleSlider();
        break;
      case "cards":
        this.styleCards();
        break;
      case "fade":
        this.styleFade();
        break;
    }
  }
  // slider-mode
  styleSlider() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index === this.activeSectionId) {
        section.style.transform = "translate3D(0,0,0)";
      } else if (index < this.activeSectionId) {
        section.style.transform = "translate3D(0,-100%,0)";
      } else if (index > this.activeSectionId) {
        section.style.transform = "translate3D(0,100%,0)";
      }
    }
  }
  // cards mode
  styleCards() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index >= this.activeSectionId) {
        section.style.transform = "translate3D(0,0,0)";
      } else if (index < this.activeSectionId) {
        section.style.transform = "translate3D(0,-100%,0)";
      }
    }
  }
  // fade style 
  styleFade() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      if (index === this.activeSectionId) {
        section.style.opacity = "1";
        section.style.pointerEvents = "all";
      } else {
        section.style.opacity = "0";
        section.style.pointerEvents = "none";
      }
    }
  }
  //===============================
  // Видалення стилів
  removeStyle() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.opacity = "";
      section.style.visibility = "";
      section.style.transform = "";
    }
  }
  //===============================
  // Функція перевірки чи повністю було прокручено елемент
  checkScroll(yCoord, element) {
    this.goScroll = false;
    if (!this.stopEvent && element) {
      this.goScroll = true;
      if (this.haveScroll(element)) {
        this.goScroll = false;
        const position = Math.round(element.scrollHeight - element.scrollTop);
        if (Math.abs(position - element.scrollHeight) < 2 && yCoord <= 0 || Math.abs(position - element.clientHeight) < 2 && yCoord >= 0) {
          this.goScroll = true;
        }
      }
    }
  }
  //===============================
  // Перевірка висоти 
  haveScroll(element) {
    return element.scrollHeight !== window.innerHeight;
  }
  //===============================
  // Видалення класів 
  removeClasses() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.classList.remove(this.options.activeClass);
      section.classList.remove(this.options.previousClass);
      section.classList.remove(this.options.nextClass);
    }
  }
  //===============================
  // Збірник подій...
  events() {
    this.events = {
      // Колесо миші
      wheel: this.wheel.bind(this),
      // Свайп
      touchdown: this.touchDown.bind(this),
      touchup: this.touchUp.bind(this),
      touchmove: this.touchMove.bind(this),
      touchcancel: this.touchUp.bind(this),
      // Кінець анімації
      transitionEnd: this.transitionend.bind(this),
      // Клік для буллетів
      click: this.clickBullets.bind(this)
    };
    if (isMobile.iOS()) {
      document.addEventListener("touchmove", (e) => {
        e.preventDefault();
      });
    }
    this.setEvents();
  }
  setEvents() {
    this.wrapper.addEventListener("wheel", this.events.wheel);
    this.wrapper.addEventListener("touchstart", this.events.touchdown);
    if (this.options.bullets && this.bulletsWrapper) {
      this.bulletsWrapper.addEventListener("click", this.events.click);
    }
  }
  removeEvents() {
    this.wrapper.removeEventListener("wheel", this.events.wheel);
    this.wrapper.removeEventListener("touchdown", this.events.touchdown);
    this.wrapper.removeEventListener("touchup", this.events.touchup);
    this.wrapper.removeEventListener("touchcancel", this.events.touchup);
    this.wrapper.removeEventListener("touchmove", this.events.touchmove);
    if (this.bulletsWrapper) {
      this.bulletsWrapper.removeEventListener("click", this.events.click);
    }
  }
  //===============================
  // Функція кліка по булетах
  clickBullets(e) {
    const bullet = e.target.closest(`.${this.options.bulletClass}`);
    if (bullet) {
      const arrayChildren = Array.from(this.bulletsWrapper.children);
      const idClickBullet = arrayChildren.indexOf(bullet);
      this.switchingSection(idClickBullet);
    }
  }
  //===============================
  // Установка стилів для буллетів
  setActiveBullet(idButton) {
    if (!this.bulletsWrapper) return;
    const bullets = this.bulletsWrapper.children;
    for (let index = 0; index < bullets.length; index++) {
      const bullet = bullets[index];
      if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
      else bullet.classList.remove(this.options.bulletActiveClass);
    }
  }
  //===============================
  // Функція натискання тач/пера/курсора
  touchDown(e) {
    this._yP = e.changedTouches[0].pageY;
    this._eventElement = e.target.closest(`.${this.options.activeClass}`);
    if (this._eventElement) {
      this._eventElement.addEventListener("touchend", this.events.touchup);
      this._eventElement.addEventListener("touchcancel", this.events.touchup);
      this._eventElement.addEventListener("touchmove", this.events.touchmove);
      this.clickOrTouch = true;
      if (isMobile.iOS()) {
        if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
          if (this._eventElement.scrollTop === 0) {
            this._eventElement.scrollTop = 1;
          }
          if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
            this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
          }
        }
        this.allowUp = this._eventElement.scrollTop > 0;
        this.allowDown = this._eventElement.scrollTop < this._eventElement.scrollHeight - this._eventElement.clientHeight;
        this.lastY = e.changedTouches[0].pageY;
      }
    }
  }
  //===============================
  // Подія руху тач/пера/курсора
  touchMove(e) {
    const targetElement = e.target.closest(`.${this.options.activeClass}`);
    if (isMobile.iOS()) {
      let up = e.changedTouches[0].pageY > this.lastY;
      let down = !up;
      this.lastY = e.changedTouches[0].pageY;
      if (targetElement) {
        if (up && this.allowUp || down && this.allowDown) {
          e.stopPropagation();
        } else if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
    if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return;
    let yCoord = this._yP - e.changedTouches[0].pageY;
    this.checkScroll(yCoord, targetElement);
    if (this.goScroll && Math.abs(yCoord) > 20) {
      this.choiceOfDirection(yCoord);
    }
  }
  //===============================
  // Подія відпускання від екрану тач/пера/курсора
  touchUp(e) {
    this._eventElement.removeEventListener("touchend", this.events.touchup);
    this._eventElement.removeEventListener("touchcancel", this.events.touchup);
    this._eventElement.removeEventListener("touchmove", this.events.touchmove);
    return this.clickOrTouch = false;
  }
  //===============================
  // Кінець спрацьовування переходу
  transitionend(e) {
    this.stopEvent = false;
    document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
    this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
  }
  //===============================
  // Подія прокручування колесом миші
  wheel(e) {
    if (e.target.closest(this.options.noEventSelector)) return;
    const yCoord = e.deltaY;
    const targetElement = e.target.closest(`.${this.options.activeClass}`);
    this.checkScroll(yCoord, targetElement);
    if (this.goScroll) this.choiceOfDirection(yCoord);
  }
  //===============================
  // Функція вибору напряму
  choiceOfDirection(direction) {
    if (direction > 0 && this.nextSection !== false) {
      this.activeSectionId = this.activeSectionId + 1 < this.sections.length ? ++this.activeSectionId : this.activeSectionId;
    } else if (direction < 0 && this.previousSection !== false) {
      this.activeSectionId = this.activeSectionId - 1 >= 0 ? --this.activeSectionId : this.activeSectionId;
    }
    this.switchingSection(this.activeSectionId, direction);
  }
  //===============================
  // Функція перемикання слайдів
  switchingSection(idSection = this.activeSectionId, direction) {
    if (!direction) {
      if (idSection < this.activeSectionId) {
        direction = -100;
      } else if (idSection > this.activeSectionId) {
        direction = 100;
      }
    }
    this.activeSectionId = idSection;
    this.stopEvent = true;
    if (this.previousSectionId === false && direction < 0 || this.nextSectionId === false && direction > 0) {
      this.stopEvent = false;
    }
    if (this.stopEvent) {
      document.documentElement.classList.add(this.options.wrapperAnimatedClass);
      this.wrapper.classList.add(this.options.wrapperAnimatedClass);
      this.removeClasses();
      this.setClasses();
      this.setStyle();
      if (this.options.bullets) this.setActiveBullet(this.activeSectionId);
      let delaySection;
      if (direction < 0) {
        delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
        document.documentElement.classList.add("--fullpage-up");
        document.documentElement.classList.remove("--fullpage-down");
      } else {
        delaySection = this.activeSection.dataset.flsFullpageDirectionDown ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown) : 500;
        document.documentElement.classList.remove("--fullpage-up");
        document.documentElement.classList.add("--fullpage-down");
      }
      setTimeout(() => {
        this.events.transitionEnd();
      }, delaySection);
      this.options.onSwitching(this);
      document.dispatchEvent(new CustomEvent("fpswitching", {
        detail: {
          fp: this
        }
      }));
    }
  }
  //===============================
  // Встановлення булетів
  setBullets() {
    this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);
    if (!this.bulletsWrapper) {
      const bullets = document.createElement("div");
      bullets.classList.add(this.options.bulletsClass);
      this.wrapper.append(bullets);
      this.bulletsWrapper = bullets;
    }
    if (this.bulletsWrapper) {
      for (let index = 0; index < this.sections.length; index++) {
        const span = document.createElement("span");
        span.classList.add(this.options.bulletClass);
        this.bulletsWrapper.append(span);
      }
    }
  }
  //===============================
  // Z-INDEX
  setZIndex() {
    let zIndex = this.sections.length;
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.zIndex = zIndex;
      --zIndex;
    }
  }
  removeZIndex() {
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index];
      section.style.zIndex = "";
    }
  }
}
if (document.querySelector("[data-fls-fullpage]")) {
  window.addEventListener("load", () => window.flsFullpage = new FullPage(document.querySelector("[data-fls-fullpage]")));
}
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-fls-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.flsFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-fls-form-error>${formRequiredItem.dataset.flsFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-fls-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-fls-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  removeFocus(formRequiredItem) {
    formRequiredItem.classList.remove("--form-focus");
    formRequiredItem.parentElement.classList.remove("--form-focus");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        formValidate.removeFocus(el);
        formValidate.removeSuccess(el);
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            window["flsSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
function formInit() {
  function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
      for (const form of forms) {
        !form.hasAttribute("data-fls-form-novalidate") ? form.setAttribute("novalidate", true) : null;
        form.addEventListener("submit", function(e) {
          const form2 = e.target;
          formSubmitAction(form2, e);
        });
        form.addEventListener("reset", function(e) {
          const form2 = e.target;
          formValidate.formClean(form2);
        });
      }
    }
    async function formSubmitAction(form, e) {
      const error = formValidate.getErrors(form);
      if (error === 0) {
        if (form.dataset.flsForm === "ajax") {
          e.preventDefault();
          const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
          const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
          const formData = new FormData(form);
          form.classList.add("--sending");
          const response = await fetch(formAction, {
            method: formMethod,
            body: formData
          });
          if (response.ok) {
            let responseResult = await response.json();
            form.classList.remove("--sending");
            formSent(form, responseResult);
          } else {
            form.classList.remove("--sending");
          }
        } else if (form.dataset.flsForm === "dev") {
          e.preventDefault();
          formSent(form);
        }
      } else {
        e.preventDefault();
        if (form.querySelector(".--form-error") && form.hasAttribute("data-fls-form-gotoerr")) {
          const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : ".--form-error";
          gotoBlock(formGoToErrorClass);
        }
      }
    }
    function formSent(form, responseResult = ``) {
      document.dispatchEvent(new CustomEvent("formSent", {
        detail: {
          form
        }
      }));
      setTimeout(() => {
        if (window.flsPopup) {
          const popup = form.dataset.flsFormPopup;
          popup ? window.flsPopup.open(popup) : null;
        }
      }, 0);
      formValidate.formClean(form);
    }
  }
  function formFieldsInit() {
    document.body.addEventListener("focusin", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.add("--form-focus");
          targetElement.parentElement.classList.add("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.removeError(targetElement) : null;
      }
    });
    document.body.addEventListener("focusout", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.remove("--form-focus");
          targetElement.parentElement.classList.remove("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.validateInput(targetElement) : null;
      }
    });
  }
  formSubmit();
  formFieldsInit();
}
document.querySelector("[data-fls-form]") ? window.addEventListener("load", formInit) : null;
const projectform = document.querySelector(".projectform");
if (!matchMedia("(any-hover: hover) and (pointer: fine)").matches) {
  projectform.classList.add("projectform--animated");
} else {
  projectform.addEventListener("mouseenter", function() {
    this.classList.add("projectform--animated");
  }, { once: true });
}
document.addEventListener("DOMContentLoaded", () => {
  const animPhone = document.querySelector(".phone");
  if (!animPhone) return;
  setTimeout(() => {
    animPhone.classList.add("phone--loop");
  }, 2300);
});
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
