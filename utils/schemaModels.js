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
});


const KokoroDataSchema = new mongoose.Schema({
  kokoroState: {
    type: Number, // ココロの状態を表す数値
    required: true,
  },
  staffId: {
    type: String, // StaffIDを保存するためのフィールド
    required: true,
  },
  date: {
    type: Date, // データを保存した日時
    default: Date.now,
  },
  // 他にも必要なフィールドがあればここに追加できます
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
exports.AdminUserModel = mongoose.model("AdminUser", AdminUserSchema)
exports.StaffUserModel = mongoose.model("StaffUser", StaffUserSchema)