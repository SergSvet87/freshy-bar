import { sendData } from "./apiService.js";
import { API_URI } from "./config.js";
import { getFormData } from "./getFormData.js";

const modalOrder = document.querySelector(".modal_order");
const modalOrderForm = modalOrder.querySelector(".order__form");
const modalOrderList = modalOrder.querySelector(".order__list");
const modalOrderTotalPrice = modalOrder.querySelector(".order__total-price");
const modalOrderCount = modalOrder.querySelector(".order__count");
const modalOrderBtn = modalOrder.querySelector(".order__btn");
let modalOrderInputPhone = modalOrder.querySelector(".order__input_phone");

const successName = document.querySelector(".success__name");

const validatePhone = (phone) => {
  const regex =
    /^(\+38)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return regex.test(phone);
};

const validation = (form) => {
  console.log('form: ', form);
  const removeError = (input) => {
    const parent = input.parentNode;

    if (parent.classList.contains("error")) {
      parent.querySelector(".error-text").remove();
      parent.classList.remove("error");
    }
  };

  const createError = (input, text) => {
    const parent = input.parentNode;
    const errorText = document.createElement("p");

    errorText.classList.add("error-text");
    errorText.textContent = text;

    parent.classList.add("error");

    parent.append(errorText);
  };

  let result = true;

  const allInputs = form.querySelectorAll("input");

  for (const input of allInputs) {
    removeError(input);

    if (input.dataset.minLength) {
      if (input.value.length < input.dataset.minLength) {
        removeError(input);
        createError(
          input,
          `Мініальна кіл-ть символів: ${input.dataset.minLength}`
        );
        result = false;
      }
    }

    if (input.dataset.maxLength) {
      if (input.value.length > input.dataset.maxLength) {
        removeError(input);
        createError(
          input,
          `Максимальна кіл-ь символів: ${input.dataset.maxLength}`
        );
        result = false;
      }
    }

    if (input.dataset.required == "true") {
      if (input.value == "") {
        removeError(input);
        createError(input, "Поле не заповнене!");
        result = false;
      }
    }

    if (input.value === modalOrderInputPhone.value) {
      if (!validatePhone(input.value)) {
        removeError(input);
        createError(input, "Номер телефону вказано не вірно!");
        result = false;
      }
    }
  }

  return result;
};

export const cartDataControl = {
  get() {
    return JSON.parse(localStorage.getItem("freshyBarCart") || "[]");
  },

  add(item) {
    const cartData = this.get();
    item.idls = Math.random().toString(36).substring(2, 9);
    cartData.push(item);
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
    renderCountCart(cartData.length);
  },

  remove(idls) {
    const cartData = this.get();
    const index = cartData.findIndex((item) => item.idls === idls);
    if (index !== -1) {
      cartData.splice(index, 1);
    }
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
    renderCountCart(cartData.length);
  },

  clear() {
    localStorage.removeItem("freshyBarCart");
    renderCountCart(0);
  },
};

const renderCountCart = (count) => {
  const headerBtnOrder = document.querySelector(".header__btn-order");
  headerBtnOrder.dataset.count = count || cartDataControl.get().length;
};

renderCountCart();

const createCartItem = (item, data) => {
  const img = data.find((cocktail) => cocktail.title === item.title)?.image;
  const li = document.createElement("li");

  li.classList.add("order__item");
  li.innerHTML = `
    <img class="order__img" src="${
      img ? `${API_URI}${img}` : "images/jpg/make-your-own.jpg"
    }"
      alt="${item.title}">

    <div class="order__info">
      <h3 class="order__name">${item.title}</h3>

      <ul class="order__topping-list">
        <li class="order__topping-item">${item.size}</li>
        <li class="order__topping-item">${item.cup}</li>
        ${
          item.additionally
            ? Array.isArray(item.additionally)
              ? item.additionally
                  .map(
                    (additionally) =>
                      `<li class="order__topping-item">${additionally}</li>`
                  )
                  .toString()
                  .replace(",", "")
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

const renderCartList = (data) => {
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
    modalOrderList.append(createCartItem(item, data));
  });

  modalOrderTotalPrice.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0
  )} ₴`;
};

const handlerSubmit = async (e) => {
  e.preventDefault();

  const orderListData = cartDataControl.get();

  if (validation(modalOrderForm) === true) {
    modalOrderBtn.disabled = false;
    const data = getFormData(modalOrderForm);

    const response = await sendData({
      ...data,
      products: orderListData,
    });
    console.log("response: ", await response.json());

    successName.textContent = data.name;
  } else {
    modalOrderBtn.disabled = true;
  }

  if (!orderListData.length) {
    modalOrderBtn.disabled = true;
    modalOrderForm.reset();
    modalOrder.closeModal("close");
    return;
  }

  cartDataControl.clear();
  modalOrderForm.reset();
  modalOrder.closeModal("close");
};

export const renderCart = (data) => {
  renderCartList(data);

  if (!data) {
    modalOrderBtn.disabled = true;
  }

  modalOrderForm.addEventListener("submit", handlerSubmit);

  modalOrderList.addEventListener("click", (e) => {
    if (e.target.classList.contains("order__item-del")) {
      cartDataControl.remove(e.target.dataset.idls);
      renderCartList(data);
    }
  });
};
