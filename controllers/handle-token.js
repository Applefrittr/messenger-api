// Middleware handles a JWT passed from the front end and adds it to the request object
function handleToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.json({ message: "No current user, Forbidden" });
  }
}

module.exports = handleToken;
