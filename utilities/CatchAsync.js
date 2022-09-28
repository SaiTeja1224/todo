module.exports = (func) => {
  return function (req, res, next) {
    func(req, res).catch((e) => next(e));
  };
};
