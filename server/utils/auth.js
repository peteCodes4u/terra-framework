// json webtoken initialization
const jwt = require("jsonwebtoken");

// set token and secret with exp date
const expiration = '2h';
const secret = process.env.JWTSECRET;

module.exports = {
  // authentication routes functions
  authMiddleware: function (req, res, next) {
    // allows tokens via headers or req.query
    let token = req.query.token || req.headers.authorization;

    //["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return res
        .status(400)
        .json({
          message: "Sorry, your request has not included a valid token",
        });
    }

    // verify token
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("INVALID TOKEN");
      return res
        .status(400)
        .json({
          message: "This token appears to be invalid! Please try again",
        });
    }

        // send to next API endpoint
        next();
    },
    signToken: function ({ username, email, _id }) {
        const payload = { username, email, _id };

        return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
};
