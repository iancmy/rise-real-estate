function genPropertyID() {
  return (
    "P-" +
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  );
}

export default class Property {
  constructor(
    propertyName,
    description,
    location,
    price = 10,
    rooms = {
      bedrooms: 1,
      bathrooms: 1,
    },
    tags = {
      propertyType: "house",
      listingType: "sale",
      isAvailable: true,
    },
    ownerName = "Rise Real Estate",
    userID = "U-rise-RealEstate",
    appointments = [],
    images = [
      "./assets/img/default1.jpg",
      "./assets/img/default2.jpg",
      "./assets/img/default3.jpg",
      "./assets/img/default4.jpg",
      "./assets/img/default5.jpg",
    ],
    propertyID = genPropertyID(),
    dateCreated = new Date().getTime()
  ) {
    this.propertyName = propertyName;
    this.description = description;
    this.location = location;
    this.price = price;
    this.rooms = rooms;
    this.tags = tags;
    this.appointments = appointments;
    this.images = images;
    this.ownerName = ownerName;
    this.userID = userID;
    this.propertyID = propertyID;
    this.dateCreated = dateCreated;
  }

  status() {
    return this.appointments.length > 0
      ? "Ongoing Appointments"
      : this.tags.isAvailable
      ? "Listed"
      : this.tags.listingType === "rent"
      ? "Rented Out"
      : "Sold";
  }

  getLocation() {
    return `${this.location.buildingNumber} ${this.location.street}, ${this.location.city}, ${this.location.state}, ${this.location.zipCode}, ${this.location.country}`;
  }

  titleCase(property, subProperty) {
    if (!subProperty) {
      return `${this[property.charAt(0).toUpperCase()]}${this[property].slice(
        1
      )}`;
    }

    return `${this[property][subProperty].charAt(0).toUpperCase()}${this[
      property
    ][subProperty].slice(1)}`;
  }

  saveAppointment(appointmentID) {
    if (
      this.appointments.find((appointment) => appointment === appointmentID)
    ) {
      return;
    }

    return this.appointments.push(appointmentID);
  }

  removeAppointment(appointmentID) {
    if (
      !this.appointments.find((appointment) => appointment === appointmentID)
    ) {
      return;
    }

    const index = this.appointments.findIndex((appointment) => {
      return appointment === appointmentID;
    });

    return this.propertiesSaved.splice(index, 1);
  }
}
