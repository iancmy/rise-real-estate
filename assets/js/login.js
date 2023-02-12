import app from "./modules/app.js";

$("#log-in").on("submit", (e) => {
  e.preventDefault();
  const user = app.validateLogin(e.target.email, e.target.password);

  if (user) app.login(user);
});
