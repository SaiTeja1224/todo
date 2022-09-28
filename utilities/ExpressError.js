class ExpressError extends Error {
  message = "";
  status = 404;
  constructor(msg, status) {
    super();
    this.message = msg;
    this.status = status;
  }
}

module.exports = ExpressError;
