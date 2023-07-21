const API_URI = "https://summer-long-echinodon.glitch.me/";

const getData = async () => {
  const response = await fetch(`${API_URI}api/goods`);
  const data = await response.json();

  return data;
};

const createCard = (item) => {
  const cocktail = document.createElement("article");
  cocktail.classList.add("cocktail");

  cocktail.innerHTML = `
    <img
      src="${API_URI}${item.image}"
      alt="Коктейль ${item.title}"
      class="cocktail__img"
    />

    <div class="cocktail__content">
      <div class="cocktail__text">
        <h3 class="cocktail__title">${item.title}</h3>
        <p class="cocktail__price text-red">${item.price} ₴</p>
        <p class="cocktail__size">${item.size}</p>
      </div>

      <button class="btn cocktail__btn cocktail__btn_add" type="button" data-id="${item.id}">Додати</button>
    </div>
  `;

  return cocktail;
};

const scrollOptions = {
  scrollPosition: 0,
  disabledScroll() {
    this.scrollPosition = window.scrollY;
    document.body.style.cssText = `
      overflow: hidden;
      position: fixed;
      top: -${this.scrollPosition}px;
      left: 0;
      height: 100vh;
      width: 100vw;
      padding-right: ${window.innerWidth - document.body.offsetWidth}px;
    `;
    document.documentElement.style.scrollBehavior = "unset";
  },
  enabledScroll() {
    document.body.style.cssText = `position: relative;`;
    window.scroll({ top: this.scrollPosition });
    document.documentElement.style.scrollBehavior = "";
  },
};

const modalController = ({ modal, btnOpen, btnClose, time = 300 }) => {
  const buttonElems = document.querySelectorAll(btnOpen);
  const modalElem = document.querySelector(modal);

  modalElem.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
  `;

  const closeModal = (event) => {
    const target = event.target;
    const code = event.code;

    if (
      target === modalElem ||
      (btnClose && target.closest(btnClose)) ||
      code === "Escape"
    ) {
      modalElem.style.opacity = 0;

      setTimeout(() => {
        modalElem.style.visibility = "hidden";

        scrollOptions.enabledScroll();
      }, time);

      window.removeEventListener("keydown", closeModal);
    }
  };

  const openModal = () => {
    modalElem.style.visibility = "visible";
    modalElem.style.opacity = 1;

    window.addEventListener("keydown", closeModal);

    scrollOptions.disabledScroll();
  };

  buttonElems.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  modalElem.addEventListener("click", closeModal);

  return { openModal, closeModal };
};

const init = async () => {
  const goodsListElem = document.querySelector(".goods__list");

  const data = await getData();

  modalController({
    modal: ".modal_order",
    btnOpen: ".header__btn-order",
    btnClose: "",
  });

  modalController({
    modal: ".modal_make",
    btnOpen: ".cocktail__btn_make",
    btnClose: "",
  });

  modalController({
    modal: ".modal_add",
    btnOpen: ".cocktail__btn_add",
    btnClose: "",
  });

  const cardsCocktail = data.map((item) => {
    const li = document.createElement("li");
    li.classList.add("goods__item");
    li.append(createCard(item));
    return li;
  });

  goodsListElem.append(...cardsCocktail);
};

init();
