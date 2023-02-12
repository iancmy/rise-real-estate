import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

// Newsletter sign up logic
const form = $("#lead");
form.on("submit", (e) => {
  e.preventDefault();
  const leads = updatedData.leads;
  const lead = app.validateLead(e.target.email);

  if (!lead) return;

  leads.push(lead);
  app.updateStorage(leads, "leads");
  return app.redirect("/thank-you.html");
});

// Search logic
$("#search").on("keydown", (e) => {
  if (e.key === "Enter" || e.keyCode === 13) {
    app.redirect(`/explore.html?q=${e.target.value}`);
  }
});

console.log("Test");
