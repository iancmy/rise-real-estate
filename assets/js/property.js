import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

let phoneInput;

// Initialize content
setTimeout(() => {
  const propertyID = location.search.slice(3);
  app.showPropertyViewHTML("property-container", propertyID);

  // For photo carousel (exzoom)
  $(function () {
    $("#exzoom").exzoom({
      // autoplay
      autoPlay: true,

      // autoplay interval in milliseconds
      autoPlayTimeout: 5000,
    });
  });

  // For contact number input
  const phoneInputField = document.querySelector("#sched-contact");
  phoneInput = window.intlTelInput(phoneInputField, {
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  // Set country to user's locale
  fetch("https://api.ipregistry.co/?key=b77iege8t4g4e78p")
    .then(function (response) {
      return response.json();
    })
    .then(function (payload) {
      phoneInput.setCountry(payload.location.country.code.toLowerCase());
    });
}, 100);

// Convert date and time input on focus and on blur
$(document).on("focus", "#sched-date", (e) => {
  const element = e.target;

  // disable past dates
  const today = new Date().toISOString().slice(0, 16);
  document.querySelector("#sched-date").min = today;

  if (element.value === "") return (element.type = "datetime-local");

  const localeString = new Date(element.value);
  const ISOString = new Date(
    localeString.getTime() - localeString.getTimezoneOffset() * 60000
  ).toISOString();

  element.type = "datetime-local";
  element.value = ISOString.replace("Z", "");
});

$(document).on("blur", "#sched-date", (e) => {
  const element = e.target;
  const date = new Date(element.value);
  element.type = "text";

  if (date.toLocaleString() === "Invalid Date") return;

  element.value = date.toLocaleString();
});

// Save button logic
$(document).on("click", "a.property-save", (e) => {
  e.preventDefault();
  // Prompt login if user is not yet logged in
  if (!app.getStorage("login")) return app.redirect("./log-in.html");

  const userID = app.getStorage("login").id;
  const user = updatedData.users.find((user) => user.id === userID);
  const saveBtn = $(e.target.closest("a.property-save"));
  const propertyID = saveBtn.attr("data-property-id");

  if (saveBtn.attr("data-saved")) {
    // If user already saved the property
    // Save button change html
    saveBtn.removeAttr("data-saved");
    saveBtn.html("Save&nbsp;&nbsp;<i class='fa-regular fa-heart'></i>");

    // Update user saved properties
    user.removeSavedProperty(propertyID);
  } else {
    // If user have not saved the property yet
    // Save button change html
    saveBtn.attr("data-saved", true);
    saveBtn.html("Saved&nbsp;&nbsp;<i class='fa-solid fa-heart'></i>");

    // Update user saved properties
    user.saveProperty(propertyID);
  }

  // Update local storage
  app.updateStorage(updatedData.users, "users");
});

// Appointment form sumbit logic
$(document).on(
  "submit",
  "#appointment > form:has(> button:not(.disabled))",
  (e) => {
    const userID = app.getStorage("login") ? app.getStorage("login").id : null;
    const user = updatedData.users.find((user) => user.id === userID);
    const form = e.target;
    const propertyID = $(form).attr("data-property-id");
    const appointments = updatedData.appointments;
    const properties = updatedData.properties;

    e.preventDefault();

    const appointment = app.validateAppointment(
      form["sched-name"],
      form["sched-email"],
      phoneInput,
      form["sched-date"],
      user?.id,
      propertyID
    );

    const property = properties.find(
      (property) => property.propertyID === propertyID
    );

    if (property) {
      property.appointments.push(appointment.appointmentID);
      app.updateStorage(properties, "properties");
    }

    if (user) {
      user.listProperty(propertyID, "appointment");
      app.updateStorage(updatedData.users, "users");
    }

    if (appointment) {
      appointments.push(appointment);
      app.updateStorage(appointments, "appointments");
      return app.redirect("/thank-you.html");
    }
  }
);
