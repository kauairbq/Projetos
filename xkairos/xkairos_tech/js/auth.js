const wrapper = document.getElementById("forms-wrapper");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  wrapper.classList.add("show-register");
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  wrapper.classList.remove("show-register");
});
