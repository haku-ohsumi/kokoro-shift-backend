const express = require("express")
const app = express()
const port = 5050;
app.use(express.urlencoded({ extended:true }))
app.use(express.json())
const connectDB = require("./utils/database")
const { ItemModel } = require("./utils/schemaModels")

app.get("/", (req, res) => {
  return res.status(200).json("こんにちは")
})

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
//Read Single Item
//Update Item
//Delete Item

//USER functionsだよ
//Register User
//Login User

app.listen(port, () => {
  console.log (`Listening onLocalhost port ${port}`)
})