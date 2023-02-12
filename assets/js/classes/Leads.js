function genLeadsID() {
  return (
    "L-" +
    ([1e7] + -1e3 + -4e3 + -8e3).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  );
}

export default class Lead {
  constructor(
    email,
    date = new Date().toISOString(),
    id = genLeadsID(),
    dateCreated = new Date().getTime()
  ) {
    this.email = email;
    this.date = date;
    this.id = id;
    this.dateCreated = dateCreated;
  }
}
