import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

const signupForm = $("#sign-up");
signupForm.on("submit", (e) => {
  e.preventDefault();

  const users = updatedData.users;
  const firstName = e.target["first-name"];
  const lastName = e.target["last-name"];
  const email = e.target["email"];
  const password = e.target["create-password"];
  const confirmPassword = e.target["confirm-password"];
  const newUser = app.validateSignup(
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  );

  if (newUser) {
    users.push(newUser);
    app.updateStorage(users, "users");

    console.log(newUser);
    app.login(newUser);
  }
});
