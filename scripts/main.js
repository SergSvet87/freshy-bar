import { getData } from "./apiService.js";
import { renderCart } from "./cartControl.js";
import { calculateAdd, calculateMakeYourOwn } from "./formControl.js";
import { renderCardList } from "./goodsService.js";
import { modalController } from "./modalController.js";

const init = async () => {
  const modalSuccess = document.querySelector(".modal_success");
  const successBtn = document.querySelector(".success__btn");

  const data = await getData();

  renderCardList(document.querySelector(".goods__list"), data);

  modalController({
    modal: ".modal_order",
    btnOpen: ".header__btn-order",
    btnClose: "",
    open() {
      renderCart(data);
    },
  });

  const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn();

  modalController({
    modal: ".modal_make",
    btnOpen: ".cocktail__btn_make",
    btnClose: "",
    close: resetFormMakeYourOwn,
  });

  const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

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

  modalController({
    modal: ".modal_success",
    btnOpen: ".order__btn",
  });

  successBtn.addEventListener("click", () => {
    modalSuccess.closeModal("close");
  });
};

init();
