function genAppointmentID() {
  return (
    "A-" +
    ([1e7] + -1e3 + -4e3).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  );
}

export default class Appointment {
  constructor(
    userName,
    userEmail,
    contactNumber,
    dateTimeISO,
    userID = "guest",
    appointmentID = genAppointmentID(),
    dateCreated = new Date().getTime()
  ) {
    this.userName = userName;
    this.userEmail = userEmail;
    this.contactNumber = contactNumber;
    this.dateTimeISO = dateTimeISO;
    this.userID = userID;
    this.appointmentID = appointmentID;
    this.dateCreated = dateCreated;
  }

  getDate(dateTimeISO) {
    return new Date(dateTimeISO).toLocaleDateString();
  }

  getTime(dateTimeISO) {
    return new Date(dateTimeISO).toLocaleTimeString();
  }

  getDateTime(dateTimeISO) {
    return new Date(dateTimeISO).toLocaleString();
  }
}
