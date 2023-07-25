import { cartDataControl } from "./cartControl.js";
import { API_URI, price } from "./config.js";
import { getFormData } from "./getFormData.js";

export const formSubmit = (form, cb) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getFormData(form);
    cartDataControl.add(data);

    if (cb) {
      cb();
    }
  });
};

export const calculateTotalPrice = (form, startPrice) => {
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

  return totalPrice;
};

export const calculateMakeYourOwn = () => {
  const modalMakeOwn = document.querySelector(".modal_make");
  const modalMakeForm = modalMakeOwn.querySelector(".make__form_own");
  const modalMakeInputTitle = modalMakeOwn.querySelector(".make__input-title");
  const modalMakeInputPrice = modalMakeOwn.querySelector(".make__input_price");
  const modalMakePrice = modalMakeOwn.querySelector(".make__price");
  const modalMakeBtn = modalMakeOwn.querySelector(".make__btn_add");

  const handlerChange = () => {
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

  modalMakeForm.addEventListener("change", handlerChange);
  formSubmit(modalMakeForm, () => {
    modalMakeOwn.closeModal("close");
  });
  handlerChange();

  const resetForm = () => {
    modalMakeInputTitle.textContent = "";
    modalMakePrice.innerHTML = "";
    modalMakeBtn.disabled = true;

    modalMakeForm.reset();
  };

  return { resetForm };
};

export const calculateAdd = () => {
  const modalAdd = document.querySelector(".modal_add");
  const modalAddForm = modalAdd.querySelector(".add__form_add");
  const modalAddTitle = modalAdd.querySelector(".add__title");
  const modalAddInputTitle = modalAdd.querySelector(".add__input-title");
  const modalAddInputImage = modalAdd.querySelector(".add__input-image");
  const modalAddInputStartPrice = modalAdd.querySelector(
    ".make__input_start-price"
  );
  const modalAddInputPrice = modalAdd.querySelector(".make__input_price");
  const modalAddPrice = modalAdd.querySelector(".make__price");
  const modalAddInputSize = modalAdd.querySelector(".make__input_size");
  const modalAddSize = modalAdd.querySelector(".make__size");

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(
      modalAddForm,
      +modalAddInputStartPrice.value
    );
    modalAddInputPrice.value = totalPrice;
    modalAddPrice.textContent = `${totalPrice} ₴`;
  };

  modalAddForm.addEventListener("change", handlerChange);
  formSubmit(modalAddForm, () => {
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
    handlerChange();
  };

  const resetForm = () => {
    modalAddTitle.textContent = "";
    modalAddPrice.innerHTML = "";
    modalAddSize.textContent = "";

    modalAddForm.reset();
  };

  return { fillInForm, resetForm };
};
