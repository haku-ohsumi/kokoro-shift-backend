const express = require("express")
const app = express()
const port = 5050;
app.use(express.urlencoded({ extended:true }))
app.use(express.json())
const connectDB = require("./utils/database")
const { ItemModel } = require("./utils/schemaModels")

//ITEM functionsだよ
//Create Itemだよ
app.post("/item/create", async(req, res) => {
  try {
  connectDB()
  await ItemModel.create(req.body)
  return res.status(200).json({message: "アイテム作成成功"})
  }catch(err){
    return res.status(400).json({message: "アイテム作成失敗"})
  }
})

//Read All Items
app.get("/", async(req, res) => {
  try{
    await connectDB()
    const allItems = await ItemModel.find()
    return res.status(200).json({message: "アイテムの読み取り成功（オール）", allItems: allItems})
  }catch(err){
    return res.status(400).json({message: "アイテムの読み取り失敗（オール）"})
  }
})
//Read Single Item
app.get("/item/:id", async(req, res) => {
  try{
    await connectDB()
    const singleItem = await ItemModel.findById(req.params.id)
    return res.status(200).json({message: "アイテム読み取り成功（シングル）", singleItem: singleItem})
  }catch(err){
    return res.status(400).json({message: "アイテム読み取り失敗（シングル）"})
  }
})
//Update Item
app.put("/item/update/:id", (req, res) => {
  return res.status(200).json({message: "アイテム編集成功"})
})
//Delete Item

//USER functionsだよ
//Register User
//Login User

app.listen(port, () => {
  console.log (`Listening onLocalhost port ${port}`)
})