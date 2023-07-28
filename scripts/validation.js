const validatePhone = (phone) => {
  const regex =
    /^(\+38)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return regex.test(phone);
};

export const validation = (form) => {
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

    input.onblur = () => {
      if (input.dataset.minLength) {
        if (input.value.length < input.dataset.minLength) {
          removeError(input);
          createError(
            input,
            `Мінімальна кіл-ть символів: ${input.dataset.minLength}`
          );
          result = false;
        }
      }

      if (input.dataset.maxLength) {
        if (input.value.length > input.dataset.maxLength) {
          removeError(input);
          createError(
            input,
            `Максимальна кіл-ть символів: ${input.dataset.maxLength}`
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

      if (input.classList.contains("order__input_phone")) {
        if (!validatePhone(input.value)) {
          removeError(input);
          createError(input, "Номер телефону вказано не вірно!");
          result = false;
        }
      }
    };

    input.onfocus = () => {
      removeError(input);
    };
  }

  return result;
};
