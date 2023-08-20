const express = require("express")
const app = express()
const port = 5050;
app.use(express.urlencoded({ extended:true }))
app.use(express.json())

app.get("/", (req, res) => {
  return res.status(200).json("こんにちは")
})

//ITEM functionsだよ
//Create Itemだよ
app.post("/item/create", (req, res) => {
  console.log(req.body)
  return res.status(200).json("ばいばい")
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