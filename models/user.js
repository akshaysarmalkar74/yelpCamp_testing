const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// READ: https://mianlabs.com/2018/05/09/understanding-sessions-and-local-authentication-in-express-with-passport-and-mongodb/

/* PASSPORTLOCALMONGOOSE
• passport-local-mongoose takes care of salting and hashing user passwords, serializing and deserializing 
your user model (for session storage), and authenticating the username and password credentials with their 
stored counterparts in the mongo database.

•It is a mongoose plugin first and foremost. It uses the passport-local module internally to provide and 
configure a LocalStrategy of local authentication for the passport module.
 */

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose); //it will give UserSchema a username, password,
// makes sure the username is unique and not duplicated and some other methods we can use

//You're free to define your User how you like. Passport-Local Mongoose will add a username,
//hash and salt field to store the username, the hashed password and the salt value.

module.exports = mongoose.model("User", UserSchema);
