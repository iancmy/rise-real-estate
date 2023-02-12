import app from "./app.js";

const updatedData = {};

// jquery load nav and footer
await $(document).ready(() => {
  $("#nav-bar-container").load("./partials/navigation.html", function () {
    app.getActiveLink();
    app.initialize();
    Object.assign(updatedData, app.jsonToClasses());
  });

  $("#footer-container").load("./partials/footer.html", function () {
    app.getActiveLink();
  });
});

export default updatedData;
