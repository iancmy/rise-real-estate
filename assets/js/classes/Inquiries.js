export default class Inquiry {
  constructor(
    firstName,
    lastName,
    email,
    subject,
    message,
    userID = "guest",
    inquiryID = `I-${Date.now()}`,
    dateCreated = new Date().getTime()
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.subject = subject;
    this.message = message;
    this.userID = userID;
    this.inquiryID = inquiryID;
    this.dateCreated = dateCreated;
  }
}
