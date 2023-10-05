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
const { ItemModel, UserModel } = require("./utils/schemaModels")

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
//管理者ログイン
const secret_key = "kokoro-shift"

app.post("/user/admin/login", async(req, res) => {
  try{
    await connectDB()
    const savedUserData = await UserModel.findOne({email: req.body.email})
    if(savedUserData === 'haku@gmail.com'){
      if(req.body.password === savedUserData.password){
        const payload = {
          email: req.body.email,
        }
        const token = jwt.sign(payload, secret_key, {expiresIn: "23h"})
        return res.status(200).json({message: "ログイン成功", token})
      }else{
        return req.status(400).json({message: "ログイン失敗: パスワードが間違っています"})
      }
    }else{
      return res.status(400).json({message: "ログイン失敗: ユーザー登録をしてください"})
    }
  }catch(err){
    return res.status(400).json({message: "ログイン失敗"})
  }
})

//従業員登録
app.post("/user/employee/register", async(req, res) => {
  try{
    await connectDB()
    await UserModel.create(req.body)
    return res.status(200).json({message: "ユーザー登録成功"})
  }catch(err){
    return res.status(400).json({message: "ユーザー登録失敗"})
  }
})

//従業員ログイン
app.post("/user/employee/login", async(req, res) => {
  try{
    await connectDB()
    const savedUserData = await UserModel.findOne({email: req.body.email})
    if(savedUserData){
      if(req.body.password === savedUserData.password){
        const payload = {
          email: req.body.email,
        }
        const token = jwt.sign(payload, secret_key, {expiresIn: "23h"})
        return res.status(200).json({message: "ログイン成功", token})
      }else{
        return req.status(400).json({message: "ログイン失敗: パスワードが間違っています"})
      }
    }else{
      return res.status(400).json({message: "ログイン失敗: ユーザー登録をしてください"})
    }
  }catch(err){
    return res.status(400).json({message: "ログイン失敗"})
  }
})

app.listen(port, () => {
  console.log (`Listening on localhost port ${port}`)
})