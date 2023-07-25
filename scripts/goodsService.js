import { API_URI } from "./config.js";

const createCard = (item) => {
  const cocktail = document.createElement("article");

  cocktail.classList.add("cocktail");

  cocktail.innerHTML = `
    <img 
      class="cocktail__img" 
      src="${API_URI}${item.image}"
      alt="Коктейль ${item.title}"
    >

    <div class="cocktail__content">
      <div class="cocktail__text">
        <h3 class="cocktail__title">${item.title}</h3>
        <p class="cocktail__price text-red">${item.price}&nbsp;₴</p>
        <p class="cocktail__size">${item.size}</p>
      </div>

      <button class="btn cocktail__btn cocktail__btn_add" type="button" data-id="${item.id}">Додати</button>
    </div>
  `;

  return cocktail;
};

export const renderCardList = (goodsListElem, data) => {
  const cardsCocktail = data.map((item) => {
    const li = document.createElement("li");

    li.classList.add("goods__item");
    li.append(createCard(item));

    return li;
  });

  goodsListElem.append(...cardsCocktail);
};
