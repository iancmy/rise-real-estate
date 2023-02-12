import propertiesDefault from "../../json/properties.json" assert { type: "json" };
import usersDefault from "../../json/users.json" assert { type: "json" };
import User from "../classes/Users.js";
import Property from "../classes/Properties.js";
import Lead from "../classes/Leads.js";
import Inquiry from "../classes/Inquiries.js";
import Appointment from "../classes/Appointments.js";

export default {
  emailRegex:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  warningElement: $("<label class='warning'></label>"),

  createWarning(warningID, message, insertAfter) {
    if ($(`#${warningID}`).length) {
      $(`#${warningID}`).remove();
    }

    return this.warningElement
      .text(message)
      .attr("id", warningID)
      .insertAfter($(insertAfter))
      .on("animationend", (e) => {
        e.target.remove();
      });
  },

  initialize() {
    const loginLink = $(".login");
    const signupLink = $(".signup");
    const accountLinkText = $(".account > a.link");
    const viewAccountLink = $(".view-account > a");
    const signoutLink = $("#signout");

    // check if logged-in
    if (this.getStorage("login")) {
      loginLink.hide();
      signupLink.hide();
      viewAccountLink.show();
      signoutLink.show();

      // check if admin
      if (this.getStorage("login").isAdmin) {
        accountLinkText.html(
          '<i class="fa-solid fa-user"></i>&nbsp;&nbsp;&nbsp;Admin&nbsp;&nbsp;<i class="fa-solid fa-caret-down"></i>'
        );
        viewAccountLink.text("Admin Dashboard");
      }
    }

    // redirect if user is logged in
    if (this.getStorage("login")) {
      const path = `${location.pathname}${location.search}${location.hash}`;
      switch (path) {
        case "/sign-up.html":
        case "/log-in.html":
          this.redirect("/account.html");
          break;
        case "/log-in.html?redirect=back":
          window.history.back();
          break;
      }
    } else {
      // redirect if user is not logged in yet
      const path = `${location.pathname}`;
      if (path === "/account.html") {
        this.redirect("/log-in.html");
      }
    }

    // signout button logic
    signoutLink.on("click", (e) => {
      localStorage.removeItem("login");
      location.pathname = "/log-in.html";
    });

    // Initialize local storage
    if (!localStorage.leads) localStorage.leads = "[]";
    if (!localStorage.appointments) {
      localStorage.appointments = "[]";
    }
    if (!localStorage.inquiries) localStorage.inquiries = "[]";
    if (!localStorage.users) {
      localStorage.users = JSON.stringify(usersDefault);
    }
    if (!localStorage.properties) {
      localStorage.properties = JSON.stringify(propertiesDefault);
    }

    // Initialize default properties listed by each user
    const properties = this.jsonToClasses("properties");
    const users = this.jsonToClasses("users");
    properties.forEach((property) => {
      const user = users.find((user) => {
        return user.id === property.userID;
      });

      if (
        user.propertiesList.find(
          (userProperty) => property.propertyID === userProperty.propertyID
        )
      ) {
        return;
      }
      user.listProperty(property.propertyID, "listed");
    });

    this.updateStorage(users, "users");
  },

  // convert updated local storage to instances of respective classes
  jsonToClasses(dataType) {
    const updatedData = {
      users: [],
      properties: [],
      leads: [],
      appointments: [],
      inquiries: [],
    };

    const usersJSON = JSON.parse(localStorage.users);
    const propertiesJSON = JSON.parse(localStorage.properties);
    const leadsJSON = JSON.parse(localStorage.leads);
    const appointmentsJSON = JSON.parse(localStorage.appointments);
    const inquiriesJSON = JSON.parse(localStorage.inquiries);

    updatedData.users.push(
      ...usersJSON.map((user) => {
        return new User(...Object.values(user));
      })
    );

    updatedData.properties.push(
      ...propertiesJSON.map((property) => {
        return new Property(
          property.propertyName,
          property.description,
          property.location,
          parseInt(property.price),
          {
            bedrooms: parseInt(property.rooms.bedrooms),
            bathrooms: parseInt(property.rooms.bathrooms),
          },
          property.tags,
          property.ownerName,
          property.userID,
          property.appointments,
          property.images,
          property.propertyID,
          property.dateCreated
        );
      })
    );

    updatedData.leads.push(
      ...leadsJSON.map((lead) => {
        return new Lead(...Object.values(lead));
      })
    );

    updatedData.appointments.push(
      ...appointmentsJSON.map((appointment) => {
        return new Appointment(...Object.values(appointment));
      })
    );

    updatedData.inquiries.push(
      ...inquiriesJSON.map((inquiry) => {
        return new Inquiry(...Object.values(inquiry));
      })
    );

    switch (dataType) {
      case "users":
        return updatedData.users;
      case "properties":
        return updatedData.properties;
      case "leads":
        return updatedData.leads;
      case "appointments":
        return updatedData.appointments;
      case "inquiries":
        return updatedData.inquiries;
      default:
        return updatedData;
    }
  },

  // change link color of current page link
  // TODO: Fix me

  getActiveLink() {
    const currentPage = location.pathname;

    $(".link > a:not(:has(img))").each(function () {
      const $this = $(this);

      if ($this.attr("href").includes(currentPage)) {
        $this.addClass("active-link");
      }
    });
  },

  getStorage(storageKey) {
    return JSON.parse(localStorage.getItem(storageKey));
  },

  updateStorage(updatedArray, storageKey) {
    return localStorage.setItem(storageKey, JSON.stringify(updatedArray));
  },

  validateLead(email) {
    const emailValue = email.value;
    const leads = this.getStorage("leads");

    if (!this.emailRegex.test(emailValue)) {
      this.createWarning(
        "invalid-email",
        "Please enter a valid email address.",
        "#newsletter form > div"
      );
    } else {
      if (leads.find((lead) => lead.email === emailValue)) {
        this.createWarning(
          "subscribed",
          "Email already subscribed!",
          "#newsletter form > div"
        );
      } else return new Lead(emailValue);
    }
  },

  validateAppointment(
    name,
    email,
    contactNumber,
    dateAndTime,
    userID,
    propertyID
  ) {
    const users = this.jsonToClasses("users");
    const user = userID ? users.find((user) => user.id === userID) : "";
    const nameValue = name?.value ?? user.getFullName();
    const emailValue = email?.value ?? user.email;
    const contactValue = contactNumber.a.value;
    const dateAndTimeValue = new Date(dateAndTime.value);

    if (!nameValue) {
      this.createWarning("no-name", "Please enter your name.", "#sched-name");
    } else if (!this.emailRegex.test(emailValue)) {
      this.createWarning(
        "invalid-email",
        "Please enter a valid email address.",
        "#sched-email"
      );
    } else if (!contactNumber.isValidNumber()) {
      this.createWarning(
        "invalid-number",
        "Please enter a valid number. Make sure to select the correct country!",
        "#appointment div.iti--allow-dropdown"
      );
    } else if (dateAndTimeValue.toString() === "Invalid Date") {
      this.createWarning(
        "no-date",
        "Please enter an appointment date.",
        "#sched-date"
      );
    } else if (userID) {
      const property = user.propertiesList.find(
        (property) => property.propertyID === propertyID
      );

      if (property) {
        if (property.type === "appointment") {
          this.createWarning(
            "appointment-already-set",
            "You already have an appointment for this property!",
            "#sched-date"
          );
        } else if (property.type === "listed") {
          this.createWarning(
            "owned-property",
            "You cannot set an appointment for your own property!",
            "#sched-date"
          );
        }
      } else {
        const dateISOString = new Date(
          dateAndTimeValue.getTime() -
            dateAndTimeValue.getTimezoneOffset() * 60000
        ).toISOString();

        return new Appointment(
          nameValue,
          emailValue,
          contactValue,
          dateISOString,
          userID
        );
      }
    } else {
      const dateISOString = new Date(
        dateAndTimeValue.getTime() -
          dateAndTimeValue.getTimezoneOffset() * 60000
      ).toISOString();

      return new Appointment(
        nameValue,
        emailValue,
        contactValue,
        dateISOString
      );
    }
  },

  validateInquiry(firstName, lastName, email, subject, message, user) {
    const firstNameValue = firstName?.value ?? user.firstName;
    const lastNameValue = lastName?.value ?? user.lastName;
    const emailValue = email?.value ?? user.email;
    const subjectValue = subject.value;
    const messageValue = message.value;

    if (!firstNameValue || !lastNameValue) {
      this.createWarning(
        "no-name",
        "Please provide your first name and last name.",
        "#last-name"
      );
    } else if (!this.emailRegex.test(emailValue)) {
      this.createWarning(
        "invalid-email",
        "Please enter a valid email address.",
        "#email"
      );
    } else if (subjectValue === "no-subject") {
      this.createWarning(
        "no-concern",
        "Please select what is your concern.",
        "#subject"
      );
    } else if (!messageValue) {
      this.createWarning(
        "no-message",
        "Please enter the details of your concern.",
        "#message"
      );
    } else {
      if (user) {
        return new Inquiry(
          firstNameValue,
          lastNameValue,
          emailValue,
          subjectValue,
          messageValue,
          user.id
        );
      } else {
        return new Inquiry(
          firstNameValue,
          lastNameValue,
          emailValue,
          subjectValue,
          messageValue
        );
      }
    }
  },

  validateLogin(email, password) {
    const users = this.jsonToClasses("users");
    const emailValue = email.value;
    const passwordValue = password.value;

    if (!this.emailRegex.test(emailValue)) {
      this.createWarning(
        "invalid-email",
        "Please enter a valid email address.",
        "#email"
      );
    } else if (!passwordValue) {
      this.createWarning(
        "no-password",
        "Please enter your password.",
        "#password"
      );
    } else {
      const user = users.find((user) => user.email === emailValue);
      if (user) {
        if (user.password !== passwordValue) {
          this.createWarning("wrong-pw", "Incorrect password!", "#password");
        } else {
          return user;
        }
      } else {
        this.createWarning(
          "user-not-found",
          "User does not exist! Sign up by clicking the link below!",
          "#password"
        );
      }
    }
  },

  validateSignup(firstName, lastName, email, password, confirmPassword) {
    const users = this.jsonToClasses("users");
    const firstNameValue = firstName.value;
    const lastNameValue = lastName.value;
    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    if (!firstNameValue || !lastNameValue) {
      this.createWarning(
        "no-name",
        "Please provide your first name and last name.",
        "#last-name"
      );
    } else if (!this.emailRegex.test(emailValue)) {
      this.createWarning(
        "invalid-email",
        "Please enter a valid email address.",
        "#email"
      );
    } else if (!passwordValue) {
      this.createWarning(
        "no-password",
        "Please enter a password.",
        "#create-password"
      );
    } else if (passwordValue !== confirmPasswordValue) {
      this.createWarning(
        "pw-diff",
        "Please make sure your password is the same!",
        "#confirm-password"
      );
    } else {
      if (users.find((user) => user.email === emailValue)) {
        this.createWarning(
          "user-exists",
          "User already exist! Log in instead using the link below.",
          "#confirm-password"
        );
      } else {
        return new User(
          firstNameValue,
          lastNameValue,
          emailValue,
          passwordValue
        );
      }
    }
  },

  validateNewUser(
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    userType = "user",
    action = "new",
    id,
    propertiesList,
    propertiesSaved
  ) {
    const users = this.jsonToClasses("users");
    const firstNameValue = firstName.value;
    const lastNameValue = lastName.value;
    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;
    const isAdmin = userType === "admin";

    if (action === "new") {
      if (!firstNameValue || !lastNameValue) {
        this.createWarning(
          "no-name",
          "Please provide your first name and last name.",
          ".submit-form"
        );
      } else if (!this.emailRegex.test(emailValue)) {
        this.createWarning(
          "invalid-email",
          "Please enter a valid email address.",
          ".submit-form"
        );
      } else if (!passwordValue) {
        this.createWarning(
          "no-password",
          "Please enter a password.",
          ".submit-form"
        );
      } else if (passwordValue !== confirmPasswordValue) {
        this.createWarning(
          "pw-diff",
          "Please make sure your password is the same!",
          ".submit-form"
        );
      } else {
        if (users.find((user) => user.email === emailValue)) {
          this.createWarning(
            "user-exists",
            "User already exist! Log in instead using the link below.",
            ".submit-form"
          );
        } else {
          console.log(id);
          return new User(
            firstNameValue,
            lastNameValue,
            emailValue,
            passwordValue,
            isAdmin
          );
        }
      }
    } else if (action === "edit") {
      if (!firstNameValue || !lastNameValue) {
        this.createWarning(
          "no-name",
          "Please provide your first name and last name.",
          ".submit-form"
        );
      } else if (!this.emailRegex.test(emailValue)) {
        this.createWarning(
          "invalid-email",
          "Please enter a valid email address.",
          ".submit-form"
        );
      } else if (!passwordValue) {
        this.createWarning(
          "no-password",
          "Please enter a password.",
          ".submit-form"
        );
      } else if (passwordValue !== confirmPasswordValue) {
        this.createWarning(
          "pw-diff",
          "Please make sure your password is the same!",
          ".submit-form"
        );
      } else {
        return new User(
          firstNameValue,
          lastNameValue,
          emailValue,
          passwordValue,
          isAdmin,
          propertiesList,
          propertiesSaved,
          id
        );
      }
    }
  },

  validateProperty(
    propertyName,
    location,
    description,
    price,
    bedrooms,
    bathrooms,
    propertyType,
    listingType,
    propertyID,
    action = "new"
  ) {
    const propertyNameValue = propertyName.value;
    const locationValue = location.value;
    const descriptionValue = description.value;
    const priceValue = price.value;
    const bedroomsValue = bedrooms.value;
    const bathroomsValue = bathrooms.value;
    const propertyTypeValue = propertyType?.slice(5);
    const listingTypeValue = listingType?.slice(4);

    if (!propertyNameValue) {
      this.createWarning(
        "invalid",
        "Please enter a property name.",
        ".submit-form"
      );
    } else if (!locationValue) {
      this.createWarning(
        "invalid",
        "Please enter the location of your property.",
        ".submit-form"
      );
    } else if (!descriptionValue) {
      this.createWarning(
        "invalid",
        "Please enter a description.",
        ".submit-form"
      );
    } else if (!priceValue) {
      this.createWarning(
        "invalid",
        "Please provide a price for your property.",
        ".submit-form"
      );
    } else if (priceValue > 50000 || priceValue < 10) {
      this.createWarning(
        "invalid",
        "Please provide a valid price (from $10 to $50000).",
        ".submit-form"
      );
    } else if (!bedroomsValue) {
      this.createWarning(
        "invalid",
        "Please enter the number of bedrooms.",
        ".submit-form"
      );
    } else if (!bathroomsValue) {
      this.createWarning(
        "invalid",
        "Please enter the number of bathrooms.",
        ".submit-form"
      );
    } else if (!propertyTypeValue) {
      this.createWarning(
        "invalid",
        "Please select a property type.",
        ".submit-form"
      );
    } else if (!listingTypeValue) {
      this.createWarning(
        "invalid",
        "Please select a listing type.",
        ".submit-form"
      );
    } else {
      const locationArray = locationValue.split(",");
      const locationObject = {
        buildingNumber: locationArray[0]?.trim(),
        street: locationArray[1]?.trim(),
        city: locationArray[2]?.trim(),
        state: locationArray[3]?.trim(),
        zipCode: locationArray[4]?.trim(),
        country: locationArray[5]?.trim(),
      };

      if (action === "new") {
        return new Property(
          propertyNameValue,
          descriptionValue,
          locationObject,
          parseInt(priceValue),
          {
            bedrooms: parseInt(bedroomsValue),
            bathrooms: parseInt(bathroomsValue),
          },
          {
            propertyType: propertyTypeValue,
            listingType: listingTypeValue,
            isAvailable: true,
          },
          this.jsonToClasses("users")
            .find((user) => user.id === this.getStorage("login").id)
            .getFullName(),
          this.getStorage("login").id
        );
      } else if (action === "edit") {
        const property = this.jsonToClasses("properties").find(
          (property) => property.propertyID === propertyID
        );

        const propertyIndex = this.jsonToClasses("properties").findIndex(
          (property) => property.propertyID === propertyID
        );

        property.propertyName = propertyNameValue;
        property.description = descriptionValue;
        property.location = locationObject;
        property.price = parseInt(priceValue);
        property.rooms = {
          bedrooms: parseInt(bedroomsValue),
          bathrooms: parseInt(bathroomsValue),
        };
        property.tags.propertyType = propertyTypeValue;
        property.tags.listingType = listingTypeValue;

        return { propertyIndex, property };
      }
    }
  },

  login(
    user,
    redirectURL = `${location.pathname}${location.search}${location.hash}`
  ) {
    this.updateStorage(user, "login");
    location.replace(redirectURL);
  },

  redirect(url) {
    return location.replace(url);
  },

  formAnimate(formID, animation, destroy = false) {
    return animation === "open"
      ? $(`#${formID}`)
          .css({
            display: "flex",
          })
          .removeClass("hide-form")
          .addClass("show-form")
      : animation === "close"
      ? !destroy
        ? $(`#${formID}`)
            .removeClass("show-form")
            .addClass("hide-form")
            .on("animationend", (e) => {
              $(e.target).css({ display: "none" }).off("animationend");
            })
        : $(`#${formID}`)
            .removeClass("show-form")
            .addClass("hide-form")
            .on("animationend", (e) => {
              $(e.target).remove();
            })
      : console.log(`There is no animation named ${animation}!`);
  },

  formCreate(id, action = "newProperty") {
    if (action === "newProperty") {
      return $("main").append(`
      <form class="account-forms" id="property-form" novalidate>
        <header>
          <h2>List new property</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div>
          <fieldset>
            <label for="property-name">Property name</label>
            <input
              type="text"
              name="property-name"
              id="property-name"
              placeholder="Property name"
            />
            <label for="location">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              placeholder="Building number, Street, City, State, Zip Code, Country"
            />
            <label for="description">Property description</label>
            <textarea
              name="description"
              id="description"
              cols="30"
              rows="10"
              placeholder="Property description"
            ></textarea>
            <label for="price">Price</label>
            <input
              type="number"
              name="price"
              id="price"
              placeholder="Price"
              min="0"
              max="50000"
            />
            <label for="bedrooms">Number of bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              id="bedrooms"
              placeholder="Bedrooms"
            />
            <label for="bathrooms">Number of bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              id="bathrooms"
              placeholder="Bathrooms"
            />
          </fieldset>
          <label>Property Type</label>
          <fieldset>
            <div>
              <input class="account-form-button" type="radio"
              name="property-type"only" id="type-lot-only" value="type-lot-only"
              />
              <label class="account-form-button-label" for="type-lot-only"
                >Lot Only</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-house"
                value="type-house"
              />
              <label class="account-form-button-label" for="type-house"
                >House</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-apartment"
                value="type-apartment"
              />
              <label class="account-form-button-label" for="type-apartment"
                >Apartment Unit</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-condo"
                value="type-condo"
              />
              <label class="account-form-button-label" for="type-condo"
                >Condo Unit</label
              >
            </div>
          </fieldset>
          <label>Listing Type</label>
          <fieldset>
            <div>
              <input
                class="account-form-button"
                type="radio"
                name="listing-type"
                id="for-sale"
                value="for-sale"
              />
              <label class="account-form-button-label" for="for-sale"
                >For Sale</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="listing-type"
                id="for-rent"
                value="for-rent"
              />
              <label class="account-form-button-label" for="for-rent"
                >For Rent</label
              >
            </div>
          </fieldset>
        </div>
        <button type="submit" class="button primary submit-form">
          Add
        </button>
      </form>
    `);
    } else if (action === "editProperty") {
      const properties = this.jsonToClasses("properties");
      const property = properties.find(
        (property) => property.propertyID === id
      );

      return $("main").append(`
      <form class="account-forms" id="property-form" novalidate>
        <header>
          <h2>Edit property: ${property.propertyName}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div>
          <fieldset>
            <label for="property-name">Property name</label>
            <input
              type="text"
              name="property-name"
              id="property-name"
              placeholder="Property name"
              value="${property.propertyName}"
            />
            <label for="location">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              placeholder="Building number, Street, City, State, Zip Code, Country"
              value="${property.location.buildingNumber}, ${
        property.location.street
      }, ${property.location.city}, ${property.location.state}, ${
        property.location.zipCode
      }, ${property.location.country}"
            />
            <label for="description">Property description</label>
            <textarea
              name="description"
              id="description"
              cols="30"
              rows="10"
              placeholder="Property description"
            >${property.description}</textarea>
            <label for="price">Price</label>
            <input
              type="number"
              name="price"
              id="price"
              placeholder="Price"
              min="0"
              max="50000"
              value="${property.price}"
            />
            <label for="bedrooms">Number of bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              id="bedrooms"
              placeholder="Bedrooms"
              value="${property.rooms.bedrooms}"
            />
            <label for="bathrooms">Number of bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              id="bathrooms"
              placeholder="Bathrooms"
              value="${property.rooms.bathrooms}"
            />
          </fieldset>
          <label>Property Type</label>
          <fieldset>
            <div>
              <input class="account-form-button" type="radio"
              name="property-type"only" id="type-lot-only" value="type-lot-only"
              ${property.tags.propertyType === "lot-only" ? "checked" : ""}/>
              <label class="account-form-button-label" for="type-lot-only"
                >Lot Only</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-house"
                value="type-house"
                ${property.tags.propertyType === "house" ? "checked" : ""}
              />
              <label class="account-form-button-label" for="type-house"
                >House</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-apartment"
                value="type-apartment"
                ${property.tags.propertyType === "apartment" ? "checked" : ""}
              />
              <label class="account-form-button-label" for="type-apartment"
                >Apartment Unit</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="property-type"
                id="type-condo"
                value="type-condo"
                ${property.tags.propertyType === "condo" ? "checked" : ""}
              />
              <label class="account-form-button-label" for="type-condo"
                >Condo Unit</label
              >
            </div>
          </fieldset>
          <label>Listing Type</label>
          <fieldset>
            <div>
              <input
                class="account-form-button"
                type="radio"
                name="listing-type"
                id="for-sale"
                value="for-sale"
                ${property.tags.listingType === "sale" ? "checked" : ""}
              />
              <label class="account-form-button-label" for="for-sale"
                >For Sale</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="listing-type"
                id="for-rent"
                value="for-rent"
                ${property.tags.listingType === "rent" ? "checked" : ""}
              />
              <label class="account-form-button-label" for="for-rent"
                >For Rent</label
              >
            </div>
          </fieldset>
        </div>
        <button type="submit" class="button primary submit-form" data-property-id="${
          property.propertyID
        }">
          Edit
        </button>
      </form>
      `);
    } else if (action === "deleteProperty") {
      const properties = this.jsonToClasses("properties");
      const property = properties.find(
        (property) => property.propertyID === id
      );

      return $("main").append(`
      <form class="account-forms delete" id="property-form" novalidate>
        <header>
          <h2>Delete property: ${property.propertyName}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <h3>Are you sure you want to delete this property?</h3>
        <button type="submit" class="button primary submit-form delete" data-property-id="${property.propertyID}">
          Delete
        </button>
      </form>
      `);
    } else if (action === "viewMessage") {
      const inquiries = this.jsonToClasses("inquiries");
      const lead = inquiries.find((inquiry) => inquiry.inquiryID === id);

      return $("main").append(`
      <form class="account-forms message" id="property-form" novalidate>
        <header>
          <h2>Message from: ${lead.email}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <h3>Subject: ${
          lead.subject.slice(0, 1).toUpperCase() + lead.subject.slice(1)
        }</h3>
        <p>Message: ${lead.message}</p>
        <button type="submit" class="button primary submit-form" data-id="${id}">
          Done
        </button>
      </form>
      `);
    } else if (action === "deleteLead") {
      const leads = this.jsonToClasses("leads");
      const appointments = this.jsonToClasses("appointments");
      const inquiries = this.jsonToClasses("inquiries");
      const lead =
        leads.find((lead) => lead.id === id) ||
        appointments.find((appointment) => appointment.appointmentID === id) ||
        inquiries.find((inquiry) => inquiry.inquiryID === id);

      return $("main").append(`
      <form class="account-forms delete" id="property-form" novalidate>
        <header>
          <h2>Delete lead from: ${lead.email || lead.userEmail}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <h3>Are you sure you want to delete this lead?</h3>
        <button type="submit" class="button primary submit-form delete" data-id="${id}">
          Delete
        </button>
      </form>
      `);
    } else if (action === "newUser") {
      return $("main").append(`
      <form class="account-forms" id="property-form" novalidate>
        <header>
          <h2>Create New User</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div>
          <fieldset>
            <label for="first-name">First Name</label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              placeholder="First Name"
            />
            <label for="last-name">Last Name</label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              placeholder="Last Name"
            />
            <label for="email">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
            />
            <label for="create-password">Password</label>
            <input
              type="password"
              name="create-password"
              id="create-password"
              placeholder="Password"
            />
            <label for="confirm-password">Confirm Password</label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="Password"
            />
          <fieldset>
            <div>
              <input
                class="account-form-button"
                type="radio"
                name="user-type"
                id="user"
                value="user"
              />
              <label class="account-form-button-label" for="user"
                >User</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="user-type"
                id="admin"
                value="admin"
              />
              <label class="account-form-button-label" for="admin"
                >Admin</label
              >
            </div>
          </fieldset>
        </div>
        <button type="submit" class="button primary submit-form">
          Add
        </button>
      </form>
      `);
    } else if (action === "editUser") {
      const users = this.jsonToClasses("users");
      const user = users.find((user) => user.id === id);

      return $("main").append(`
      <form class="account-forms" id="property-form" novalidate>
        <header>
          <h2>Edit User: ${user.email}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div>
          <fieldset>
            <label for="first-name">First Name</label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              placeholder="First Name"
              value="${user.firstName}"
            />
            <label for="last-name">Last Name</label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              placeholder="Last Name"
              value="${user.lastName}"
            />
            <label for="email">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              value="${user.email}"
            />
            <label for="create-password">Password</label>
            <input
              type="password"
              name="create-password"
              id="create-password"
              placeholder="Password"
              value="${user.password}"
            />
            <label for="confirm-password">Confirm Password</label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="Password"
              value="${user.password}"
            />
          <fieldset>
            <div>
              <input
                class="account-form-button"
                type="radio"
                name="user-type"
                id="user"
                value="user"
                ${!user.isAdmin ? "checked" : ""}
              />
              <label class="account-form-button-label" for="user"
                >User</label
              >
              <input
                class="account-form-button"
                type="radio"
                name="user-type"
                id="admin"
                value="admin"
                ${user.isAdmin ? "checked" : ""}
              />
              <label class="account-form-button-label" for="admin"
                >Admin</label
              >
            </div>
          </fieldset>
        </div>
        <button type="submit" class="button primary submit-form">
          Add
        </button>
      </form>
      `);
    } else if (action === "deleteUser") {
      const users = this.jsonToClasses("users");
      const user = users.find((user) => user.id === id);

      return $("main").append(`
      <form class="account-forms delete" id="property-form" novalidate>
        <header>
          <h2>Delete user: ${user.email}</h2>
          <button type="button" class="button primary close-form">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <h3>Are you sure you want to delete this user?</h3>
        <button type="submit" class="button primary submit-form delete" data-id="${id}">
          Delete
        </button>
      </form>
      `);
    }
  },

  filterProperties(filter) {
    const data = this.jsonToClasses();

    if (!filter) {
      return data;
    }

    // Price filter
    const filteredData = data.properties
      .filter((property) => {
        return (
          property.price >= filter.price.min &&
          property.price <= filter.price.max
        );
      }) // Rooms filter
      .filter((property) => {
        return (
          property.rooms.bedrooms >= filter.rooms.bedrooms &&
          property.rooms.bathrooms >= filter.rooms.bathrooms
        );
      }) // Property type filter
      .filter((property) => {
        switch (property.tags.propertyType) {
          case "lot-only":
            return filter.propertyTypes.lotOnly;
          case "house":
            return filter.propertyTypes.house;
          case "apartment":
            return filter.propertyTypes.apartment;
          case "condo":
            return filter.propertyTypes.condo;
        }
      }) // Listing type filter
      .filter((property) => {
        if (property.tags.listingType === "sale") {
          return filter.listingTypes.forSale;
        } else if (property.tags.listingType === "rent") {
          return filter.listingTypes.forRent;
        }
      }) // Availability filter
      .filter((property) => {
        if (filter.availability === "avail-only") {
          return property.tags.isAvailable;
        }

        return true;
      });

    return filteredData;
  },

  generatePropertiesHTML(propertiesArray = []) {
    const users = this.jsonToClasses("users");
    let userLoggedIn;
    let userSavedProperties;

    if (this.getStorage("login")) {
      userLoggedIn = users.find(
        (user) => user.id === this.getStorage("login").id
      );

      userSavedProperties = userLoggedIn.propertiesSaved;
    }

    return propertiesArray.map((property) => {
      return `
      <div class="property">
      <img class="property-image" src="${
        property.images[Math.floor(Math.random() * 5)]
      }" alt="${property.propertyName} - Image" />
      <div class="property-info">
        <header class="property-header">
          <div class="property-header-left">
            <h2>${property.propertyName}</h2>
            <div class="property-tags">
              <span class="tag ${
                property.tags.isAvailable ? "avail" : "not-avail"
              }">${
        property.tags.isAvailable ? "Available" : "Not Available"
      }</span>
              <span class="tag">${property.titleCase(
                "tags",
                "propertyType"
              )}</span>
              <span class="tag">For ${property.titleCase(
                "tags",
                "listingType"
              )}</span>
            </div>
          </div>
          <div class="property-header-right">
            <a href="#" class="link property-save" data-property-id="${
              property.propertyID
            }" ${
        userLoggedIn
          ? userSavedProperties.includes(property.propertyID)
            ? "data-saved = true"
            : ""
          : ""
      }
              >${
                userLoggedIn
                  ? userSavedProperties.includes(property.propertyID)
                    ? "Saved"
                    : "Save"
                  : "Save"
              }&nbsp;&nbsp;<i class="fa-${
        userLoggedIn
          ? userSavedProperties.includes(property.propertyID)
            ? "solid"
            : "regular"
          : "regular"
      } fa-heart"></i
            ></a>
          </div>
        </header>
        <main class="property-details">
          <div class="property-details-left">
            <p class="property-price">
              <i class="fa-solid fa-dollar-sign"></i>&nbsp;&nbsp;${property.price.toLocaleString(
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </p>
          </div>
          <div class="property-details-right">
            <p class="property-location">
              <i class="fa-solid fa-location-dot"></i>&nbsp;&nbsp;${property.getLocation()}
            </p>
            <p class="property-description">
              ${property.description}
            </p>
          </div>
        </main>
        <footer class="property-footer">
          <div class="property-footer-left">
            <p class="property-owner">
              <i class="fa-solid fa-user"></i>&nbsp;&nbsp;${property.ownerName}
            </p>
          </div>

          <div class="property-footer-right">
            <div class="property-rooms">
              <p class="property-bedrooms">
                <i class="fa-solid fa-bed"></i>&nbsp;&nbsp;${
                  property.rooms.bedrooms
                } ${property.rooms.bedrooms > 1 ? "bedrooms" : "bedroom"}
              </p>
              <p class="property-bathrooms">
                <i class="fa-solid fa-toilet"></i>&nbsp;&nbsp;${
                  property.rooms.bathrooms
                } ${property.rooms.bathrooms > 1 ? "bedrooms" : "bedroom"}
              </p>
            </div>
            <button type="button" class="button property-appointment ${
              property.tags.isAvailable ? "primary" : "disabled"
            }" data-property-id="${property.propertyID}">
              Make an appointment&nbsp;&nbsp;<i
                class="fa-solid fa-angle-right"
              ></i>
            </button>
            <button type="button" class="button primary property-view" data-property-id="${
              property.propertyID
            }">
              View&nbsp;&nbsp;<i
                class="fa-solid fa-angle-right"
              ></i>
            </button>
          </div>
        </footer>
      </div>
    </div>
      `;
    });
  },

  generatePropertiesList(propertiesArray = []) {
    return propertiesArray.map((property) => {
      const users = this.jsonToClasses("users");
      const user = users.find(
        (user) => this.getStorage("login").id === user.id
      );
      const appointments = this.jsonToClasses("appointments");
      const appointment =
        property.status() === "Ongoing Appointments"
          ? appointments
              .filter(
                (appointment) =>
                  property.appointments.indexOf(appointment.appointmentID) !== 1
              )
              ?.find((appointment) => appointment.userID === user.id)
          : null;

      return `
      <div class="property-list-item">
        <p>${new Date(property.dateCreated).toLocaleDateString()}</p>
        <p>${property.propertyName}</p>
        <div class="property-tags">
          <span class="tag">Owned by: ${
            property.ownerName === user.getFullName()
              ? "You"
              : property.ownerName
          }</span>
          <span class="tag">Status: ${property.status()}</span>
          <span class="tag">${property.titleCase("tags", "propertyType")}</span>
          <span class="tag">For ${property.titleCase(
            "tags",
            "listingType"
          )}</span>
          ${
            appointment
              ? `<span class="tag">Your appointment date: ${new Date(
                  appointment.dateTimeISO
                ).toLocaleDateString()}</span>`
              : ""
          }
        </div>
        <a href="./property.html?q=${
          property.propertyID
        }" class="view-property">
          View
        </a>
        <a href="#" class="edit-property ${
          appointment ? "disabled" : ""
        }" data-property-id="${property.propertyID}">
          Edit
        </a>
        <a href="#" class="delete-property" data-property-id="${
          property.propertyID
        }" ${
        appointment ? `data-appointment-id=${appointment.appointmentID}` : ""
      }">
          ${appointment ? "Cancel" : "Delete"}
        </a>
      </div>
      `;
    });
  },

  generateLeadsList(leadsArray = []) {
    return leadsArray.map((lead) => {
      const data = this.jsonToClasses();
      const leads = data.leads;
      const appointments = data.appointments;
      const inquiries = data.inquiries;
      const properties = data.properties;

      const id = lead.id || lead.appointmentID || lead.inquiryID;
      const type =
        id.slice(0, 1) === "L"
          ? "newsletter-signup"
          : id.slice(0, 1) === "A"
          ? "appointment"
          : "inquiry";
      const item =
        leads.find((lead) => lead.id === id) ||
        appointments.find((appointment) => appointment.appointmentID === id) ||
        inquiries.find((inquiry) => inquiry.inquiryID === id);
      const property =
        properties.find((property) =>
          property.appointments.find((appointment) => appointment === id)
        ) || null;

      switch (type) {
        case "newsletter-signup":
          return `
          <div class="lead-list-item">
            <p>${new Date(item.dateCreated).toLocaleDateString()}</p>
            <p>${
              type === "newsletter-signup"
                ? "Newsletter"
                : type === "appointment"
                ? "Appointment"
                : "Inquiry"
            }</p>
            <div class="lead-tags">
              <span class="tag">Email: ${item.email}</span>
              <span class="tag">Subscribed</span>
            </div>
            <a href="#" data-id="${id}" class="view-item disabled">
              Nothing to View
            </a>
            <a href="#" class="delete-item" data-id="${id}">
              Delete
            </a>
          </div>
          `;
        case "inquiry":
          return `
          <div class="lead-list-item">
            <p>${new Date(item.dateCreated).toLocaleDateString()}</p>
            <p>${
              type === "newsletter-signup"
                ? "Newsletter"
                : type === "appointment"
                ? "Appointment"
                : "Inquiry"
            }</p>
            <div class="lead-tags">
              <span class="tag">Name: ${item.firstName} ${item.lastName}</span>
              <span class="tag">Email: ${item.email}</span>
              <span class="tag">Subject: ${
                item.subject.slice(0, 1).toUpperCase() + item.subject.slice(1)
              }</span>
            </div>
            <a href="#" data-id="${id}" class="view-item message-item">
              Message
            </a>
            <a href="#" class="delete-item" data-id="${id}">
              Delete
            </a>
          </div>
          `;
        case "appointment":
          return `
          <div class="lead-list-item">
            <p>${new Date(item.dateCreated).toLocaleDateString()}</p>
            <p>${
              type === "newsletter-signup"
                ? "Newsletter"
                : type === "appointment"
                ? "Appointment"
                : "Inquiry"
            }</p>
            <div class="lead-tags">
              <span class="tag">Name: ${item.userName}</span>
              <span class="tag">Email: ${item.userEmail}</span>
              <span class="tag">Contact: ${item.contactNumber}</span>
              <span class="tag">Appointment Date: ${new Date(
                item.dateTimeISO
              ).toLocaleString()}</span>
            </div>
            <a href="./property.html?q=${
              property.propertyID
            }" data-id="${id}" class="view-item property-item">
              Property
            </a>
            <a href="#" class="delete-item" data-id="${id}">
              Delete
            </a>
          </div>
          `;
      }
    });
  },

  generateUsersList(usersArray = []) {
    return usersArray.map((user) => {
      return `
        <div class="user-list-item">
          <p>${user.id}</p>
          <p>${user.email}</p>
          <div class="user-tags">
            <span class="tag">Full Name: ${user.getFullName()}</span>
            <span class="tag">Password: ${user.password}</span>
            <span class="tag">Admin Privileges: ${user.isAdmin}</span>
          </div>
          <a href="#" data-user-id="${user.id}" class="edit-user">
            Edit
          </a>
          <a href="#" class="delete-user" data-user-id="${user.id}">
            Delete
          </a>
        </div>
        `;
    });
  },

  searchProperties(query, propertiesArray) {
    const searchResult = propertiesArray.filter((property) => {
      return (
        property
          .getLocation()
          .toLowerCase()
          .indexOf(query.trim().toLowerCase()) !== -1
      );
    });

    return searchResult;
  },

  paginateResult(propertiesArray, resultPerPage = 5) {
    const paginatedResult = [];

    for (let i = 0; i < propertiesArray.length; i += resultPerPage) {
      paginatedResult.push(propertiesArray.slice(i, i + resultPerPage));
    }

    return paginatedResult;
  },

  showResults(containerID, paginatedResult, page = 1) {
    if (paginatedResult.length === 0) {
      const href = location.pathname;
      if (href === "/explore.html") {
        return $(`#${containerID}`).html(
          "<h2 class='no-result'>There are no properties in that area yet.&nbsp;&nbsp;<i class='fa-regular fa-face-sad-cry'></i></h2>"
        );
      } else if (href === "/account.html") {
        return $(`#${containerID}`).html(
          "<h2 class='no-result'>You haven't saved any properties yet.&nbsp;&nbsp;</h2><p><a href='./explore.html'>Explore</a> properties!</p>"
        );
      }
    }

    const totalPages = paginatedResult.length;
    const pageResult = this.generatePropertiesHTML(paginatedResult[page - 1]);

    // Create initial pagination for results
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      const html = `<button type="button" class="button page ${
        i === page ? "primary current-page" : ""
      }" data-page="${i}">${i}</button>`;

      const ellipsis = `<span class="ellipsis">...</span>`;

      if (totalPages === 6 && i === 6) {
        pages.push(html);
      } else if (i === page + 5 && i !== totalPages - 1 && i !== totalPages) {
        pages.push(ellipsis);
      } else if (page > totalPages - 7 && i > totalPages - 7) {
        pages.push(html);
      } else if ((i > page + 5 && i < totalPages) || i < page) {
        continue;
      } else {
        pages.push(html);
      }
    }

    const paginationHTML = `      
    <section class="pagination">
    <div class="pagination-left">
      <button type="button" class="button primary page first-page ${
        page === 1 ? "disabled" : ""
      }" data-page="1">
        <i class="fa-solid fa-chevron-left"></i
        ><i class="fa-solid fa-chevron-left"></i>
      </button>
      <button type="button" class="button primary page prev-page ${
        page === 1 ? "disabled" : ""
      }" data-page="${page - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    <div id="pages">
      ${pages.join("")}
    </div>
    <div class="pagination-right">
      <button type="button" class="button primary page next-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${page + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <button type="button" class="button primary page last-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${totalPages}">
        <i class="fa-solid fa-chevron-right"></i
        ><i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    </section>`;

    // Return page one of results with pagination
    return $(`#${containerID}`).html(`
      ${paginationHTML}
      ${pageResult.join("")}
      ${paginationHTML}
      `);
  },

  showPropertyViewHTML(containerID, propertyID) {
    const users = this.jsonToClasses("users");
    let userLoggedIn;
    let userSavedProperties;

    if (this.getStorage("login")) {
      userLoggedIn = users.find(
        (user) => user.id === this.getStorage("login").id
      );

      userSavedProperties = userLoggedIn.propertiesSaved;
    }
    const properties = this.jsonToClasses("properties");
    const property = properties.find(
      (property) => property.propertyID === propertyID
    );
    console.log();
    const propertyImages = property.images.map(
      (image) =>
        `<li><img src="${image}" alt="${property.propertyName} Image"/></li>`
    );

    return $(`#${containerID}`).html(`
      <div id="property-main">
      <section id="photos">
        <div class="exzoom" id="exzoom">
          <!-- Images -->
          <div class="exzoom_img_box">
            <ul class="exzoom_img_ul">
              ${propertyImages.join("")}
            </ul>
          </div>
          <div class="exzoom_nav"></div>
          <!-- Nav Buttons -->
          <p class="exzoom_btn">
            <a href="javascript:void(0);" class="exzoom_prev_btn"> < </a>
            <a href="javascript:void(0);" class="exzoom_next_btn"> > </a>
          </p>
        </div>
      </section>
      <section id="details">
        <header>
          <h1 id="property-name">${property.propertyName}</h1>
          <a href="#" class="link property-save" data-property-id="${
            property.propertyID
          }" ${
      userLoggedIn
        ? userSavedProperties.includes(property.propertyID)
          ? "data-saved = true"
          : ""
        : ""
    }
            >${
              userLoggedIn
                ? userSavedProperties.includes(property.propertyID)
                  ? "Saved"
                  : "Save"
                : "Save"
            }&nbsp;&nbsp;<i class="fa-${
      userLoggedIn
        ? userSavedProperties.includes(property.propertyID)
          ? "solid"
          : "regular"
        : "regular"
    } fa-heart"></i
          ></a>
        </header>
        <div id="tags">
          <span class="tag ${
            property.tags.isAvailable ? "avail" : "not-avail"
          }">${property.tags.isAvailable ? "Available" : "Not Available"}</span>
          <span class="tag">${property.titleCase("tags", "propertyType")}</span>
          <span class="tag">For ${property.titleCase(
            "tags",
            "listingType"
          )}</span>
        </div>
        <p id="price">
          <i class="fa-solid fa-dollar-sign"></i>&nbsp;&nbsp;${property.price.toLocaleString(
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}
        </p>
        <p id="description">
          ${property.description}
        </p>
        <div id="rooms">
          <span id="bedrooms"
            ><i class="fa-solid fa-bed"></i>&nbsp;&nbsp;${
              property.rooms.bedrooms
            } ${property.rooms.bedrooms > 1 ? "bedrooms" : "bedroom"}</span
          >
          <span id="bathrooms"
            ><i class="fa-solid fa-toilet"></i>&nbsp;&nbsp;${
              property.rooms.bathrooms
            } ${property.rooms.bathrooms > 1 ? "bedrooms" : "bedroom"}</span
          >
        </div>
        <div id="specifics">
          <p id="owner">${
            property.ownerName
          }&nbsp;&nbsp;<i class="fa-solid fa-user"></i></p>
          <p id="location">
            ${property.getLocation()}&nbsp;&nbsp;<i class="fa-solid fa-location-dot"></i>
          </p>
        </div>
      </section>
    </div>
    <div id="property-footer">
      <section id="appointment">
        <form data-property-id="${property.propertyID}" novalidate>
          <h2>Schedule Your Visit</h2>
          ${
            this.getStorage("login")
              ? `<p class="user-logged-in"><i class="fa-solid fa-user"></i>&nbsp;&nbsp;Logged in as: ${userLoggedIn.getFullName()}</p>`
              : `<p class="not-logged-in"><a href="./log-in.html">Login&nbsp;</a>to save your appointment!</p><input
          type="text"
          name="sched-name"
          id="sched-name"
          placeholder="Enter your name"
        />
        <input
          type="email"
          name="sched-email"
          id="sched-email"
          placeholder="Enter your email"
        />`
          }
          <input type="tel" name="sched-contact" id="sched-contact" />
          <input
            type="text"
            name="sched-date"
            id="sched-date"
            placeholder="Enter preferred date and time"
          />
          <button type="submit" class="button ${
            property.tags.isAvailable ? "primary" : "disabled"
          }">Submit</button>
        </form>
      </section>
      <section id="map">
        <iframe
          id="google-maps"
          title="location"
          width="600"
          height="350"
          src="https://maps.google.com/maps?q=${
            property.location.country
          }&t=&z=7&ie=UTF8&iwloc=&output=embed"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
        ></iframe>
      </section>
    </div>`);
  },

  showUserPropertiesList(containerID, paginatedResult, page = 1) {
    if (paginatedResult.length === 0) {
      return $(`#${containerID}`).html(
        "<h2 class='no-result'>You haven't listed or set an appointment with any properties yet.&nbsp;&nbsp;</h2>"
      );
    }

    const totalPages = paginatedResult.length;

    // Create initial pagination for results
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      const html = `<button type="button" class="button page ${
        i === page ? "primary current-page" : ""
      }" data-page="${i}">${i}</button>`;

      const ellipsis = `<span class="ellipsis">...</span>`;

      if (totalPages === 6 && i === 6) {
        pages.push(html);
      } else if (i === page + 5 && i !== totalPages - 1 && i !== totalPages) {
        pages.push(ellipsis);
      } else if (page > totalPages - 7 && i > totalPages - 7) {
        pages.push(html);
      } else if ((i > page + 5 && i < totalPages) || i < page) {
        continue;
      } else {
        pages.push(html);
      }
    }

    const paginationHTML = `      
    <section class="pagination">
    <div class="pagination-left">
      <button type="button" class="button primary page first-page ${
        page === 1 ? "disabled" : ""
      }" data-page="1">
        <i class="fa-solid fa-chevron-left"></i
        ><i class="fa-solid fa-chevron-left"></i>
      </button>
      <button type="button" class="button primary page prev-page ${
        page === 1 ? "disabled" : ""
      }" data-page="${page - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    <div id="pages">
      ${pages.join("")}
    </div>
    <div class="pagination-right">
      <button type="button" class="button primary page next-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${page + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <button type="button" class="button primary page last-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${totalPages}">
        <i class="fa-solid fa-chevron-right"></i
        ><i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    </section>`;

    const headingsHTML = `
      <div id="property-list-headings">
        <p>Date</p>
        <p>Property Name</p>
        <p>Tags</p>
        <p>Link</p>
        <p>Modify</p>
      </div>
    `;

    const propertyListsHTML = `
      <div id="property-list-items">
        ${this.generatePropertiesList(paginatedResult[page - 1]).join("")}
      </div>
    `;

    // Return page one of results with pagination
    return $(`#${containerID}`).html(`
      ${paginationHTML}
      ${headingsHTML}
      ${propertyListsHTML}
      ${paginationHTML}
      `);
  },

  showLeads(containerID, paginatedResult, page = 1) {
    if (paginatedResult.length === 0) {
      return $(`#${containerID}`).html(
        "<h2 class='no-result'>There are no leads or inquiries as of the moment.&nbsp;&nbsp;</h2>"
      );
    }

    const totalPages = paginatedResult.length;

    // Create initial pagination for results
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      const html = `<button type="button" class="button page ${
        i === page ? "primary current-page" : ""
      }" data-page="${i}">${i}</button>`;

      const ellipsis = `<span class="ellipsis">...</span>`;

      if (totalPages === 6 && i === 6) {
        pages.push(html);
      } else if (i === page + 5 && i !== totalPages - 1 && i !== totalPages) {
        pages.push(ellipsis);
      } else if (page > totalPages - 7 && i > totalPages - 7) {
        pages.push(html);
      } else if ((i > page + 5 && i < totalPages) || i < page) {
        continue;
      } else {
        pages.push(html);
      }
    }

    const paginationHTML = `      
    <section class="pagination">
    <div class="pagination-left">
      <button type="button" class="button primary page first-page ${
        page === 1 ? "disabled" : ""
      }" data-page="1">
        <i class="fa-solid fa-chevron-left"></i
        ><i class="fa-solid fa-chevron-left"></i>
      </button>
      <button type="button" class="button primary page prev-page ${
        page === 1 ? "disabled" : ""
      }" data-page="${page - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    <div id="pages">
      ${pages.join("")}
    </div>
    <div class="pagination-right">
      <button type="button" class="button primary page next-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${page + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <button type="button" class="button primary page last-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${totalPages}">
        <i class="fa-solid fa-chevron-right"></i
        ><i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    </section>`;

    const headingsHTML = `
      <div id="lead-list-headings">
        <p>Date</p>
        <p>Lead Type</p>
        <p>Tags</p>
        <p>View</p>
        <p>Delete</p>
      </div>
    `;

    const leadsListsHTML = `
      <div id="leads-list-items">
        ${this.generateLeadsList(paginatedResult[page - 1]).join("")}
      </div>
    `;

    // Return page one of results with pagination
    return $(`#${containerID}`).html(`
      ${paginationHTML}
      ${headingsHTML}
      ${leadsListsHTML}
      ${paginationHTML}
      `);
  },

  showUsers(containerID, paginatedResult, page = 1) {
    if (paginatedResult.length === 0) {
      return $(`#${containerID}`).html(
        "<h2 class='no-result'>There are no leads or inquiries as of the moment.&nbsp;&nbsp;</h2>"
      );
    }

    const totalPages = paginatedResult.length;

    // Create initial pagination for results
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      const html = `<button type="button" class="button page ${
        i === page ? "primary current-page" : ""
      }" data-page="${i}">${i}</button>`;

      const ellipsis = `<span class="ellipsis">...</span>`;

      if (totalPages === 6 && i === 6) {
        pages.push(html);
      } else if (i === page + 5 && i !== totalPages - 1 && i !== totalPages) {
        pages.push(ellipsis);
      } else if (page > totalPages - 7 && i > totalPages - 7) {
        pages.push(html);
      } else if ((i > page + 5 && i < totalPages) || i < page) {
        continue;
      } else {
        pages.push(html);
      }
    }

    const paginationHTML = `      
    <section class="pagination">
    <div class="pagination-left">
      <button type="button" class="button primary page first-page ${
        page === 1 ? "disabled" : ""
      }" data-page="1">
        <i class="fa-solid fa-chevron-left"></i
        ><i class="fa-solid fa-chevron-left"></i>
      </button>
      <button type="button" class="button primary page prev-page ${
        page === 1 ? "disabled" : ""
      }" data-page="${page - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    <div id="pages">
      ${pages.join("")}
    </div>
    <div class="pagination-right">
      <button type="button" class="button primary page next-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${page + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <button type="button" class="button primary page last-page ${
        page === totalPages ? "disabled" : ""
      }" data-page="${totalPages}">
        <i class="fa-solid fa-chevron-right"></i
        ><i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    </section>`;

    const headingsHTML = `
      <div id="user-list-headings">
        <p>ID</p>
        <p>Email</p>
        <p>Tags</p>
        <p>Edit</p>
        <p>Delete</p>
      </div>
    `;

    const usersListsHTML = `
      <div id="users-list-items">
        ${this.generateUsersList(paginatedResult[page - 1]).join("")}
      </div>
    `;

    // Return page one of results with pagination
    return $(`#${containerID}`).html(`
      ${paginationHTML}
      ${headingsHTML}
      ${usersListsHTML}
      ${paginationHTML}
      `);
  },

  showAccount(containerID) {
    const userLoggedIn = this.getStorage("login");
    const updatedData = this.jsonToClasses();
    const users = updatedData.users;
    const user = users.find((user) => user.id === userLoggedIn.id);
    const userHTML = `
    <div>
      <div id="user-greet">
        <h1>${user.greetUser()}</h1>
        <a href="#" class="settings" id="user-settings"
          >User Settings&nbsp;&nbsp;<i class="fa-solid fa-gear"></i
        ></a>
      </div>
      <div id="user-details-container">
        <ul>
          <li><a href="#property-list">Properties List</a></li>
          <li><a href="#saved">Properties Saved</a></li>
        </ul>
        <section id="property-list">
          <header>
            <div>
              <h2>Properties List</h2>
              <button type="button" class="button primary" id="list-new-property"
                ><i class="fa-solid fa-plus"></i
              ></button>
            </div>
          </header>
          <div class="container list" id="properties-list-container"></div>
        </section>
        <section id="saved">
          <header>
            <div>
              <h2>Properties Saved</h2>
            </div>
          </header>
          <div class="container saved" id="properties-saved-container"></div>
        </section>
      </div>
    </div>`;

    const adminHTML = `
    <div>
      <div id="admin-greet">
        <h1>${user.greetUser()}</h1>
        <a href="#" class="settings" id="admin-settings"
          >Admin Settings&nbsp;&nbsp;<i class="fa-solid fa-gear"></i
        ></a>
      </div>
      <div id="admin-details-container">
        <ul>
          <li><a href="#user-list">Users List</a></li>
          <li><a href="#property-list">Properties List</a></li>
          <li><a href="#leads">Leads and Inquiries</a></li>
        </ul>
        <section id="user-list">
          <header>
            <div>
              <h2>Users list</h2>
              <button type="button" class="button primary" id="new-user"
                ><i class="fa-solid fa-plus"></i
              ></button>
            </div>
          </header>
          <div class="container list" id="users-list-container"></div>
        </section>
        <section id="property-list">
          <header>
            <div>
              <h2>Properties List</h2>
              <button type="button" class="button primary" id="list-new-property"
                ><i class="fa-solid fa-plus"></i
              ></button>
            </div>
          </header>
          <div class="container list" id="properties-list-container"></div>
        </section>
        <section id="leads">
          <header>
            <div>
              <h2>Leads and Inquiries</h2>
            </div>
          </header>
          <div class="container saved" id="leads-container"></div>
        </section>
      </div>
    </div>
    `;

    if (!userLoggedIn.isAdmin) {
      if (containerID) {
        $(`#${containerID}`).html(userHTML);
      }

      const userPropertiesSaved = user.propertiesSaved.map((id) => {
        return updatedData.properties.find(
          (property) => property.propertyID === id
        );
      });
      const userPropertiesList = user.propertiesList.map((userProperty) => {
        return updatedData.properties.find(
          (property) => property.propertyID === userProperty.propertyID
        );
      });

      return { userPropertiesSaved, userPropertiesList };
    } else {
      if (containerID) {
        $(`#${containerID}`).html(adminHTML);
      }
    }
  },
};
