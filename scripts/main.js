const API_URI = "https://jade-incongruous-ravioli.glitch.me/";

const price = {
  Полуниця: 12,
  Банан: 12,
  Манго: 19,
  Ківі: 12,
  Маракуйя: 20,
  Яблуко: 8,
  "М'ята": 3,
  Біорозкладний: 5,
  Лід: 3,
  Пластиковий: 2,
  Лайм: 15,
};

const cartDataControl = {
  get() {
    return JSON.parse(localStorage.getItem("freshyBarCart") || "[]");
  },

  add(item) {
    const cartData = this.get();
    item.idls = Math.random().toString(36).substring(2, 9);
    cartData.push(item);

    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
  },

  remove(idls) {
    const cartData = this.get();
    const index = cartData.findIndex((item) => item.idls === idls);

    if (index !== -1) {
      cartData.splice(index, 1);
    }

    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
  },

  clear() {
    localStorage.removeItem("freshyBarCart");
  },
};

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

const modalController = ({
  modal,
  btnOpen,
  btnClose,
  time = 300,
  open,
  close,
}) => {
  let buttonElems = document.querySelectorAll(btnOpen);
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
      event === "close" ||
      target === modalElem ||
      (btnClose && target.closest(btnClose)) ||
      code === "Escape"
    ) {
      modalElem.style.opacity = 0;

      setTimeout(() => {
        modalElem.style.visibility = "hidden";

        scrollOptions.enabledScroll();

        if (close) {
          close();
        }
      }, time);

      window.removeEventListener("keydown", closeModal);
    }
  };

  const openModal = (e) => {
    if (open) {
      open({ btn: e.target });
    }
    modalElem.style.visibility = "visible";
    modalElem.style.opacity = 1;

    window.addEventListener("keydown", closeModal);

    scrollOptions.disabledScroll();
  };

  buttonElems.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  modalElem.addEventListener("click", closeModal);

  modalElem.closeModal = closeModal;
  modalElem.openModal = openModal;

  return { openModal, closeModal };
};

const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};

  for (const [name, value] of formData.entries()) {
    if (data[name]) {
      if (!Array.isArray(data[name])) {
        data[name] = [data[name]];
      }
      data[name].push(value);
    } else {
      data[name] = value;
    }
  }

  return data;
};

const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;

  const data = getFormData(form);

  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach((item) => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.ingredients] || 0;
  }

  if (Array.isArray(data.additionally)) {
    data.additionally.forEach((item) => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.additionally] || 0;
  }

  if (price[data.cup] === 2) {
    totalPrice -= 5 - price[data.cup];
  }
  if (price[data.cup] === 5) {
    totalPrice = totalPrice;
  }

  // totalPrice += price[data.cup];
  return totalPrice;
};

const formControl = (form, cb) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getFormData(form);
    cartDataControl.add(data);

    if (cb) {
      cb();
    }
  });
};

const calculateMakeYourOwn = () => {
  const modalMakeOwn = document.querySelector(".modal_make");
  const modalMakeForm = modalMakeOwn.querySelector(".make__form_own");
  const modalMakeInputTitle = modalMakeOwn.querySelector(".make__input-title");
  const modalMakeInputPrice = modalMakeOwn.querySelector(".make__input_price");
  const modalMakePrice = modalMakeOwn.querySelector(".make__price");
  const modalMakeBtn = modalMakeOwn.querySelector(".make__btn_add");

  const handlerChanged = () => {
    const totalPrice = calculateTotalPrice(modalMakeForm, 15);

    const data = getFormData(modalMakeForm);

    if (data.ingredients) {
      const ingredients = Array.isArray(data.ingredients)
        ? data.ingredients.join(", ")
        : data.ingredients;

      modalMakeInputTitle.value = `Конструктор: ${ingredients}`;

      modalMakeBtn.disabled = false;
    } else {
      modalMakeBtn.disabled = true;
    }

    modalMakeInputPrice.value = totalPrice;
    modalMakePrice.textContent = `${totalPrice} ₴`;
  };

  modalMakeForm.addEventListener("change", handlerChanged);
  formControl(modalMakeForm, () => {
    modalMakeOwn.closeModal("close");
  });

  handlerChanged();

  const resetForm = () => {
    modalMakeInputTitle.textContent = "";
    modalMakePrice.innerHTML = "";
    modalMakeBtn.disabled = true;

    modalMakeForm.reset();
  };

  return { resetForm };
};

const calculateAdd = () => {
  const modalAdd = document.querySelector(".modal_add");
  const modalAddForm = modalAdd.querySelector(".add__form_add");
  const modalAddTitle = modalAdd.querySelector(".add__title");
  const modalAddInputTitle = modalAdd.querySelector(".add__input-title");
  const modalAddInputImage = modalAdd.querySelector(".make__input-image");
  const modalAddInputStartPrice = modalAdd.querySelector(
    ".make__input_start-price"
  );
  const modalAddInputPrice = modalAdd.querySelector(".make__input_price");
  const modalAddPrice = modalAdd.querySelector(".make__price");
  const modalAddInputSize = modalAdd.querySelector(".make__input_size");
  const modalAddSize = modalAdd.querySelector(".make__size");

  const handlerChanged = () => {
    const totalPrice = calculateTotalPrice(
      modalAddForm,
      +modalAddInputStartPrice.value
    );

    modalAddInputPrice.value = totalPrice;
    modalAddPrice.innerHTML = `${totalPrice}&nbsp;₴`;
  };

  modalAddForm.addEventListener("change", handlerChanged);
  formControl(modalAddForm, () => {
    modalAdd.closeModal("close");
  });

  
  const fillInForm = (data) => {
    modalAddTitle.textContent = data.title;
    modalAddInputTitle.value = data.title;
    modalAddInputStartPrice.value = data.price;
    modalAddInputPrice.value = data.price;
    modalAddPrice.innerHTML = `${data.price}&nbsp;₴`;
    modalAddInputSize.value = data.size;
    modalAddSize.textContent = data.size;
    modalAddInputImage.value = `${API_URI}${data.image}`;
  };

  const resetForm = () => {
    modalAddTitle.textContent = "";
    modalAddPrice.innerHTML = "";
    modalAddSize.textContent = "";

    modalAddForm.reset();
  };

  handlerChanged();

  return { fillInForm, resetForm };
};

const createCartItem = (item) => {
  const li = document.createElement("li");
  li.classList.add("order__item");

  li.innerHTML = `
    <img
      class="order__img"
      src=${item.image}
      alt=${item.title}
    />

    <div class="order__info">
      <h3 class="order__name">${item.title}</h3>
      <ul class="order__topping-list">
        <li class="order__topping-item">${item.size}&nbsp;мл</li>
        <li class="order__topping-item">${item.cup}</li>
        ${
          item.additionally
            ? Array.isArray(item.additionally)
              ? item.additionally.map(
                  (topping) => `<li class="order__topping-item">${topping}</li>`
                )
              : `<li class="order__topping-item">${item.additionally}</li>`
            : ""
        }
      </ul>
    </div>

    <button
      class="order__item-del"
      aria-label="Видалити коктейль з кошика"
      data-idls='${item.idls}'
    ></button>

    <p class="order__item-price">${item.price}&nbsp;₴</p>
  `;

  return li;
};

const renderCart = () => {
  const modalOrder = document.querySelector(".modal_order");
  const modalOrderForm = modalOrder.querySelector(".order__form");
  const modalOrderList = modalOrder.querySelector(".order__list");
  const modalOrderTotalPrice = modalOrder.querySelector(".order__total-price");
  const modalOrderCount = modalOrder.querySelector(".order__count");
  const modalOrderBtn = modalOrder.querySelector(".order__btn");

  const orderListData = cartDataControl.get();
  modalOrderCount.textContent = `(${orderListData.length})`;

  if (orderListData.length) {
    modalOrderList.textContent = "";
    modalOrderBtn.disabled = false;
  } else {
    modalOrderBtn.disabled = true;
    modalOrderList.textContent = "На жаль, у кошику відсутні смузі! :(";
  }

  orderListData.forEach((item) => {
    modalOrderList.append(createCartItem(item));
  });

  modalOrderTotalPrice.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0
  )} ₴`;

  const modalOrderButtonsDel =
    modalOrderList.querySelectorAll(".order__item-del");
  modalOrderButtonsDel.forEach((btnDel) => {
    btnDel.addEventListener("click", (e) => {
      const idls = e.target.dataset.idls;

      cartDataControl.remove(idls);
      modalOrderForm.reset();

      const dataList = cartDataControl.get();
      modalOrderList.textContent = "";
      dataList.forEach((item) => {
        modalOrderList.append(createCartItem(item));
      });
      modalOrderCount.textContent = `(${dataList.length})`;
      modalOrderTotalPrice.textContent = `${dataList.reduce(
        (acc, item) => acc + +item.price,
        0
      )} ₴`;
    });
  });

  modalOrderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = getFormData(modalOrderForm);
    const response = await fetch(`${API_URI}api/order`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        products: orderListData,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { message } = await response.json();

    alert(message);

    cartDataControl.clear();
    modalOrderForm.reset();
    modalOrder.closeModal("close");
  });
};

const init = async () => {
  const goodsListElem = document.querySelector(".goods__list");

  const data = await getData();

  const cardsCocktail = data.map((item) => {
    const li = document.createElement("li");
    li.classList.add("goods__item");
    li.append(createCard(item));
    return li;
  });

  goodsListElem.append(...cardsCocktail);

  const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();
  const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn();

  modalController({
    modal: ".modal_order",
    btnOpen: ".header__btn-order",
    open: renderCart,
    btnClose: "",
  });

  modalController({
    modal: ".modal_make",
    btnOpen: ".cocktail__btn_make",
    btnClose: "",
    close: resetFormMakeYourOwn,
  });

  modalController({
    modal: ".modal_add",
    btnOpen: ".cocktail__btn_add",
    btnClose: "",
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find((item) => item.id.toString() === id);

      fillInFormAdd(item);
    },
    close: resetFormAdd,
  });
};

init();
