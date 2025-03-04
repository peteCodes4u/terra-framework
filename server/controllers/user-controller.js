// import user model
const { User } = require("../models");

// import sign token function from auth to be utilized in user controller for sgining tokens on api requests
const { signToken } = require('../utils/auth');

module.exports = {
  // get user by id or username
  async getSingleUser({ user = null, params }, res) {
    try {
      const foundUser = await User.findOne({
        $or: [
          { _id: user ? user._id : params.id },
          { username: params.username },
        ],
      });

      if (!foundUser) {
        return res.status(400).json({
          message: "Sorry, this user can not be found in our records!",
        });
      }
      res.json(foundUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // create a user, sign the token and return it to client
  async createUser({ body }, res) {
    const user = await User.create(body);

    if(!user) {
        return res.status(400).console.log(json({ message: 'Sorry, Something went wrong - please restart and try again'}));
    }
    const token = signToken(user);
    res.json({ token, user });
},
// login user, sign token retrun it to client
async login({ body }, res) {
    const user = await User.findOne({ $or: [{ username: body.username}, { email: body.email}] });
    if (!user) {
        return res.status(400).json({ message: "There is no usere associated with this request, please check your entry and try again"})
    }
    const correctPw = await user.isCorrectPassword(body.password);
    if (!correctPw) {
        return res.status(400).json({ message: 'Your password is not correct, please try again'});
    }
    const token = signToken(user);
    res.json({ token, user});
}
};
