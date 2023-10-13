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
const { ItemModel, AdminUserModel, StaffUserModel } = require("./utils/schemaModels")

//「ココロの状態」
//「ココロの状態」回答
app.post("/kokoro/respond", auth, async(req, res) => {
  try {
  connectDB()
  await ItemModel.create(req.body)
  return res.status(200).json({message: "アイテム作成成功"})
  }catch(err){
    return res.status(400).json({message: "アイテム作成失敗"})
  }
})

//「ココロ危険度」閲覧
app.get("/kokoro-risk", async(req, res) => {
  try{
    await connectDB()
    const allItems = await ItemModel.find()
    return res.status(200).json({message: "アイテムの読み取り成功（オール）", allItems: allItems})
  }catch(err){
    return res.status(400).json({message: "アイテムの読み取り失敗（オール）"})
  }
})


//シフト
//シフト作成
app.post("/shift/create/:id", auth, async(req, res) => {
  try {
  connectDB()
  await ItemModel.create(req.body)
  return res.status(200).json({message: "アイテム作成成功"})
  }catch(err){
    return res.status(400).json({message: "アイテム作成失敗"})
  }
})

//シフト修正
app.put("/shift/update/:id", auth, async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    if (singleItem.email === req.body.email){
      await ItemModel.updateOne({_id: req.params.id}, req.body)
      return res.status(200).json({message: "アイテム編集成功（シングル）", singleItem: singleItem})
    }else{
      throw new Error()
    }
  }catch(err){
    return res.status(400).json({message: "アイテム編集失敗"})
  }
})

//シフト削除
app.delete("/shift/delete/:id", auth, async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    if(singleItem.email === req.body.email){
      await ItemModel.deleteOne({_id: req.params.id})
      return res.status(200).json({message: "アイテム削除成功"})
    }else{
      throw new Error()
    }
  }catch(err){
    return res.status(400).json({message: "アイテム削除失敗"})
  }
})

//シフト閲覧
app.get("/shift/:id", async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    return res.status(200).json({message: "アイテム読み取り成功（シングル）", singleItem: singleItem})
  }catch(err){
    return res.status(400).json({message: "アイテム読み取り失敗（シングル）"})
  }
})

//シフト閲覧（従業員）
app.get("/shift/employee:id", async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    return res.status(200).json({message: "アイテム読み取り成功（シングル）", singleItem: singleItem})
  }catch(err){
    return res.status(400).json({message: "アイテム読み取り失敗（シングル）"})
  }
})


//ココロシフト
//ココロシフト読み取り
app.get("/kokoro-shift/:id", async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    return res.status(200).json({message: "アイテム読み取り成功（シングル）", singleItem: singleItem})
  }catch(err){
    return res.status(400).json({message: "アイテム読み取り失敗（シングル）"})
  }
})

//ココロシフト
app.post("/shift/create/:id", auth, async(req, res) => {
  try {
  connectDB()
  await ItemModel.create(req.body)
  return res.status(200).json({message: "アイテム作成成功"})
  }catch(err){
    return res.status(400).json({message: "アイテム作成失敗"})
  }
})



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