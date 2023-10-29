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
const { AdminUserModel, StaffUserModel, KokoroDataModel, ShiftModel, WageUpDataModel } = require("./utils/schemaModels")
const calculateKokoroRisk = require('./utils/kokoroRisk');


// シフト管理
// スタッフ選択
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
    res.status(500).json({ message: "シフトが保存できませんでした" });
  }
});

// シフト読み取り
app.get('/admin/shift/read', async (req, res) => {
  try {
    connectDB()
    const shifts = await ShiftModel.find();
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'シフトの読み込みに失敗しました' });
  }
});

// シフト削除
app.delete('/admin/shift/delete/:eventId', async (req, res) => {
  try {
    connectDB()
    const eventId = req.params.eventId;
    const deletedEvent = await ShiftModel.findByIdAndDelete(eventId);

    if (deletedEvent) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'シフトが見つかりません' });
    }
  } catch (error) {
    console.error('シフトの削除に失敗しました:', error);
    res.status(500).json({ message: 'シフトの削除に失敗しました' });
  }
});

// バックエンドでStaffUserModelを使用してスタッフ名を取得するエンドポイントを追加
app.get('/admin/staff/get-name/:staffId', async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const staff = await StaffUserModel.findById(staffId);
    if (staff) {
      res.status(200).json({ name: staff.name });
    } else {
      res.status(404).json({ message: 'スタッフが見つかりません' });
    }
  } catch (error) {
    res.status(500).json({ message: 'スタッフ名の取得に失敗しました', error: error });
  }
});

// ココロシフト時給アップ登録
app.post("/admin/shift/wage-up/register", async (req, res) => {
  const { wageUp } = req.body;
  console.log(wageUp)

  try {
    connectDB()
    const newWageUp = new WageUpDataModel({ wageUp: wageUp });
    await newWageUp.save();
    res.json({ message: "ココロシフト時給アップが正常に登録されました" });
  } catch (error) {
    res.status(500).json({ error: "ココロシフト時給アップの登録中にエラーが発生しました" });
  }
});

// ココロシフト時給アップ読み取り
app.get('/admin/shift/wage-up/read', async (req, res) => {
  try {
    connectDB()
    const wageUp = await WageUpDataModel.find();
    res.status(200).json(wageUp);
  } catch (error) {
    res.status(500).json({ message: 'ココロシフト時給アップの読み込みに失敗しました' });
  }
});


// ココロリスク
// 「ココロポイント」を保存
app.post("/staff/kokoro/state/:staffId", async (req, res) => {

  const staffId = req.params.staffId;

  try {
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

// ココロリスク計算
app.get('/admin/kokoro-risk/calculate/:staffIdAdmin', async (req, res) => {

  const staffIdAdmin = req.params.staffIdAdmin;

  try {
    const riskData = await calculateKokoroRisk(staffIdAdmin); // calculateKokoroRisk 関数を staffIdAdmin と共に実行

    if (riskData) {
      res.json({ kokoroRisk: riskData }); // リスクデータから kokoroRisk をフロントに返す
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
    connectDB();

    const { eventId } = req.params;
    const newTitle = 'ココロシフト申請中';

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
app.patch('/admin/kokoro-shift/agreement/:eventId/:staffIdAdmin/:latestWageUp', async (req, res) => {
  try {
    connectDB();
    const { eventId } = req.params;
    const { staffIdAdmin } = req.params;
    const { latestWageUp } = req.params;
    const newTitle = 'ココロシフト';
    const newStaffIdAdmin = staffIdAdmin;

    const updatedEvent = await ShiftModel.findByIdAndUpdate(
      eventId,
      { title: newTitle, staffIdAdmin: newStaffIdAdmin, wageUp: latestWageUp },
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

// ココロシフト追加
app.post("/admin/shift-management/:staffIdAdmin/:startTime/:endTime/:latestWageUp", async (req, res) => {

  const { startTime } = req.params;
  const { endTime } = req.params;
  const { latestWageUp } = req.params;
  const staffIdAdmin = req.params.staffIdAdmin;

  const title = `ココロシフト`;

  try {
    connectDB()
    const Shift = new ShiftModel({ startTime: startTime, endTime: endTime, staffIdAdmin: staffIdAdmin,
    title: title, wageUp: latestWageUp });
    await Shift.save();

    res.status(200).json({ message: "ココロシフトが保存されました" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "ココロシフトが保存できませんでした" });
  }
});

// ココロシフト却下
app.patch('/admin/kokoro-shift/dismiss/:eventId', async (req, res) => {
  try {
    connectDB();
    const { eventId } = req.params;
    const newTitle = 'シフト';

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


//ユーザー
//オーナー登録
app.post("/admin/user/register", async(req, res) => {
  try{
    await connectDB()
    await AdminUserModel.create(req.body)
    return res.status(200).json({message: "ユーザー登録成功"})
  }catch(err){
    return res.status(400).json({message: "ユーザー登録失敗"})
  }
})

//オーナーログイン
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
      return res.status(400).json({message: "ログイン失敗: ユーザー登録をしてください"})
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
        const staffName = savedStaffUserData.name;

        const staffToken = jwt.sign(payload, staff_secret_key, {expiresIn: "23h"})
        return res.status(200).json({message: "ログイン成功", staffToken, tokenType: "staff-token", staffId, staffName})
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