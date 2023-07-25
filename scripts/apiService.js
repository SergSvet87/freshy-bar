import { API_URI } from "./config.js";

export const getData = async () => {
  const response = await fetch(`${API_URI}api/goods`);
  const data = await response.json();
  return data;
};

export const sendData = async (data) => {
  return await fetch(`${API_URI}api/order`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
