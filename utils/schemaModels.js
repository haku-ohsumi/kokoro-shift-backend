const mongoose = require ("mongoose")

const Schema = mongoose.Schema

const ItemSchema = new Schema({
  title: String,
  image: String,
  price: String,
  description: String,
  email: String
})

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})

exports.ItemModel = mongoose.model("Item", ItemSchema)
exports.UserModel = mongoose.model("User", UserSchema)