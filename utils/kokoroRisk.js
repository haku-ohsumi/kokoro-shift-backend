const connectDB = require('./database');
const { KokoroDataModel } = require('./schemaModels');

// 直近5回分のココロデータを取得し、StaffIDごとに評価
async function calculateKokoroRisk(staffIdAdmin) {
  try {
    connectDB();

// staffIdAdminと一致するデータを取得するためのクエリ
const fiveRecentKokoroData = await KokoroDataModel.find({ staffId: staffIdAdmin })
    .sort({ date: -1 }) // date フィールドで降順にソート
    .limit(5); // 最新の5つのデータを取得

    const staffIdRisk = fiveRecentKokoroData[0].staffId;


  // matchingKokoroDataからkokoroStateを取り出して平均値を計算
  const kokoroStates = fiveRecentKokoroData.map(data => data.kokoroState);
  const sum = kokoroStates.reduce((acc, value) => acc + value, 0);
  const averageKokoroState = sum / kokoroStates.length;

  // averageKokoroStateの値に応じてkokoroRiskを設定
  let kokoroRisk = '';

  if (averageKokoroState >= 7) {
    kokoroRisk = 'KokoroGood';
  } else if (averageKokoroState <= 4) {
    kokoroRisk = 'KokoroBad';
  } else {
    kokoroRisk = 'KokoroNeutral';
  }
      console.log('ココロリスクが計算されました');
      return kokoroRisk;
    } catch (err) {
      console.error('ココロリスクが計算できませんでした:', err);
    }
}

module.exports = calculateKokoroRisk;