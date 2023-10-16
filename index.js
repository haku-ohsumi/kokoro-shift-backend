const express = require("express")
const app = express()
const port = process.env.PORT || 5100;
const cors = require("cors")
app.use(cors())
app.use(express.urlencoded({ extended:true }))
app.use(express.json())
const jwt = require("jsonwebtoken")
const auth = require("./utils/auth")
const connectDB = require("./utils/database")
const { AdminUserModel, StaffUserModel, KokoroDataModel, ShiftModel } = require("./utils/schemaModels")

// スタッフ選択画面
// スタッフユーザーデータを取得するエンドポイント
app.get("/api/staffUsers", async (req, res) => {
  try {
    connectDB()
    const staffUsers = await StaffUserModel.find();
    res.json(staffUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "データの取得に失敗しました" });
  }
});

// シフト管理
// シフト作成
app.post("/admin/staffId/shift-management", async (req, res) => {
  try {
    connectDB()
    const { startTime, endTime } = req.body;

    const Shift = new ShiftModel({ startTime, endTime });
    await Shift.save();

    res.status(200).json({ message: "シフトが保存されました" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "シフトが保存できませんでした" });
  }
});


// ココロステート
// 「ココロの状態」を保存
app.post("/staff/kokoro/state/:staffId", async (req, res) => {

  const staffId = req.params.staffId;

  try {
    // データベースに新しいデータを保存
    const newKokoroData = new KokoroDataModel({
      kokoroState: req.body.kokoroState,
      staffId: staffId,
    });
    await newKokoroData.save();

    return res.status(200).json({ message: "データが正常に保存されました" });
  } catch (error) {
    return res.status(500).json({ message: "データの保存中にエラーが発生しました" });
  }
});



//ユーザー
//管理者登録
app.post("/admin/user/register", async(req, res) => {
  try{
    await connectDB()
    await AdminUserModel.create(req.body)
    return res.status(200).json({message: "ユーザー登録成功"})
  }catch(err){
    return res.status(400).json({message: "ユーザー登録失敗"})
  }
})

//管理者ログイン
const admin_secret_key = "admin-secret"

app.post("/admin/user/login", async(req, res) => {
  try{
    await connectDB()
    const savedAdminUserData = await AdminUserModel.findOne({email: req.body.email})
    if(savedAdminUserData){
      if(req.body.password === savedAdminUserData.password){
        const payload = {
          email: req.body.email,
        }
        const adminToken = jwt.sign(payload, admin_secret_key, { expiresIn: "23h" })
        return res.status(200).json({message: "ログイン成功", adminToken, tokenType: "admin-token"})
      }else{
        return req.status(400).json({message: "ログイン失敗: パスワードが間違っています"})
      }
    }else{
      return res.status(400).json({message: "ログイン失敗: 管理者登録をしてください"})
    }
  }catch(err){
    return res.status(400).json({message: "ログイン失敗"})
  }
})

//スタッフ登録
app.post("/admin/staff/register", async(req, res) => {
  try{
    await connectDB()
    await StaffUserModel.create(req.body)
    return res.status(200).json({message: "ユーザー登録成功"})
  }catch(err){
    return res.status(400).json({message: "ユーザー登録失敗"})
  }
})

//スタッフログイン
const staff_secret_key = "staff-secret"

app.post("/staff/user/login", async(req, res) => {
  try{
    await connectDB()
    const savedStaffUserData = await StaffUserModel.findOne({email: req.body.email})
    if(savedStaffUserData){
      if(req.body.password === savedStaffUserData.password){
        const payload = {
          email: req.body.email,
        }

        const staffId = savedStaffUserData._id;

        const staffToken = jwt.sign(payload, staff_secret_key, {expiresIn: "23h"})
        return res.status(200).json({message: `ログイン成功, staffId: ${staffId}`, staffToken, tokenType: "staff-token", staffId})
      }else{
        return req.status(400).json({message: "ログイン失敗: パスワードが間違っています"})
      }
    }else{
      return res.status(400).json({message: "ログイン失敗: 管理者登録をしてください"})
    }
  }catch(err){
    return res.status(400).json({message: "ログイン失敗"})
  }
})

app.listen(port, () => {
  console.log (`Listening on localhost port ${port}`)
})