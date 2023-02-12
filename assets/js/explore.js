import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

let currentPageNumber;
let currentResult;

// Initialize properties
setTimeout(() => {
  if (location.search) {
    const query = location.search.slice(3).trim();
    currentResult = app.searchProperties(query, updatedData.properties);
    currentPageNumber = 1;
    app.showResults("property-list", app.paginateResult(currentResult));

    $("#search").val(`${query}`);
  } else {
    currentResult = updatedData.properties;
    currentPageNumber = 1;
    app.showResults("property-list", app.paginateResult(currentResult));
  }
}, 100);

// Show filter-container if user clicked on the sitemap link for filter options
if (location.hash === "#filters") {
  app.formAnimate("filter-container", "open");
}

// Price slider jQuery UI
$(function () {
  $("#price-slider").slider({
    range: true,
    min: 10,
    max: 50000,
    values: [10, 50000],
    slide: function (event, ui) {
      $("#price-amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
    },
  });

  $("#price-amount").val(
    "$" +
      $("#price-slider").slider("values", 0) +
      " - $" +
      $("#price-slider").slider("values", 1)
  );
});

// Show and hide filter options form
$("#filters").on("click", () => app.formAnimate("filter-container", "open"));

$("#close-filter").on("click", () =>
  app.formAnimate("filter-container", "close")
);

// Filter options logic
const filterForm = $("#filter-container");
filterForm.on("submit", (e) => {
  e.preventDefault();
  const price = $("#price-slider").slider("values");
  const data = new FormData(e.target);
  const filter = {
    price: {
      min: price[0],
      max: price[1],
    },
    rooms: {
      bedrooms: parseInt(data.get("bedrooms")),
      bathrooms: parseInt(data.get("bathrooms")),
    },
    propertyTypes: {
      lotOnly: !!data.get("type-lot-only"),
      house: !!data.get("type-house"),
      apartment: !!data.get("type-apartment"),
      condo: !!data.get("type-condo"),
    },
    listingTypes: {
      forSale: !!data.get("for-sale"),
      forRent: !!data.get("for-rent"),
    },
    availability: data.get("availability"),
  };

  currentResult = app.filterProperties(filter);
  currentPageNumber = 1;
  app.showResults("property-list", app.paginateResult(currentResult));
  app.formAnimate("filter-container", "close");
});

// Filter reset logic
filterForm.on("reset", (e) => {
  setTimeout(() => {
    $("#price-slider").slider({ values: [10, 50000] });

    $("#price-amount").val(
      "$" +
        $("#price-slider").slider("values", 0) +
        " - $" +
        $("#price-slider").slider("values", 1)
    );

    const price = $("#price-slider").slider("values");
    const data = new FormData(e.target);
    const filter = {
      price: {
        min: price[0],
        max: price[1],
      },
      rooms: {
        bedrooms: parseInt(data.get("bedrooms")),
        bathrooms: parseInt(data.get("bathrooms")),
      },
      propertyTypes: {
        lotOnly: !!data.get("type-lot-only"),
        house: !!data.get("type-house"),
        apartment: !!data.get("type-apartment"),
        condo: !!data.get("type-condo"),
      },
      listingTypes: {
        forSale: !!data.get("for-sale"),
        forRent: !!data.get("for-rent"),
      },
      availability: data.get("availability"),
    };

    currentResult = app.filterProperties(filter);
    currentPageNumber = 1;
    app.showResults("property-list", app.paginateResult(currentResult));
    app.formAnimate("filter-container", "close");
  });
});

// Search Logic
$("#search").on("input", (e) => {
  currentResult = app.searchProperties(e.target.value, updatedData.properties);
  currentPageNumber = 1;
  app.showResults("property-list", app.paginateResult(currentResult));
});

// Pagination Logic
$("#property-list").on("click", "button.page:not(.disabled)", (e) => {
  const closest = e.target.closest("button.page");

  currentPageNumber = parseInt($(closest).attr("data-page"));
  app.showResults(
    "property-list",
    app.paginateResult(currentResult),
    currentPageNumber
  );
});

// Save button logic
$("#property-list").on("click", "a.property-save", (e) => {
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

// Property view logic
$("#property-list").on(
  "click",
  "button.property-view, button.property-appointment:not(.disabled)",
  (e) => {
    const element = $(
      e.target.closest(
        "button.property-view, button.property-appointment:not(.disabled)"
      )
    );
    const propertyID = element.attr("data-property-id");

    if (element.attr("class").includes("property-appointment")) {
      return app.redirect(`/property.html?q=${propertyID}#appointment`);
    } else {
      return app.redirect(`/property.html?q=${propertyID}`);
    }
  }
);
