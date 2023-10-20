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
const calculateKokoroRisk = require('./utils/kokoroRisk');

// スタッフ選択画面
// スタッフユーザーデータを取得するエンドポイント
app.get("/admin/staff/select", async (req, res) => {
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
app.post("/admin/:staffIdAdmin/shift-management", async (req, res) => {

  const staffIdAdmin = req.params.staffIdAdmin;

  try {
    connectDB()
    const { startTime, endTime,} = req.body;

    const Shift = new ShiftModel({ startTime, endTime, staffIdAdmin: staffIdAdmin,
    title: "シフト" });
    await Shift.save();

    res.status(200).json({ message: "シフトが保存されました" });
  } catch (error) {
    console.error("Error:", error);
    console.log( staffIdAdmin )
    res.status(500).json({ message: "シフトが保存できませんでした" });
  }
});

// シフト読み取り
app.get('/admin/shift/read', async (req, res) => {
  try {
    connectDB()
    const shifts = await ShiftModel.find(); // データベースからシフトを取得
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'シフトの読み込みに失敗しました' });
  }
});

// イベント削除のAPIエンドポイント
app.delete('/admin/shift/delete/:eventId', async (req, res) => {
  try {
    connectDB()
    const eventId = req.params.eventId;
    // データベースから該当のイベントを削除
    const deletedEvent = await ShiftModel.findByIdAndDelete(eventId);

    if (deletedEvent) {
      res.status(204).send(); // 204 No Contentを返す
    } else {
      res.status(404).json({ message: 'シフトが見つかりません' });
    }
  } catch (error) {
    console.error('シフトの削除に失敗しました:', error);
    res.status(500).json({ message: 'シフトの削除に失敗しました' });
  }
});


// ココロリスク
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

    return res.status(200).json({ message: "シフトが正常に保存されました" });
  } catch (error) {
    return res.status(500).json({ message: "シフトの保存中にエラーが発生しました" });
  }
});

// リスクを計算するエンドポイント
app.get('/api/calculate-kokoro-risk/:staffIdAdmin', async (req, res) => {

  const staffIdAdmin = req.params.staffIdAdmin;

  try {
    console.log(staffIdAdmin)
    const riskData = await calculateKokoroRisk(staffIdAdmin); // calculateKokoroRisk 関数を staffIdAdmin と共に実行

    if (riskData) {
      res.json({ kokoroRisk: riskData }); // リスクデータから kokoroRisk をフロントに返す
      console.log(riskData)
    } else {
      res.status(404).json({ error: '該当のリスクデータが見つかりません' });
    }
  } catch (error) {
    console.error('ココロリスクの取得に失敗しました:', error);
    res.status(500).json({ error: 'ココロリスクの取得に失敗しました' });
  }
});

// ココロシフト
// ココロシフト申請
app.patch('/admin/kokoro-shift/application/:eventId', async (req, res) => {
  try {
    connectDB(); // データベースに接続

    const { eventId } = req.params;
    const newTitle = 'ココロシフト申請中'; // 新しいタイトル

    // 指定されたイベントIDを持つイベントをデータベースから検索してタイトルを更新
    const updatedEvent = await ShiftModel.findByIdAndUpdate(
      eventId,
      { title: newTitle },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'イベントが見つかりません' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'イベントの更新に失敗しました' });
  }
});

// ココロシフト承認
app.patch('/admin/kokoro-shift/agreement/:eventId/:staffIdAdmin', async (req, res) => {
  try {
    connectDB(); // データベースに接続
    const { eventId } = req.params;
    const { staffIdAdmin } = req.params;
    const newTitle = 'シフト'; // 新しいタイトル
    const newStaffIdAdmin = staffIdAdmin; // 新しいタイトル

    // 指定されたイベントIDを持つイベントをデータベースから検索してタイトルを更新
    const updatedEvent = await ShiftModel.findByIdAndUpdate(
      eventId,
      { title: newTitle, staffIdAdmin: newStaffIdAdmin },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'イベントが見つかりません' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'イベントの更新に失敗しました' });
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