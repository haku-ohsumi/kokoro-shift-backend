const mongoose = require ("mongoose")

const Schema = mongoose.Schema


const ShiftSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  staffIdAdmin: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    // required: true,
  },
  wageUp: {
    type: Number,
  }
});


const KokoroDataSchema = new mongoose.Schema({
  kokoroState: {
    type: Number,
    required: true,
  },
  staffId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const WageUpDataSchema = new mongoose.Schema({
  wageUp: Number,
});

const AdminUserSchema = new Schema({
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

const StaffUserSchema = new Schema({
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

exports.ShiftModel = mongoose.model("Shift", ShiftSchema);
exports.KokoroDataModel = mongoose.model("KokoroData", KokoroDataSchema)
exports.WageUpDataModel = mongoose.model("WageUpData", WageUpDataSchema)
exports.AdminUserModel = mongoose.model("AdminUser", AdminUserSchema)
exports.StaffUserModel = mongoose.model("StaffUser", StaffUserSchema)