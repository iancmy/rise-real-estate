import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

const contactForm = $("#contact-form");
const subject = $("#subject");

// change text-color when user has selected
subject.on("change", (e) => {
  if (e.target.value === "no-subject")
    e.target.classList.add("has-not-selected");
  else e.target.classList.remove("has-not-selected");
});

// Remove #first-name, #last-name, and #email if user is logged in
setTimeout(() => {
  if (app.getStorage("login")) {
    const userLoggedIn = updatedData.users.find((user) => {
      return user.id === app.getStorage("login").id;
    });
    $("#first-name, #last-name, #email, label.name, label.email").remove();
    $("#contact-form label:first-child").after(
      `<p class="user-logged-in"><i class="fa-solid fa-user"></i>&nbsp;&nbsp;Logged in as: ${userLoggedIn.getFullName()}</p>`
    );
  }
}, 100);

contactForm.on("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const inquiries = updatedData.inquiries;
  const userLoggedIn = updatedData.users.find((user) => {
    return user.id === app.getStorage("login")?.id;
  });
  const inquiry = app.validateInquiry(
    form["first-name"],
    form["last-name"],
    form["email"],
    form["subject"],
    form["message"],
    userLoggedIn
  );

  if (inquiry) {
    inquiries.push(inquiry);
    app.updateStorage(inquiries, "inquiries");
    return app.redirect("/thank-you.html");
  }
});
