const connectDB = require('./database');
const { KokoroDataModel } = require('./schemaModels');

// 直近5回分のココロデータを取得し、StaffIDごとに評価
async function calculateKokoroRisk(staffIdAdmin) {
  try {
    connectDB();

// セッションストレージからstaffIdAdminを取得
// const staffIdAdmin = sessionStorage.getItem("staffIdAdmin");
// const staffIdAdmin = "6528a4add7aedd3f2d4e7a3b"

// staffIdAdminと一致するデータを取得するためのクエリ
const fiveRecentKokoroData = await KokoroDataModel.find({ staffId: staffIdAdmin })
    .sort({ date: -1 }) // date フィールドで降順にソート
    .limit(5); // 最新の5つのデータを取得

    const staffIdRisk = fiveRecentKokoroData[0].staffId;

  console.log(fiveRecentKokoroData);

  // matchingKokoroDataからkokoroStateを取り出して平均値を計算
  const kokoroStates = fiveRecentKokoroData.map(data => data.kokoroState);
  const sum = kokoroStates.reduce((acc, value) => acc + value, 0);
  const averageKokoroState = sum / kokoroStates.length;
  console.log(averageKokoroState)

  // averageKokoroStateの値に応じてkokoroRiskを設定
  let kokoroRisk = '';

  if (averageKokoroState >= 7) {
    kokoroRisk = 'KokoroGood';
  } else if (averageKokoroState <= 4) {
    kokoroRisk = 'KokoroBad';
  } else {
    kokoroRisk = 'KokoroNeutral';
  }

      console.log(`StaffIDRisk: ${staffIdRisk}, KokoroRisk: ${kokoroRisk}`);
      console.log('ココロリスクが計算されました');
      return kokoroRisk;
    } catch (err) {
      console.error('ココロリスクが計算できませんでした:', err);
    }
}

module.exports = calculateKokoroRisk;