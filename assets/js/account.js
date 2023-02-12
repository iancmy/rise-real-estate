import updatedData from "./modules/initialize.js";
import app from "./modules/app.js";

let currentPageNumber = 1;
let currentResult;

setTimeout(() => {
  // Initialize accounts
  currentResult = app.showAccount("account-container");
  const userLoggedIn = app.getStorage("login");

  if (!userLoggedIn.isAdmin) {
    $("#user-details-container").tabs().removeClass("ui-widget");

    // Initialize user properties list
    app.showUserPropertiesList(
      "properties-list-container",
      app.paginateResult(currentResult.userPropertiesList, 10)
    );

    // Initialize user saved properties
    app.showResults(
      "properties-saved-container",
      app.paginateResult(currentResult.userPropertiesSaved),
      currentPageNumber
    );

    // Pagination Logic for Properties Saved
    $("#properties-saved-container").on(
      "click",
      "button.page:not(.disabled)",
      (e) => {
        const closest = e.target.closest("button.page");

        currentPageNumber = parseInt($(closest).attr("data-page"));
        app.showResults(
          "properties-saved-container",
          app.paginateResult(currentResult.userPropertiesSaved),
          currentPageNumber
        );
      }
    );

    $("main").on("click", "#list-new-property", (e) => {
      app.formCreate();
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const form = e.target;

        const newProperty = app.validateProperty(
          form["property-name"],
          form["location"],
          form["description"],
          form["price"],
          form["bedrooms"],
          form["bathrooms"],
          data.get("property-type"),
          data.get("listing-type")
        );

        if (newProperty) {
          const user = updatedData.users.find(
            (user) => user.id === userLoggedIn.id
          );
          updatedData.properties.push(newProperty);
          user.listProperty(newProperty.propertyID, "listed");
          app.updateStorage(updatedData.properties, "properties");
          app.updateStorage(updatedData.users, "users");

          currentResult = app.showAccount();
          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.userPropertiesList, 10)
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".edit-property", (e) => {
      e.preventDefault();

      const propertyID = $(e.target).attr("data-property-id");

      app.formCreate(propertyID, "editProperty");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();

        const data = new FormData(e.target);
        const form = e.target;

        const updatedProperty = app.validateProperty(
          form["property-name"],
          form["location"],
          form["description"],
          form["price"],
          form["bedrooms"],
          form["bathrooms"],
          data.get("property-type"),
          data.get("listing-type"),
          propertyID,
          "edit"
        );

        if (updatedProperty) {
          updatedData.properties.splice(
            [updatedProperty.propertyIndex],
            1,
            updatedProperty.property
          );

          app.updateStorage(updatedData.properties, "properties");

          currentResult = app.showAccount();
          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.userPropertiesList, 10)
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".delete-property", (e) => {
      e.preventDefault();

      const propertyID = $(e.target).attr("data-property-id");

      app.formCreate(propertyID, "deleteProperty");
      app.formAnimate("property-form", "open");

      $("#property-form").one("submit", (e) => {
        e.preventDefault();

        const propertyIndex = updatedData.properties.findIndex(
          (property) => property.propertyID === propertyID
        );

        if (propertyIndex) {
          const user = updatedData.users.find(
            (user) => user.id === userLoggedIn.id
          );

          updatedData.properties.splice([propertyIndex], 1);
          user.removeListedProperty(propertyID);

          app.updateStorage(updatedData.properties, "properties");
          app.updateStorage(updatedData.users, "users");

          currentResult = app.showAccount();
          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.userPropertiesList, 10)
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });
  } else {
    $("#admin-details-container").tabs().removeClass("ui-widget");
    currentResult = updatedData;

    // Initialize users list
    app.showUsers(
      "users-list-container",
      app.paginateResult(currentResult.users, 10),
      currentPageNumber
    );

    // Pagination Logic for Users List
    $("#users-list-container").on(
      "click",
      "button.page:not(.disabled)",
      (e) => {
        const closest = e.target.closest("button.page");

        currentPageNumber = parseInt($(closest).attr("data-page"));
        app.showUsers(
          "users-list-container",
          app.paginateResult(currentResult.users, 10),
          currentPageNumber
        );
      }
    );

    // Initialize properties list
    app.showUserPropertiesList(
      "properties-list-container",
      app.paginateResult(currentResult.properties, 10),
      currentPageNumber
    );

    // Pagination Logic for Properties List
    $("#properties-list-container").on(
      "click",
      "button.page:not(.disabled)",
      (e) => {
        const closest = e.target.closest("button.page");

        currentPageNumber = parseInt($(closest).attr("data-page"));
        app.showUserPropertiesList(
          "properties-list-container",
          app.paginateResult(currentResult.properties, 10),
          currentPageNumber
        );
      }
    );

    // Initialize leads
    app.showLeads(
      "leads-container",
      app.paginateResult(
        [
          ...currentResult.leads,
          ...currentResult.appointments,
          ...currentResult.inquiries,
        ],
        10
      ),
      currentPageNumber
    );

    // Pagination Logic for Leads List
    $("#leads-container").on("click", "button.page:not(.disabled)", (e) => {
      const closest = e.target.closest("button.page");

      currentPageNumber = parseInt($(closest).attr("data-page"));
      app.showUserPropertiesList(
        "leads-container",
        app.paginateResult(
          [
            ...currentResult.leads,
            ...currentResult.appointments,
            ...currentResult.inquiries,
          ],
          10
        ),
        currentPageNumber
      );
    });

    // Event listeners for CRUD buttons

    $("main").on("click", "#new-user", (e) => {
      e.preventDefault();
      app.formCreate("", "newUser");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const form = e.target;

        const newUser = app.validateNewUser(
          form["first-name"],
          form["last-name"],
          form["email"],
          form["create-password"],
          form["confirm-password"],
          data.get("user-type")
        );

        if (newUser) {
          updatedData.users.push(newUser);
          app.updateStorage(updatedData.users, "users");

          app.showUsers(
            "users-list-container",
            app.paginateResult(currentResult.users, 10),
            currentPageNumber
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".edit-user", (e) => {
      e.preventDefault();
      const id = $(e.target).attr("data-user-id");

      app.formCreate(id, "editUser");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const form = e.target;

        const users = updatedData.users;
        const user = users.find((user) => user.id === id);

        const updatedUser = app.validateNewUser(
          form["first-name"],
          form["last-name"],
          form["email"],
          form["create-password"],
          form["confirm-password"],
          data.get("user-type"),
          "edit",
          id,
          user.propertiesList,
          user.propertiesSaved
        );

        if (updatedUser) {
          const userIndex = users.findIndex((user) => user.id === id);

          users.splice([userIndex], 1, updatedUser);
          app.updateStorage(users, "users");

          app.showUsers(
            "users-list-container",
            app.paginateResult(currentResult.users, 10),
            currentPageNumber
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".delete-user", (e) => {
      e.preventDefault();
      const id = $(e.target).attr("data-user-id");
      const users = updatedData.users;
      const appointments = updatedData.appointments;
      const properties = updatedData.properties;
      const inquiries = updatedData.inquiries;

      app.formCreate(id, "deleteUser");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();

        const user = users.find((user) => user.id === id);
        const userProperties = user.propertiesList.filter(
          (property) => property.type === "listed"
        );

        const userIndex = users.findIndex((user) => user.id === id);
        const newAppointments = appointments.filter(
          (appointment) => appointment.userID !== id
        );
        const newInquiries = inquiries.filter(
          (inquiry) => inquiry.userID !== id
        );

        app.updateStorage(newInquiries, "inquiries");
        app.updateStorage(newAppointments, "appointments");

        users.splice([userIndex], 1);
        app.updateStorage(users, "users");

        userProperties.forEach((userProperty) => {
          const propertyIndex = properties.findIndex(
            (property) => property.propertyID === userProperty.propertyID
          );

          properties.splice([propertyIndex], 1);
          app.updateStorage(properties, "properties");
        });

        app.showUserPropertiesList(
          "properties-list-container",
          app.paginateResult(updatedData.properties),
          currentPageNumber
        );

        app.showLeads(
          "leads-container",
          app.paginateResult(
            [
              ...updatedData.leads,
              ...updatedData.appointments,
              ...updatedData.inquiries,
            ],
            10
          ),
          currentPageNumber
        );

        app.showUsers(
          "users-list-container",
          app.paginateResult(currentResult.users, 10),
          currentPageNumber
        );
        return app.formAnimate("property-form", "close", true);
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", "#list-new-property", (e) => {
      app.formCreate();
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const form = e.target;

        const newProperty = app.validateProperty(
          form["property-name"],
          form["location"],
          form["description"],
          form["price"],
          form["bedrooms"],
          form["bathrooms"],
          data.get("property-type"),
          data.get("listing-type")
        );

        if (newProperty) {
          const user = updatedData.users.find(
            (user) => user.id === userLoggedIn.id
          );
          updatedData.properties.push(newProperty);
          user.listProperty(newProperty.propertyID, "listed");
          app.updateStorage(updatedData.properties, "properties");
          app.updateStorage(updatedData.users, "users");

          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.properties),
            currentPageNumber
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".edit-property", (e) => {
      e.preventDefault();

      const propertyID = $(e.target).attr("data-property-id");

      app.formCreate(propertyID, "editProperty");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();

        const data = new FormData(e.target);
        const form = e.target;

        const updatedProperty = app.validateProperty(
          form["property-name"],
          form["location"],
          form["description"],
          form["price"],
          form["bedrooms"],
          form["bathrooms"],
          data.get("property-type"),
          data.get("listing-type"),
          propertyID,
          "edit"
        );

        if (updatedProperty) {
          updatedData.properties.splice(
            [updatedProperty.propertyIndex],
            1,
            updatedProperty.property
          );

          app.updateStorage(updatedData.properties, "properties");

          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.properties, 10),
            currentPageNumber
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".delete-property", (e) => {
      e.preventDefault();

      const propertyID = $(e.target).attr("data-property-id");

      app.formCreate(propertyID, "deleteProperty");
      app.formAnimate("property-form", "open");

      $("#property-form").one("submit", (e) => {
        e.preventDefault();

        const propertyIndex = updatedData.properties.findIndex(
          (property) => property.propertyID === propertyID
        );

        if (propertyIndex) {
          const user = updatedData.users.find(
            (user) => user.id === userLoggedIn.id
          );

          updatedData.properties.splice([propertyIndex], 1);
          user.removeListedProperty(propertyID);

          app.updateStorage(updatedData.properties, "properties");
          app.updateStorage(updatedData.users, "users");

          app.showUserPropertiesList(
            "properties-list-container",
            app.paginateResult(currentResult.properties, 10),
            currentPageNumber
          );
          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".view-item.message-item", (e) => {
      e.preventDefault();

      const id = $(e.target).attr("data-id");

      app.formCreate(id, "viewMessage");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();
        app.formAnimate("property-form", "close", true);
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });

    $("main").on("click", ".delete-item", (e) => {
      e.preventDefault();

      const leads = updatedData.leads;
      const appointments = updatedData.appointments;
      const inquiries = updatedData.inquiries;
      const properties = updatedData.properties;
      const id = $(e.target).attr("data-id");
      const type =
        id.slice(0, 1) === "L"
          ? "newsletter-signup"
          : id.slice(0, 1) === "A"
          ? "appointment"
          : "inquiry";

      app.formCreate(id, "deleteLead");
      app.formAnimate("property-form", "open");

      $("#property-form").on("submit", (e) => {
        e.preventDefault();

        let leadIndex;
        if (leads.findIndex((lead) => lead.id === id) !== -1) {
          leadIndex = leads.findIndex((lead) => lead.id === id);
        }

        if (
          appointments.findIndex(
            (appointment) => appointment.appointmentID === id
          ) !== -1
        ) {
          leadIndex = appointments.findIndex(
            (appointment) => appointment.appointmentID === id
          );
        }

        if (inquiries.findIndex((inquiry) => inquiry.inquiryID === id) !== -1) {
          leadIndex = inquiries.findIndex(
            (inquiry) => inquiry.inquiryID === id
          );
        }

        if (leadIndex >= 0) {
          switch (type) {
            case "newsletter-signup":
              leads.splice([leadIndex], 1);
              app.updateStorage(leads, "leads");
              break;
            case "inquiry":
              inquiries.splice([leadIndex], 1);
              app.updateStorage(inquiries, "inquiries");
              break;
            case "appointment":
              const property = properties.find((property) =>
                property.appointments.find((appointment) => appointment === id)
              );
              appointments.splice([leadIndex], 1);
              property.appointments.splice(
                property.appointments.findIndex(
                  (appointment) => appointment === id
                ),
                1
              );
              app.updateStorage(appointments, "appointments");
              app.updateStorage(properties, "properties");
              break;
          }

          app.showLeads(
            "leads-container",
            app.paginateResult(
              [
                ...updatedData.leads,
                ...updatedData.appointments,
                ...updatedData.inquiries,
              ],
              10
            ),
            currentPageNumber
          );

          return app.formAnimate("property-form", "close", true);
        }
      });

      $(".close-form").one("click", (e) => {
        app.formAnimate("property-form", "close", true);
      });
    });
  }
}, 100);

// Save button logic
$("#account-container").on("click", "a.property-save", (e) => {
  e.preventDefault();

  const userID = app.getStorage("login").id;
  const user = updatedData.users.find((user) => user.id === userID);
  const saveBtn = $(e.target.closest("a.property-save"));
  const propertyID = saveBtn.attr("data-property-id");

  // Update user saved properties
  if (saveBtn.attr("data-saved")) {
    user.removeSavedProperty(propertyID);
  } else {
    user.saveProperty(propertyID);
  }

  currentResult = user.propertiesSaved.map((id) => {
    return updatedData.properties.find(
      (property) => property.propertyID === id
    );
  });

  // Update local storage
  app.updateStorage(updatedData.users, "users");
  app.showResults(
    "properties-saved-container",
    app.paginateResult(currentResult),
    currentPageNumber
  );
});

// Property view logic
$("#account-container").on(
  "click",
  "button.property-view, button.property-appointment:not(.disabled)",
  (e) => {
    const element = $(e.target);
    const propertyID = element.attr("data-property-id");

    if (element.attr("class").includes("property-appointment")) {
      return app.redirect(`/property.html?q=${propertyID}#appointment`);
    } else {
      return app.redirect(`/property.html?q=${propertyID}`);
    }
  }
);
