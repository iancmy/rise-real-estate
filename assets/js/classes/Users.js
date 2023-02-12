function genUserID() {
  return (
    "U-" +
    ([1e7] + -1e3).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  );
}

export default class User {
  constructor(
    firstName,
    lastName,
    email,
    password,
    isAdmin = false,
    propertiesList = [],
    propertiesSaved = [],
    id = genUserID(),
    dateCreated = new Date().getTime()
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.isAdmin = isAdmin;
    this.propertiesList = propertiesList;
    this.propertiesSaved = propertiesSaved;
    this.id = id;
    this.dateCreated = dateCreated;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  greetUser() {
    const hour = new Date().getHours();

    if (hour < 12 && hour >= 4) {
      return `Good morning, ${this.firstName}!`;
    } else if (hour < 18 && hour >= 12) {
      return `Good afternoon, ${this.firstName}!`;
    } else {
      return `Good evening, ${this.firstName}!`;
    }
  }

  saveProperty(propertyID) {
    if (this.propertiesSaved.find((property) => property === propertyID)) {
      return;
    }

    return this.propertiesSaved.push(propertyID);
  }

  removeSavedProperty(propertyID) {
    if (!this.propertiesSaved.find((property) => property === propertyID)) {
      return;
    }

    const index = this.propertiesSaved.findIndex((property) => {
      return property === propertyID;
    });

    return this.propertiesSaved.splice(index, 1);
  }

  listProperty(propertyID, type) {
    if (
      this.propertiesList.find((property) => property.propertyID === propertyID)
    ) {
      return;
    }

    return this.propertiesList.push({ type, propertyID });
  }

  removeListedProperty(propertyID) {
    if (
      !this.propertiesList.find(
        (property) => property.propertyID === propertyID
      )
    ) {
      return;
    }

    const index = this.propertiesList.findIndex((property) => {
      return property.propertyID === propertyID;
    });

    return this.propertiesList.splice(index, 1);
  }
}
