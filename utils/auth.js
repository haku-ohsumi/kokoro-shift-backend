const jwt = require("jsonwebtoken");
const admin_secret_key = "admin-secret"; // 管理者トークン用のシークレットキー
const staff_secret_key = "staff-secret"; // スタッフトークン用のシークレットキー

const auth = async (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }

  const tokenType = req.headers["token-type"]; // トークンの種類をヘッダーから取得

  if (!tokenType) {
    return res.status(400).json({ message: "トークンタイプが指定されていません" });
  }

  const token = req.headers.authorization.split(" ")[1];
  
  if (!token) {
    return res.status(400).json({ message: "トークンがありません" });
  }

  let secretKey;

  // トークンの種類に応じてシークレットキーを選択
  if (tokenType === "admin-token") {
    secretKey = admin_secret_key;
  } else if (tokenType === "staff-token") {
    secretKey = staff_secret_key;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.body.email = decoded.email;
    return next();
  } catch (err) {
    return res.status(400).json({ message: "トークンが正しくないので、ログインしてください" });
  }
};

module.exports = auth;
