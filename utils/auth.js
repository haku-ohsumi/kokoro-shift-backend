const jwt = require("jsonwebtoken")
const secret_key = "mern-market"

const auth = async(req, res, next) => {
  if(req.method === "GET"){
    return next()
  }
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbGxvQG1vbm90ZWluLmNvbSIsImlhdCI6MTY5NTUzNjQyMSwiZXhwIjoxNjk1NjE5MjIxfQ.FgoQGbz6jL551kZ9EyEbqFJtAt1wPTvXV3dfO28PWsI"
  // const token = await req.headers.authorization.split(" ")[1]
  if(!token){
    return res.status(400).json({message: "トークンがありません"})
  }
  try {
    const decoded = jwt.verify(token, secret_key)
    console.log(decoded)
  }catch(err){
    return res.status(400).json({message: "トークンが正しくないので、ログインしてください"})
  }
}

module.exports = auth