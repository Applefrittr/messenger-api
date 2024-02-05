const jwt = require("jsonwebtoken");

// Middleware handles a JWT passed from the front end and adds it to the request object then verfies that it is still valid and not expired
function handleToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  // if (bearerHeader) {
  try {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          const error = new Error("Credentials expired, please login again");
          error.status = 401;
          next(error);
        } else {
          //console.log("jwt verified");
          next();
        }
      }
    );
  } catch (error) {
    next(new Error("Forbidden!"));
  }

  // } else {
  //res.json({ message: "No current user, Forbidden" });
  // }
}

const handleTokenWS = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const error = new Error("Credentials expired, please login again");
        error.status = 401;
        next(error);
      } else {
        console.log("jwt verified!");
        next();
      }
    });
  } catch (error) {
    next(new Error("Forbidden!"));
  }
};

module.exports = { handleToken, handleTokenWS };
