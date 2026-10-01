/*
 * RF Band Calculator — 計算核心 (core.js)
 * 4G LTE / 5G NR / Wi-Fi / GNSS / Cable Loss / FSPL
 * 與 Windows 版 v1.3.0 同源資料，計算結果逐列一致。
 */
(function (root) {
  'use strict';

  const DATA = {"lte":[[1,"FDD",2110,2170,0,1920,1980,18000,[5,10,15,20],"2100 IMT"],[2,"FDD",1930,1990,600,1850,1910,18600,[1.4,3,5,10,15,20],"1900 PCS"],[3,"FDD",1805,1880,1200,1710,1785,19200,[1.4,3,5,10,15,20],"1800+ DCS"],[4,"FDD",2110,2155,1950,1710,1755,19950,[1.4,3,5,10,15,20],"AWS-1"],[5,"FDD",869,894,2400,824,849,20400,[1.4,3,5,10],"850 CLR"],[6,"FDD",875,885,2650,830,840,20650,[5,10],"UMTS 800 (JP)"],[7,"FDD",2620,2690,2750,2500,2570,20750,[5,10,15,20],"2600 IMT-E"],[8,"FDD",925,960,3450,880,915,21450,[1.4,3,5,10],"900 E-GSM"],[9,"FDD",1844.9,1879.9,3800,1749.9,1784.9,21800,[5,10,15,20],"1800 (JP)"],[10,"FDD",2110,2170,4150,1710,1770,22150,[5,10,15,20],"Extended AWS"],[11,"FDD",1475.9,1495.9,4750,1427.9,1447.9,22750,[5,10],"1500 Lower (JP)"],[12,"FDD",729,746,5010,699,716,23010,[1.4,3,5,10],"700 a"],[13,"FDD",746,756,5180,777,787,23180,[5,10],"700 c"],[14,"FDD",758,768,5280,788,798,23280,[5,10],"700 PS"],[17,"FDD",734,746,5730,704,716,23730,[5,10],"700 b"],[18,"FDD",860,875,5850,815,830,23850,[5,10,15],"800 Lower (JP)"],[19,"FDD",875,890,6000,830,845,24000,[5,10,15],"800 Upper (JP)"],[20,"FDD",791,821,6150,832,862,24150,[5,10,15,20],"800 DD"],[21,"FDD",1495.9,1510.9,6450,1447.9,1462.9,24450,[5,10,15],"1500 Upper (JP)"],[22,"FDD",3510,3590,6600,3410,3490,24600,[5,10,15,20],"3500"],[23,"FDD",2180,2200,7500,2000,2020,25500,[1.4,3,5,10,15,20],"2000 S-band"],[24,"FDD",1525,1559,7700,1626.5,1660.5,25700,[5,10],"1600 L-band"],[25,"FDD",1930,1995,8040,1850,1915,26040,[1.4,3,5,10,15,20],"1900+ Ext. PCS"],[26,"FDD",859,894,8690,814,849,26690,[1.4,3,5,10,15],"850+ Ext. CLR"],[27,"FDD",852,869,9040,807,824,27040,[1.4,3,5,10],"800 SMR"],[28,"FDD",758,803,9210,703,748,27210,[3,5,10,15,20],"700 APT"],[29,"SDL",717,728,9660,null,null,null,[3,5,10],"700 d"],[30,"FDD",2350,2360,9770,2305,2315,27660,[5,10],"2300 WCS"],[31,"FDD",462.5,467.5,9870,452.5,457.5,27760,[1.4,3,5],"450"],[32,"SDL",1452,1496,9920,null,null,null,[5,10,15,20],"1500 L-band"],[33,"TDD",1900,1920,36000,null,null,null,[5,10,15,20],"TD 1900"],[34,"TDD",2010,2025,36200,null,null,null,[5,10,15],"TD 2000"],[35,"TDD",1850,1910,36350,null,null,null,[1.4,3,5,10,15,20],"TD PCS Lower"],[36,"TDD",1930,1990,36950,null,null,null,[1.4,3,5,10,15,20],"TD PCS Upper"],[37,"TDD",1910,1930,37550,null,null,null,[5,10,15,20],"TD PCS Center"],[38,"TDD",2570,2620,37750,null,null,null,[5,10,15,20],"TD 2600"],[39,"TDD",1880,1920,38250,null,null,null,[5,10,15,20],"TD 1900+"],[40,"TDD",2300,2400,38650,null,null,null,[5,10,15,20],"TD 2300"],[41,"TDD",2496,2690,39650,null,null,null,[5,10,15,20],"TD 2500"],[42,"TDD",3400,3600,41590,null,null,null,[5,10,15,20],"TD 3500"],[43,"TDD",3600,3800,43590,null,null,null,[5,10,15,20],"TD 3700"],[44,"TDD",703,803,45590,null,null,null,[3,5,10,15,20],"TD 700 APT"],[45,"TDD",1447,1467,46590,null,null,null,[5,10,15,20],"TD 1500"],[46,"TDD",5150,5925,46790,null,null,null,[10,20],"TD Unlicensed (LAA)"],[47,"TDD",5855,5925,54540,null,null,null,[10,20],"TD V2X"],[48,"TDD",3550,3700,55240,null,null,null,[5,10,15,20],"TD 3600 CBRS"],[49,"TDD",3550,3700,56740,null,null,null,[10,20],"TD 3600 sLAA"],[50,"TDD",1432,1517,58240,null,null,null,[3,5,10,15,20],"TD 1500+"],[51,"TDD",1427,1432,59090,null,null,null,[3,5],"TD 1500-"],[52,"TDD",3300,3400,59140,null,null,null,[5,10,15,20],"TD 3300"],[53,"TDD",2483.5,2495,60140,null,null,null,[1.4,3,5,10],"TD 2500 S-band"],[65,"FDD",2110,2200,65536,1920,2010,131072,[1.4,3,5,10,15,20],"2100+"],[66,"FDD",2110,2200,66436,1710,1780,131972,[1.4,3,5,10,15,20],"AWS-3"],[67,"SDL",738,758,67336,null,null,null,[5,10,15,20],"700 EU"],[68,"FDD",753,783,67536,698,728,132672,[5,10,15],"700 ME"],[69,"SDL",2570,2620,67836,null,null,null,[5,10,15,20],"2600 SDL"],[70,"FDD",1995,2020,68336,1695,1710,132972,[5,10,15,20],"AWS-4"],[71,"FDD",617,652,68586,663,698,133122,[5,10,15,20],"600"],[72,"FDD",461,466,68936,451,456,133472,[1.4,3,5],"450 PMR/PAMR"],[73,"FDD",460,465,68986,450,455,133522,[1.4,3,5],"450 APAC"],[74,"FDD",1475,1518,69036,1427,1470,133572,[1.4,3,5,10,15,20],"L-band"],[75,"SDL",1432,1517,69466,null,null,null,[5,10,15,20],"1500+ SDL"],[76,"SDL",1427,1432,70316,null,null,null,[5],"1500- SDL"],[85,"FDD",728,746,70366,698,716,134002,[5,10],"700 a+"],[87,"FDD",420,425,70546,410,415,134182,[1.4,3,5],"410"],[88,"FDD",422,427,70596,412,417,134232,[1.4,3,5],"410+"]],"nr":[[1,"FDD",1920,1980,2110,2170,[100],[15,30],[5,10,15,20,25,30,35,40,45,50],"2100 IMT"],[2,"FDD",1850,1910,1930,1990,[100],[15,30],[5,10,15,20,25,30,35,40],"1900 PCS"],[3,"FDD",1710,1785,1805,1880,[100],[15,30],[5,10,15,20,25,30,35,40,45,50],"1800 DCS"],[5,"FDD",824,849,869,894,[100],[15,30],[5,10,15,20,25],"850"],[7,"FDD",2500,2570,2620,2690,[100],[15,30],[5,10,15,20,25,30,35,40,45,50],"2600 IMT-E"],[8,"FDD",880,915,925,960,[100],[15,30],[5,10,15,20,35],"900 GSM"],[12,"FDD",699,716,729,746,[100],[15,30],[5,10,15],"700 a"],[13,"FDD",777,787,746,756,[100],[15,30],[5,10],"700 c"],[14,"FDD",788,798,758,768,[100],[15,30],[5,10],"700 PS"],[18,"FDD",815,830,860,875,[100],[15,30],[5,10,15],"800 Lower (JP)"],[20,"FDD",832,862,791,821,[100],[15,30],[5,10,15,20],"800 DD"],[24,"FDD",1626.5,1660.5,1525,1559,[100],[15,30],[5,10],"1600 L-band"],[25,"FDD",1850,1915,1930,1995,[100],[15,30],[5,10,15,20,25,30,35,40,45],"1900+ Ext. PCS"],[26,"FDD",814,849,859,894,[100],[15,30],[5,10,15,20],"850+"],[28,"FDD",703,748,758,803,[100],[15,30],[5,10,15,20,30,40],"700 APT"],[29,"SDL",null,null,717,728,[100],[15,30],[5,10],"700 d"],[30,"FDD",2305,2315,2350,2360,[100],[15,30],[5,10],"2300 WCS"],[34,"TDD",null,null,2010,2025,[100],[15,30,60],[5,10,15],"TD 2000"],[38,"TDD",null,null,2570,2620,[100],[15,30,60],[5,10,15,20,25,30,40],"TD 2600"],[39,"TDD",null,null,1880,1920,[100],[15,30,60],[5,10,15,20,25,30,40],"TD 1900+"],[40,"TDD",null,null,2300,2400,[100],[15,30,60],[5,10,15,20,25,30,40,50,60,70,80,90,100],"TD 2300"],[41,"TDD",null,null,2496,2690,[15,30],[15,30,60],[10,15,20,25,30,40,50,60,70,80,90,100],"TD 2500"],[46,"TDD",null,null,5150,5925,[15,30],[15,30,60],[10,20,40,60,80],"TD Unlicensed 5 GHz"],[47,"TDD",null,null,5855,5925,[15,30],[15,30,60],[10,20,30,40],"TD V2X"],[48,"TDD",null,null,3550,3700,[15,30],[15,30,60],[5,10,15,20,25,30,40,50,60,70,80,90,100],"TD 3600 CBRS"],[50,"TDD",null,null,1432,1517,[100],[15,30,60],[5,10,15,20,25,30,40,50,60,70,80],"TD 1500+"],[51,"TDD",null,null,1427,1432,[100],[15,30],[5],"TD 1500-"],[53,"TDD",null,null,2483.5,2495,[100],[15,30],[5,10],"TD 2500 S-band"],[65,"FDD",1920,2010,2110,2200,[100],[15,30],[5,10,15,20,25,30,35,40,45,50],"2100+"],[66,"FDD",1710,1780,2110,2200,[100],[15,30],[5,10,15,20,25,30,35,40,45],"AWS-3"],[67,"SDL",null,null,738,758,[100],[15,30],[5,10,15,20],"700 EU"],[70,"FDD",1695,1710,1995,2020,[100],[15,30],[5,10,15,20,25],"AWS-4"],[71,"FDD",663,698,617,652,[100],[15,30],[5,10,15,20,25,30,35],"600"],[74,"FDD",1427,1470,1475,1518,[100],[15,30],[5,10,15,20],"L-band"],[75,"SDL",null,null,1432,1517,[100],[15,30],[5,10,15,20,25,30,40,50],"1500+ SDL"],[76,"SDL",null,null,1427,1432,[100],[15,30],[5],"1500- SDL"],[77,"TDD",null,null,3300,4200,[15,30],[15,30,60],[10,15,20,25,30,40,50,60,70,80,90,100],"TD 3700 C-Band"],[78,"TDD",null,null,3300,3800,[15,30],[15,30,60],[10,15,20,25,30,40,50,60,70,80,90,100],"TD 3500"],[79,"TDD",null,null,4400,5000,[15,30],[15,30,60],[40,50,60,70,80,90,100],"TD 4700"],[80,"SUL",1710,1785,null,null,[100],[15,30],[5,10,15,20,25,30,35,40],"1800 SUL"],[81,"SUL",880,915,null,null,[100],[15,30],[5,10,15,20],"900 SUL"],[82,"SUL",832,862,null,null,[100],[15,30],[5,10,15,20],"800 SUL"],[83,"SUL",703,748,null,null,[100],[15,30],[5,10,15,20,30,40],"700 SUL"],[84,"SUL",1920,1980,null,null,[100],[15,30],[5,10,15,20,25,30,35,40,45,50],"2000 SUL"],[85,"FDD",698,716,728,746,[100],[15,30],[5,10,15],"700 a+"],[86,"SUL",1710,1780,null,null,[100],[15,30],[5,10,15,20,25,30,35,40],"1700 SUL"],[89,"SUL",824,849,null,null,[100],[15,30],[5,10,15,20],"850 SUL"],[90,"TDD",null,null,2496,2690,[15,30],[15,30,60],[10,15,20,25,30,40,50,60,70,80,90,100],"TD 2500"],[95,"SUL",2010,2025,null,null,[100],[15,30],[5,10,15],"2100 SUL"],[96,"TDD",null,null,5925,7125,[15,30],[15,30,60],[20,40,60,80],"TD 6 GHz Unlicensed"],[97,"SUL",2300,2400,null,null,[100],[15,30],[5,10,15,20,25,30,40,50,60,70,80,90,100],"2300 SUL"],[98,"SUL",1880,1920,null,null,[100],[15,30],[5,10,15,20,25,30,40],"1900 SUL"],[100,"FDD",874.4,880,919.4,925,[100],[15,30],[5],"900 RMR"],[101,"TDD",null,null,1900,1910,[100],[15,30],[5,10],"TD 1900 RMR"],[102,"TDD",null,null,5925,6425,[15,30],[15,30,60],[20,40,60,80],"TD 6 GHz Lower"],[104,"TDD",null,null,6425,7125,[15,30],[15,30,60],[20,40,60,80,100],"TD 6.4–7.1 GHz"],[105,"FDD",663,703,612,652,[100],[15,30],[5,10,15,20,25,30,35],"600+"],[257,"TDD",null,null,26500,29500,[60,120],[60,120],[50,100,200,400],"28 GHz"],[258,"TDD",null,null,24250,27500,[60,120],[60,120],[50,100,200,400],"26 GHz"],[259,"TDD",null,null,39500,43500,[60,120],[60,120],[50,100,200,400],"41 GHz"],[260,"TDD",null,null,37000,40000,[60,120],[60,120],[50,100,200,400],"39 GHz"],[261,"TDD",null,null,27500,28350,[60,120],[60,120],[50,100,200,400],"28 GHz US"],[262,"TDD",null,null,47200,48200,[60,120],[60,120],[50,100,200,400],"47 GHz"]],"nrNRB":{"FR1":{"15":{"5":25,"10":52,"15":79,"20":106,"25":133,"30":160,"35":188,"40":216,"45":242,"50":270},"30":{"5":11,"10":24,"15":38,"20":51,"25":65,"30":78,"35":92,"40":106,"45":119,"50":133,"60":162,"70":189,"80":217,"90":245,"100":273},"60":{"10":11,"15":18,"20":24,"25":31,"30":38,"35":44,"40":51,"45":58,"50":65,"60":79,"70":93,"80":107,"90":121,"100":135}},"FR2":{"60":{"50":66,"100":132,"200":264},"120":{"50":32,"100":66,"200":132,"400":264}}},"lteNRB":{"1.4":6,"3":15,"5":25,"10":50,"15":75,"20":100},"itu":[[1164.0,1215.0,"1164 – 1215 MHz（RNSS ＋ ARNS 航空無線電導航）"],[1215.0,1300.0,"1215 – 1300 MHz（RNSS ＋ 無線電定位／雷達）"],[1559.0,1610.0,"1559 – 1610 MHz（RNSS ＋ ARNS 航空無線電導航）"],[2483.5,2500.0,"2483.5 – 2500 MHz（RNSS，S 頻段）"]],"gnssSystems":[["GPS","美國","全球","CDMA"],["GLONASS","俄羅斯","全球","FDMA（L1OF / L2OF）＋ CDMA（L1OC / L2OC / L3OC）"],["Galileo","歐盟","全球","CDMA"],["BDS","中國（北斗）","全球（BDS-3）","CDMA"],["QZSS","日本（準天頂）","區域（亞太）","CDMA"],["NavIC","印度（IRNSS）","區域（印度及周邊約 1500 km）","CDMA"]],"gnssSignals":{"GPS":[{"name":"L1 (C/A, L1C)","fc":1575.42,"bw":20.46,"est":false,"doc":"IS-GPS-200 / IS-GPS-800","note":"C/A、L1C 民用；P(Y) 軍用","fdma":null,"band":null},{"name":"L2 (L2C)","fc":1227.6,"bw":20.46,"est":false,"doc":"IS-GPS-200","note":"L2C 民用；P(Y) 軍用","fdma":null,"band":null},{"name":"L5","fc":1176.45,"bw":24.0,"est":false,"doc":"IS-GPS-705","note":"L5 民用（航空生命安全）","fdma":null,"band":null}],"GLONASS":[{"name":"L1OF (G1 FDMA)","fc":1602.0,"bw":1.022,"est":false,"doc":"GLONASS ICD Ed. 5.1","note":"FDMA，每頻道 C/A 碼頻寬 ±0.511 MHz","fdma":[1602.0,0.5625,-7,6],"band":null},{"name":"L2OF (G2 FDMA)","fc":1246.0,"bw":1.022,"est":false,"doc":"GLONASS ICD Ed. 5.1","note":"FDMA，每頻道 C/A 碼頻寬 ±0.511 MHz","fdma":[1246.0,0.4375,-7,6],"band":null},{"name":"L1OC","fc":1600.995,"bw":4.092,"est":true,"doc":"GLONASS CDMA ICD (L1)","note":"CDMA 開放訊號","fdma":null,"band":null},{"name":"L2OC","fc":1248.06,"bw":4.092,"est":true,"doc":"GLONASS CDMA ICD (L2)","note":"CDMA 開放訊號","fdma":null,"band":null},{"name":"L3OC","fc":1202.025,"bw":20.46,"est":true,"doc":"GLONASS CDMA ICD (L3)","note":"CDMA 開放訊號（10.23 Mcps）","fdma":null,"band":null}],"Galileo":[{"name":"E1","fc":1575.42,"bw":24.552,"est":false,"doc":"Galileo OS SIS ICD","note":"OS 開放服務 ／ PRS","fdma":null,"band":null},{"name":"E5 (AltBOC)","fc":1191.795,"bw":51.15,"est":false,"doc":"Galileo OS SIS ICD","note":"E5a ＋ E5b 寬頻訊號","fdma":null,"band":null},{"name":"E5a","fc":1176.45,"bw":20.46,"est":false,"doc":"Galileo OS SIS ICD","note":"OS 開放服務","fdma":null,"band":null},{"name":"E5b","fc":1207.14,"bw":20.46,"est":false,"doc":"Galileo OS SIS ICD","note":"OS 開放服務 ／ 完好性","fdma":null,"band":null},{"name":"E6","fc":1278.75,"bw":40.92,"est":false,"doc":"Galileo E6-B/C SIS ICD","note":"HAS 高精度服務 ／ CAS","fdma":null,"band":null}],"BDS":[{"name":"B1I","fc":1561.098,"bw":4.092,"est":false,"doc":"BDS SIS ICD B1I","note":"公開服務（BDS-2 / BDS-3）","fdma":null,"band":null},{"name":"B1C","fc":1575.42,"bw":32.736,"est":false,"doc":"BDS SIS ICD B1C","note":"公開服務（BDS-3）","fdma":null,"band":null},{"name":"B2a","fc":1176.45,"bw":20.46,"est":false,"doc":"BDS SIS ICD B2a","note":"公開服務（BDS-3）","fdma":null,"band":null},{"name":"B2b","fc":1207.14,"bw":20.46,"est":false,"doc":"BDS SIS ICD B2b","note":"公開服務 ／ PPP（BDS-3）","fdma":null,"band":null},{"name":"B2I","fc":1207.14,"bw":4.092,"est":false,"doc":"BDS SIS ICD B2I","note":"公開服務（BDS-2，逐步停用）","fdma":null,"band":null},{"name":"B3I","fc":1268.52,"bw":20.46,"est":false,"doc":"BDS SIS ICD B3I","note":"公開服務（BDS-2 / BDS-3）","fdma":null,"band":null}],"QZSS":[{"name":"L1 (C/A, L1C, L1S)","fc":1575.42,"bw":24.0,"est":false,"doc":"IS-QZSS-PNT","note":"與 GPS 相容；L1S 為 SLAS 增強","fdma":null,"band":null},{"name":"L2C","fc":1227.6,"bw":24.0,"est":false,"doc":"IS-QZSS-PNT","note":"L2C 民用","fdma":null,"band":null},{"name":"L5","fc":1176.45,"bw":24.9,"est":false,"doc":"IS-QZSS-PNT","note":"L5 民用","fdma":null,"band":null},{"name":"L6","fc":1278.75,"bw":42.0,"est":false,"doc":"IS-QZSS-L6","note":"CLAS 公分級增強 ／ MADOCA-PPP","fdma":null,"band":null}],"NavIC":[{"name":"L5","fc":1176.45,"bw":24.0,"est":false,"doc":"IRNSS SPS SIS ICD","note":"SPS 標準定位服務","fdma":null,"band":null},{"name":"S","fc":2492.028,"bw":16.5,"est":false,"doc":"IRNSS SPS SIS ICD","note":"SPS 標準定位服務（S 頻段）","fdma":null,"band":[2483.5,2500.0]}]},"coax":[["0.81 mm Normal",0.81,2.9,7.6],["0.81 mm Low Loss",0.81,2.3,6.0],["1.13 mm Normal",1.13,2.0,5.3],["1.13 mm Low Loss",1.13,1.6,4.2],["1.37 mm Normal",1.37,1.65,4.4],["1.37 mm Low Loss",1.37,1.3,3.5]]};

  // ---------------------------------------------------------------- 共用
  const C_LIGHT = 299792458.0;
  const DUPLEX_TXT = {
    FDD: 'FDD 分頻雙工', TDD: 'TDD 分時雙工',
    SDL: 'SDL 補充下行 (僅下行)', SUL: 'SUL 補充上行 (僅上行)',
  };

  /** 去除尾端 0 的固定小數：1842.500 → "1842.5" */
  function fmt(x, nd = 3) {
    let s = Number(x).toFixed(nd);
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return (s === '-0' || s === '') ? '0' : s;
  }
  const fixed = (x, nd) => Number(x).toFixed(nd);
  /** Python 的 :.4g */
  function g4(x) {
    x = Number(x);
    if (x === 0) return '0';
    const e = Number(x.toExponential(3).split('e')[1]);
    if (e < -4 || e >= 4) {   // 與 Python %g 相同：極小 / 極大值使用指數表示
      const [m, ex] = x.toExponential(3).split('e');
      const n = Number(ex);
      return m.replace(/\.?0+$/, '') + 'e' + (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(2, '0');
    }
    return String(Number(x.toPrecision(4)));
  }
  const r6 = (x) => Math.round(x * 1e6) / 1e6;
  const ceilI = (x) => Math.ceil(r6(x));
  const floorI = (x) => Math.floor(r6(x));
  const roundI = (x) => Math.floor(r6(x) + 0.5);
  const idiv = (a, b) => Math.floor(a / b);

  function dbmText(p) {
    const mw = Math.pow(10, p / 10);
    const scales = [[1e3, 'W'], [1, 'mW'], [1e-3, 'µW'], [1e-6, 'nW'], [1e-9, 'pW']];
    for (const [s, u] of scales) if (mw >= s) return `${g4(mw / s)} ${u}`;
    return `${g4(mw * 1e12)} fW`;
  }

  function distText(m) {
    if (m >= 1000) return `${g4(m / 1000)} km`;
    if (m >= 1) return `${g4(m)} m`;
    return `${g4(m * 100)} cm`;
  }

  // ---------------------------------------------------------------- 頻段資料
  const LTE_NRB = DATA.lteNRB;      // {"1.4":6, ...}
  const NR_NRB = DATA.nrNRB;        // {FR1:{"15":{"5":25}}}

  const LTE_BANDS = DATA.lte.map(([num, duplex, dlo, dhi, ndl, ulo, uhi, nul, bws, alias]) => {
    let ul = null, nU = null;
    if (duplex === 'TDD') { ul = [dlo, dhi]; nU = ndl; }
    else if (duplex === 'FDD') { ul = [ulo, uhi]; nU = nul; }
    return { tech: 'LTE', num, duplex, dl: [dlo, dhi], nDL: ndl, ul, nUL: nU, bws, alias,
             name: `B${num}`, fr: 'FR1', raster: [100], scs: [15] };
  });

  const NR_BANDS = DATA.nr.map(([num, duplex, ulo, uhi, dlo, dhi, raster, scs, bws, alias]) => {
    const dl = dlo !== null ? [dlo, dhi] : null;
    let ul = ulo !== null ? [ulo, uhi] : null;
    if (duplex === 'TDD') ul = dl;
    return { tech: 'NR', num, duplex, dl, ul, raster, scs, bws, alias,
             name: `n${num}`, fr: num >= 257 ? 'FR2' : 'FR1' };
  });

  // ---------------------------------------------------------------- NR 柵格
  function nrRegion(f) {
    if (f < 3000) return [0.0, 0, 5];
    if (f < 24250) return [3000.0, 600000, 15];
    return [24250.08, 2016667, 60];
  }
  function nrArfcnFloat(f) {
    const [fOff, nOff, dfg] = nrRegion(f);
    return nOff + (f - fOff) * 1000.0 / dfg;
  }
  function nrArfcnToFreq(n) {
    if (n < 600000) return n * 0.005;
    if (n < 2016667) return 3000.0 + (n - 600000) * 0.015;
    return 24250.08 + (n - 2016667) * 0.06;
  }

  // ---------------------------------------------------------------- LTE / NR
  const Cell = {
    bands: (tech) => (tech === 'LTE' ? LTE_BANDS : NR_BANDS),
    chName: (tech) => (tech === 'LTE' ? 'EARFCN' : 'NR-ARFCN'),
    label: (b) => `${b.name}   ${b.alias}   (${b.duplex})`,
    primary: (b) => (b.dl ? ['DL', b.dl] : ['UL', b.ul]),
    scsOptions: (b) => (b.tech === 'NR' ? b.scs.slice() : []),
    defaultScs(b) {
      if (b.tech === 'LTE') return 15;
      if (b.fr === 'FR2') return 120;
      return ['FDD', 'SDL', 'SUL'].includes(b.duplex) ? 15 : 30;
    },
    bwOptions(b, scs) {
      if (b.tech === 'LTE') return b.bws.slice();
      const t = (NR_NRB[b.fr] || {})[String(scs)] || {};
      return b.bws.filter((bw) => t[String(bw)] !== undefined);
    },
    defaultBw(b, scs) { const o = Cell.bwOptions(b, scs); return o.length ? Math.max(...o) : null; },
    raster(b, scs) {
      if (b.raster.length === 1 && b.raster[0] === 100) return 100;
      return b.raster.includes(scs) ? scs : b.raster[0];
    },
    step(b, scs) {
      if (b.tech === 'LTE') return 1;
      return idiv(Cell.raster(b, scs), nrRegion(Cell.primary(b)[1][0])[2]);
    },
    anchor(b, scs) {
      if (b.tech === 'LTE') return b.nDL;
      const lo = Cell.primary(b)[1][0];
      const nOff = nrRegion(lo)[1];
      const st = Cell.step(b, scs);
      let a = nOff + ceilI((nrArfcnFloat(lo) - nOff) / st) * st;
      while (a < nOff) a += st;
      return a;
    },
    bandChRange(b, scs) {
      if (b.tech === 'LTE') return [b.nDL, b.nDL + roundI((b.dl[1] - b.dl[0]) * 10) - 1];
      const hi = Cell.primary(b)[1][1];
      const a = Cell.anchor(b, scs), st = Cell.step(b, scs);
      const top = floorI(nrArfcnFloat(hi));
      return [a, a + idiv(top - a, st) * st];
    },
    chToFreq: (b, n) => (b.tech === 'LTE' ? b.dl[0] + (n - b.nDL) / 10.0 : nrArfcnToFreq(n)),
    chFloat: (b, f) => (b.tech === 'LTE' ? b.nDL + (f - b.dl[0]) * 10.0 : nrArfcnFloat(f)),
    align(b, scs, n) {
      const a = Cell.anchor(b, scs), st = Cell.step(b, scs);
      return a + roundI((n - a) / st) * st;
    },
    freqToCh(b, f, scs) {
      const a = Cell.anchor(b, scs), st = Cell.step(b, scs);
      return a + roundI((Cell.chFloat(b, f) - a) / st) * st;
    },
    validRange(b, bw, scs) {
      const [lo, hi] = Cell.primary(b)[1];
      if (bw === null || bw > (hi - lo) + 1e-9) return null;
      const a = Cell.anchor(b, scs), st = Cell.step(b, scs);
      const nmin = a + ceilI((Cell.chFloat(b, lo + bw / 2) - a) / st) * st;
      const nmax = a + floorI((Cell.chFloat(b, hi - bw / 2) - a) / st) * st;
      return nmin <= nmax ? [nmin, nmax] : null;
    },
    snap(b, bw, scs, n) {
      n = Cell.align(b, scs, n);
      const vr = Cell.validRange(b, bw, scs);
      return vr ? Math.min(Math.max(n, vr[0]), vr[1]) : n;
    },
    defaultCh(b, bw, scs) {
      const vr = Cell.validRange(b, bw, scs);
      if (!vr) return Cell.bandChRange(b, scs)[0];
      return Cell.snap(b, bw, scs, idiv(vr[0] + vr[1], 2));
    },
    summary(b) {
      const p = [];
      if (b.dl) p.push((b.duplex === 'TDD' ? '' : 'DL ') + `${fmt(b.dl[0])}–${fmt(b.dl[1])}`);
      if (b.ul && b.duplex !== 'TDD') p.push(`UL ${fmt(b.ul[0])}–${fmt(b.ul[1])}`);
      return p.join(' ／ ') + ` MHz · ${b.duplex}`;
    },
    compute(b, bw, n, scs) { return b.tech === 'LTE' ? lteCompute(b, bw, n) : nrCompute(b, bw, n, scs); },
  };

  function lteCompute(b, bw, n) {
    const rows = [], spec = [], warns = [];
    const [lo, hi] = b.dl;
    const [nLo, nHi] = Cell.bandChRange(b);
    const isTdd = b.duplex === 'TDD';
    const dlTag = isTdd ? '' : 'DL ';

    rows.push(['頻段資訊', null]);
    rows.push(['頻段', `Band ${b.num}（${b.alias}）`]);
    rows.push(['雙工模式', DUPLEX_TXT[b.duplex]]);
    rows.push([isTdd ? '頻率範圍' : '下行頻率 DL', `${fmt(lo)} – ${fmt(hi)} MHz（${fmt(hi - lo)} MHz）`]);
    if (b.duplex === 'FDD') {
      const [ulo, uhi] = b.ul;
      rows.push(['上行頻率 UL', `${fmt(ulo)} – ${fmt(uhi)} MHz（${fmt(uhi - ulo)} MHz）`]);
      rows.push(['雙工間距 (DL − UL)', `${fmt(lo - ulo)} MHz`]);
    }
    rows.push([`${dlTag}EARFCN 範圍`, `${nLo} – ${nHi}`]);
    if (b.duplex === 'FDD') {
      const [ulo, uhi] = b.ul;
      rows.push(['UL EARFCN 範圍', `${b.nUL} – ${b.nUL + roundI((uhi - ulo) * 10) - 1}`]);
    }
    rows.push(['N_Offs', `DL ${b.nDL}` + (b.duplex === 'FDD' ? ` ／ UL ${b.nUL}` : '')]);
    rows.push(['支援頻寬', b.bws.map((x) => fmt(x)).join(' / ') + ' MHz']);

    const nrb = LTE_NRB[String(bw)];
    const tx = nrb * 0.18;
    rows.push([`頻寬參數（${fmt(bw)} MHz）`, null]);
    rows.push(['資源區塊 N_RB', `${nrb} RB`]);
    rows.push(['子載波數', `${nrb * 12}（SCS 15 kHz）`]);
    rows.push(['傳輸頻寬', `${fmt(tx)} MHz（${nrb} × 180 kHz）`]);
    rows.push(['保護頻帶（單側）', `${fmt((bw - tx) / 2)} MHz`]);
    rows.push(['頻譜利用率', `${fixed(tx / bw * 100, 1)} %`]);
    const vr = Cell.validRange(b, bw, 15);
    if (vr) {
      rows.push([`可用 ${dlTag}EARFCN`, `${vr[0]} – ${vr[1]}`]);
      rows.push(['可用中心頻率', `${fmt(Cell.chToFreq(b, vr[0]))} – ${fmt(Cell.chToFreq(b, vr[1]))} MHz`]);
      rows.push(['可設定頻點數', `${vr[1] - vr[0] + 1}`]);
      if (!(vr[0] <= n && n <= vr[1])) warns.push('目前 EARFCN 的頻道邊緣超出頻段範圍，請調整 EARFCN 或頻寬。');
    }

    const f = Cell.chToFreq(b, n);
    rows.push(['頻道計算', null]);
    rows.push([`${dlTag}EARFCN`, String(n)]);
    rows.push([`${dlTag}中心頻率`, `${fmt(f)} MHz`]);
    rows.push([`${dlTag}頻道範圍`, `${fmt(f - bw / 2)} – ${fmt(f + bw / 2)} MHz`]);
    rows.push(['計算式', `${fmt(lo)} + 0.1 × (${n} − ${b.nDL}) = ${fmt(f)} MHz`]);
    spec.push({ label: isTdd ? 'DL / UL' : 'DL 下行', lo, hi, chan: [f - bw / 2, f + bw / 2], center: f });

    if (b.duplex === 'FDD') {
      const [ulo, uhi] = b.ul;
      const nUl = n - b.nDL + b.nUL;
      const fUl = ulo + (nUl - b.nUL) / 10.0;
      if (ulo - 1e-9 <= fUl - bw / 2 && fUl + bw / 2 <= uhi + 1e-9) {
        rows.push(['UL EARFCN', String(nUl)]);
        rows.push(['UL 中心頻率', `${fmt(fUl)} MHz`]);
        rows.push(['UL 頻道範圍', `${fmt(fUl - bw / 2)} – ${fmt(fUl + bw / 2)} MHz`]);
        spec.push({ label: 'UL 上行', lo: ulo, hi: uhi, chan: [fUl - bw / 2, fUl + bw / 2], center: fUl });
      } else {
        rows.push(['UL EARFCN', '—（此 DL 頻點無對應 UL，僅能作為 CA 下行）']);
        spec.push({ label: 'UL 上行', lo: ulo, hi: uhi });
      }
    }
    return { rows, spec, warns };
  }

  function nrUlRangeTxt(b, scs) {
    const [lo, hi] = b.ul;
    const [, nOff, dfg] = nrRegion(lo);
    const st = (b.raster.length === 1 && b.raster[0] === 100) ? idiv(100, dfg) : idiv(Cell.raster(b, scs), dfg);
    const a = nOff + ceilI((nrArfcnFloat(lo) - nOff) / st) * st;
    const top = floorI(nrArfcnFloat(hi));
    return `${a} – ${a + idiv(top - a, st) * st}（步進 ${st}）`;
  }

  function nrCompute(b, bw, n, scs) {
    const rows = [], spec = [], warns = [];
    const [pdir, [lo, hi]] = Cell.primary(b);
    const [nLo, nHi] = Cell.bandChRange(b, scs);
    const [fOff, nOff, dfg] = nrRegion(lo);
    const st = Cell.step(b, scs), rst = Cell.raster(b, scs);
    const isTdd = b.duplex === 'TDD';
    const tag = isTdd ? '' : `${pdir} `;

    rows.push(['頻段資訊', null]);
    rows.push(['頻段', `n${b.num}（${b.alias}）`]);
    rows.push(['頻率範圍分類', b.fr === 'FR1' ? 'FR1（410 – 7125 MHz）' : 'FR2（24250 – 52600 MHz，毫米波）']);
    rows.push(['雙工模式', DUPLEX_TXT[b.duplex]]);
    if (b.dl) rows.push([isTdd ? '頻率範圍' : '下行頻率 DL', `${fmt(b.dl[0])} – ${fmt(b.dl[1])} MHz（${fmt(b.dl[1] - b.dl[0])} MHz）`]);
    if (b.ul && !isTdd) rows.push(['上行頻率 UL', `${fmt(b.ul[0])} – ${fmt(b.ul[1])} MHz（${fmt(b.ul[1] - b.ul[0])} MHz）`]);
    if (b.duplex === 'FDD') rows.push(['雙工間距 (DL − UL)', `${fmt(b.dl[0] - b.ul[0])} MHz`]);
    rows.push([`${tag}NR-ARFCN 範圍`, `${nLo} – ${nHi}（步進 ${st}）`]);
    if (b.duplex === 'FDD') rows.push(['UL NR-ARFCN 範圍', nrUlRangeTxt(b, scs)]);
    rows.push(['通道柵格 ΔF_Raster', `${rst} kHz` + (b.raster.length > 1 ? '（支援 ' + b.raster.join(' / ') + ' kHz）' : '')]);
    rows.push(['全域柵格 ΔF_Global', `${dfg} kHz（F_REF-Offs ${fmt(fOff, 2)} MHz，N_REF-Offs ${nOff}）`]);
    rows.push(['支援 SCS', b.scs.join(' / ') + ' kHz']);
    rows.push(['支援頻寬', b.bws.join(' / ') + ' MHz']);

    const nrb = NR_NRB[b.fr][String(scs)][String(bw)];
    const txKhz = nrb * 12 * scs;
    const guard = (bw * 1000 - txKhz) / 2 - scs / 2;
    rows.push([`頻寬參數（${bw} MHz @ SCS ${scs} kHz）`, null]);
    rows.push(['資源區塊 N_RB', `${nrb} RB`]);
    rows.push(['子載波數', `${nrb * 12}`]);
    rows.push(['傳輸頻寬', `${fmt(txKhz / 1000)} MHz（${nrb} × 12 × ${scs} kHz）`]);
    rows.push(['最小保護頻帶', `${fmt(guard, 1)} kHz`]);
    rows.push(['頻譜利用率', `${fixed(txKhz / (bw * 1000) * 100, 1)} %`]);
    rows.push(['符號長度 / 時槽', `${fmt(1000 / scs, 2)} µs ／ ${fmt(1 / (scs / 15), 4)} ms`]);
    const vr = Cell.validRange(b, bw, scs);
    if (vr) {
      rows.push([`可用 ${tag}NR-ARFCN`, `${vr[0]} – ${vr[1]}（步進 ${st}）`]);
      rows.push(['可用中心頻率', `${fmt(nrArfcnToFreq(vr[0]))} – ${fmt(nrArfcnToFreq(vr[1]))} MHz`]);
      rows.push(['可設定頻點數', `${idiv(vr[1] - vr[0], st) + 1}`]);
      if (!(vr[0] <= n && n <= vr[1])) warns.push('目前 NR-ARFCN 的頻道邊緣超出頻段範圍，請調整 NR-ARFCN 或頻寬。');
    }

    const f = nrArfcnToFreq(n);
    rows.push(['頻道計算', null]);
    rows.push([`${tag}NR-ARFCN`, String(n)]);
    rows.push([`${tag}中心頻率 F_REF`, `${fmt(f)} MHz`]);
    rows.push([`${tag}頻道範圍`, `${fmt(f - bw / 2)} – ${fmt(f + bw / 2)} MHz`]);
    rows.push(['計算式', `${fmt(fOff, 2)} + ${String(dfg / 1000)} × (${n} − ${nOff}) = ${fmt(f)} MHz`]);
    const label = { TDD: 'DL / UL', SUL: 'UL (SUL)' }[b.duplex] || 'DL 下行';
    spec.push({ label, lo, hi, chan: [f - bw / 2, f + bw / 2], center: f });

    if (b.duplex === 'FDD') {
      const [ulo, uhi] = b.ul;
      const fUl = f - (b.dl[0] - ulo);
      if (ulo - 1e-9 <= fUl - bw / 2 && fUl + bw / 2 <= uhi + 1e-9) {
        const nUl = roundI(nrArfcnFloat(fUl));
        rows.push(['UL NR-ARFCN', String(nUl)]);
        rows.push(['UL 中心頻率', `${fmt(fUl)} MHz`]);
        rows.push(['UL 頻道範圍', `${fmt(fUl - bw / 2)} – ${fmt(fUl + bw / 2)} MHz`]);
        spec.push({ label: 'UL 上行', lo: ulo, hi: uhi, chan: [fUl - bw / 2, fUl + bw / 2], center: fUl });
      } else {
        rows.push(['UL NR-ARFCN', '—（此 DL 頻點無對應 UL，僅能作為 CA 下行）']);
        spec.push({ label: 'UL 上行', lo: ulo, hi: uhi });
      }
    }
    return { rows, spec, warns };
  }

  // ---------------------------------------------------------------- Wi-Fi
  const WIFI_5G_CH = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128,
    132, 136, 140, 144, 149, 153, 157, 161, 165, 169, 173, 177];
  const WIFI_5G_BLOCKS = {
    40: [38, 46, 54, 62, 102, 110, 118, 126, 134, 142, 151, 159, 167, 175],
    80: [42, 58, 106, 122, 138, 155, 171],
    160: [50, 114, 163],
  };
  const range = (a, b, s = 1) => { const r = []; for (let i = a; i <= b; i += s) r.push(i); return r; };
  const WIFI_BANDS = {
    '2.4 GHz': { span: [2400, 2495], ism: '2400 – 2483.5 MHz（ISM）', channels: range(1, 14),
      bws: ['20 MHz', '40 MHz'], std: '802.11b/g/n（Wi-Fi 4）/ ax（Wi-Fi 6）/ be（Wi-Fi 7）', defCh: 6, defBw: '20 MHz' },
    '5 GHz': { span: [5150, 5925], ism: '5150 – 5925 MHz（U-NII-1 ~ U-NII-4）', channels: WIFI_5G_CH,
      bws: ['20 MHz', '40 MHz', '80 MHz', '160 MHz'], std: '802.11a/n / ac（Wi-Fi 5）/ ax（Wi-Fi 6）/ be（Wi-Fi 7）', defCh: 36, defBw: '80 MHz' },
    '6 GHz': { span: [5925, 7125], ism: '5925 – 7125 MHz（U-NII-5 ~ U-NII-8）', channels: range(1, 233, 4),
      bws: ['20 MHz', '40 MHz', '80 MHz', '160 MHz', '320 MHz (320-1)', '320 MHz (320-2)'],
      std: '802.11ax（Wi-Fi 6E）/ be（Wi-Fi 7）', defCh: 37, defBw: '160 MHz' },
  };

  const WiFi = {
    bands: WIFI_BANDS,
    freq(band, ch) {
      if (band === '2.4 GHz') return ch === 14 ? 2484.0 : 2407.0 + 5 * ch;
      if (band === '5 GHz') return 5000.0 + 5 * ch;
      return 5950.0 + 5 * ch;
    },
    subband(band, ch) {
      if (band === '2.4 GHz') return 'ISM 2.4 GHz';
      if (band === '5 GHz') {
        for (const [top, name] of [[48, 'U-NII-1'], [64, 'U-NII-2A'], [144, 'U-NII-2C'], [165, 'U-NII-3']]) if (ch <= top) return name;
        return 'U-NII-4';
      }
      for (const [top, name] of [[93, 'U-NII-5'], [113, 'U-NII-6'], [181, 'U-NII-7']]) if (ch <= top) return name;
      return 'U-NII-8';
    },
    dfs: (band, ch) => band === '5 GHz' && ch >= 52 && ch <= 144,
    psc: (band, ch) => band === '6 GHz' && ch % 16 === 5,
    bwKey(label) {
      const bw = parseInt(label, 10);
      const m = label.match(/320-(\d)/);
      return [bw, m ? parseInt(m[1], 10) : 0];
    },
    block(band, ch, bwLabel) {
      const [bw, variant] = WiFi.bwKey(bwLabel);
      const n = idiv(bw, 20);
      if (band === '2.4 GHz') {
        if (bw === 20) return { members: [ch], centerCh: ch, fc: WiFi.freq(band, ch), bw: ch === 14 ? 22 : 20,
          mode: ch === 14 ? '僅 802.11b (DSSS 22 MHz)' : 'HT20' };
        if (ch === 14) return '通道 14 僅支援 802.11b，無法使用 40 MHz。';
        const up = ch + 4 <= 13;
        const sec = up ? ch + 4 : ch - 4;
        const cc = idiv(ch + sec, 2);
        return { members: [ch, sec].sort((a, b) => a - b), centerCh: cc, fc: WiFi.freq(band, cc), bw: 40,
          mode: up ? 'HT40+（次通道在上方）' : 'HT40−（次通道在下方）' };
      }
      if (band === '5 GHz') {
        if (bw === 20) return { members: [ch], centerCh: ch, fc: WiFi.freq(band, ch), bw: 20 };
        for (const c of WIFI_5G_BLOCKS[bw]) {
          const mem = range(0, n - 1).map((i) => c - 2 * (n - 1) + 4 * i);
          if (mem.includes(ch)) return { members: mem, centerCh: c, fc: WiFi.freq(band, c), bw };
        }
        return `通道 ${ch} 無法組成 ${bw} MHz 通道。`;
      }
      const k = idiv(ch - 1, 4);
      const off = (bw === 320 && variant === 2) ? 8 : 0;
      if (k < off) return `通道 ${ch} 不在任何 320-2 區塊內，請改用 320-1。`;
      const start = off + idiv(k - off, n) * n;
      const mem = range(0, n - 1).map((i) => 1 + 4 * (start + i));
      if (mem[mem.length - 1] > 233) return `通道 ${ch} 無法組成 ${bw} MHz 通道（超出 6 GHz 頻段上緣）。`;
      const cc = 1 + 4 * start + 2 * (n - 1);
      return { members: mem, centerCh: cc, fc: WiFi.freq(band, cc), bw };
    },
    blockCount(band, bwLabel) {
      const [bw] = WiFi.bwKey(bwLabel);
      if (band === '2.4 GHz') return bw === 20 ? '3 個不重疊（1 / 6 / 11）' : '1 個不重疊（建議避免於 2.4 GHz 使用 40 MHz）';
      const seen = new Set();
      for (const c of WIFI_BANDS[band].channels) {
        const r = WiFi.block(band, c, bwLabel);
        if (typeof r === 'object') seen.add(r.centerCh);
      }
      return `${seen.size} 個`;
    },
    slots(band) {
      if (band === '2.4 GHz') return [];
      return WIFI_BANDS[band].channels.map((c) => [WiFi.freq(band, c) - 10, WiFi.freq(band, c) + 10]);
    },
    compute(band, ch, bwLabel) {
      const info = WIFI_BANDS[band];
      const rows = [], spec = [], warns = [];
      const fp = WiFi.freq(band, ch);
      rows.push(['頻段資訊', null]);
      rows.push(['頻段', `${band}　${info.ism}`]);
      rows.push(['適用標準', info.std]);
      rows.push(['20 MHz 通道數', `${info.channels.length} 個`]);
      rows.push(['支援頻寬', info.bws.join(' / ')]);

      rows.push(['主通道 (Primary 20 MHz)', null]);
      rows.push(['通道編號', String(ch)]);
      rows.push(['中心頻率', `${fmt(fp)} MHz`]);
      const half = (band === '2.4 GHz' && ch === 14) ? 11 : 10;
      rows.push(['頻率範圍', `${fmt(fp - half)} – ${fmt(fp + half)} MHz`]);
      rows.push(['子頻段', WiFi.subband(band, ch)]);
      if (band === '5 GHz') rows.push(['DFS 雷達偵測', WiFi.dfs(band, ch) ? '需要（52 – 144）' : '不需要']);
      if (band === '6 GHz') rows.push(['PSC 優選掃描通道', WiFi.psc(band, ch) ? '是' : '否']);
      if (band === '2.4 GHz' && [12, 13, 14].includes(ch)) warns.push('2.4 GHz 通道 12–14 並非所有國家/地區皆開放使用。');

      const blk = WiFi.block(band, ch, bwLabel);
      rows.push([`頻寬配置（${bwLabel}）`, null]);
      const [lo, hi] = info.span;
      const ticksAll = band === '2.4 GHz';
      if (typeof blk === 'string') {
        rows.push(['狀態', '✗ ' + blk]);
        warns.unshift(blk);
        const ticks = info.channels.filter((c) => ticksAll || c === ch)
          .map((c) => [WiFi.freq(band, c), String(c), c === ch ? 'primary' : 'normal']);
        spec.push({ label: `Wi-Fi ${band}`, lo, hi, primary: [fp - half, fp + half], ticks, slots: WiFi.slots(band) });
        return { rows, spec, warns };
      }
      const { members: mem, bw, fc } = blk;
      rows.push(['中心通道', String(blk.centerCh)]);
      rows.push(['中心頻率', `${fmt(fc)} MHz`]);
      rows.push(['頻率範圍', `${fmt(fc - bw / 2)} – ${fmt(fc + bw / 2)} MHz`]);
      rows.push(['包含 20 MHz 通道', mem.join(' , ')]);
      if (blk.mode) rows.push(['模式', blk.mode]);
      const subs = [...new Set(mem.map((c) => WiFi.subband(band, c)))].sort();
      rows.push(['涵蓋子頻段', subs.join(' + ')]);
      if (band === '5 GHz') { const d = mem.filter((c) => WiFi.dfs(band, c)); rows.push(['DFS 通道', d.length ? d.join(' , ') : '無']); }
      if (band === '6 GHz') { const p = mem.filter((c) => WiFi.psc(band, c)); rows.push(['區塊內 PSC', p.length ? p.join(' , ') : '無']); }
      rows.push(['頻段內可用區塊', WiFi.blockCount(band, bwLabel)]);
      rows.push(['備註', '實際可用通道與功率依各國法規（如台灣 NCC）而定']);

      const ticks = [];
      for (const c of info.channels) {
        const kind = c === ch ? 'primary' : (mem.includes(c) ? 'member' : 'normal');
        if (ticksAll || kind !== 'normal') ticks.push([WiFi.freq(band, c), String(c), kind]);
      }
      spec.push({ label: `Wi-Fi ${band}`, lo, hi, chan: [fc - bw / 2, fc + bw / 2], center: fc,
        primary: [fp - half, fp + half], ticks, slots: WiFi.slots(band) });
      return { rows, spec, warns };
    },
  };

  // ---------------------------------------------------------------- GNSS
  const GNSS_F0 = 10.23;
  const BW_ICD = 'ICD 規定頻寬';
  const BW_EST = '主瓣估算（ICD 未規定接收頻寬）';
  const ITU_RNSS = DATA.itu;
  const GNSS_SYSTEMS = DATA.gnssSystems.map(([name, op, cover, mux]) => ({
    name, op, cover, mux,
    signals: DATA.gnssSignals[name].map((s) => {
      const lo = s.band ? s.band[0] : s.fdma ? s.fdma[0] + s.fdma[2] * s.fdma[1] - s.bw / 2 : s.fc - s.bw / 2;
      const hi = s.band ? s.band[1] : s.fdma ? s.fdma[0] + s.fdma[3] * s.fdma[1] + s.bw / 2 : s.fc + s.bw / 2;
      return Object.assign({}, s, { lo, hi, bwKind: s.est ? BW_EST : BW_ICD });
    }),
  }));

  const GNSS = {
    systems: GNSS_SYSTEMS,
    group(fc) {
      if (fc > 2000) return 'S-band（2483.5 – 2500 MHz）';
      return fc > 1500 ? 'Upper L-band（1559 – 1610 MHz）' : 'Lower L-band（1164 – 1300 MHz）';
    },
    itu(lo, hi) {
      const hits = ITU_RNSS.filter(([a, b]) => a < hi && b > lo).map((x) => x[2]);
      return hits.length ? hits.join('、') : '—';
    },
    neighbors(lo, hi, guardBand = 50.0) {
      const entries = [['Wi-Fi 2.4 GHz', 'ISM', [2400.0, 2483.5]]];
      for (const b of LTE_BANDS) {
        if (b.duplex === 'TDD') entries.push([b.name, 'TDD', b.dl]);
        else {
          entries.push([b.name, 'DL', b.dl]);
          if (b.duplex === 'FDD') entries.push([b.name, 'UL', b.ul]);
        }
      }
      for (const b of NR_BANDS) {
        if (b.fr !== 'FR1') continue;
        if (b.duplex === 'TDD') entries.push([b.name, 'TDD', b.dl]);
        else {
          if (b.dl) entries.push([b.name, 'DL', b.dl]);
          if (b.ul) entries.push([b.name, 'UL', b.ul]);
        }
      }
      const groups = new Map();
      for (const [name, d, [a, b2]] of entries) {
        if (Math.max(a - hi, lo - b2, 0) <= guardBand) {
          const k = `${d}|${a}|${b2}`;
          if (!groups.has(k)) groups.set(k, { d, a, b2, names: [] });
          groups.get(k).names.push(name);
        }
      }
      const out = [];
      let idx = 0;
      for (const { d, a, b2, names } of groups.values()) {
        let gap = Math.max(a - hi, lo - b2, 0);
        let side;
        if (a < hi && b2 > lo) { side = '重疊'; gap = -1.0; }
        else if (gap === 0) side = '邊緣相接（0 MHz）';
        else side = a >= hi ? `上方相距 ${fmt(gap)} MHz` : `下方相距 ${fmt(gap)} MHz`;
        out.push({ gap, a, label: names.join(' / ') + (d === 'ISM' ? '' : ` ${d}`), span: [a, b2], side, idx: idx++ });
      }
      out.sort((x, y) => (x.gap - y.gap) || (x.a - y.a) || (x.idx - y.idx));
      return out;
    },
    compute(sysIndex, idx) {
      const sys = GNSS_SYSTEMS[sysIndex];
      const sigs = sys.signals;
      const sg = sigs[idx];
      const { lo, hi } = sg;
      const rows = [], spec = [], warns = [];
      rows.push(['系統資訊', null]);
      rows.push(['系統', sys.name]);
      rows.push(['營運國家 / 機構', sys.op]);
      rows.push(['覆蓋範圍', sys.cover]);
      rows.push(['多工方式', sys.mux]);
      rows.push(['支援訊號', sigs.map((s) => s.name).join(' / ')]);

      rows.push([`訊號頻段（${sys.name} ${sg.name}）`, null]);
      if (sg.fdma) {
        const [base, df, kmin, kmax] = sg.fdma;
        rows.push(['中心頻率 (k = 0)', `${fmt(base, 4)} MHz`]);
        rows.push(['FDMA 頻道公式', `f = ${fmt(base)} + k × ${fmt(df, 4)} MHz（k = −${-kmin} … +${kmax}）`]);
        rows.push(['FDMA 載波範圍', `${fmt(base + kmin * df, 4)} – ${fmt(base + kmax * df, 4)} MHz（${kmax - kmin + 1} 個頻道）`]);
        rows.push(['每頻道頻寬', `${fmt(sg.bw, 3)} MHz（${sg.bwKind}）`]);
      } else {
        rows.push(['中心頻率', `${fmt(sg.fc, 4)} MHz`]);
        rows.push(['訊號頻寬', `${fmt(sg.bw, 3)} MHz（${sg.bwKind}）`]);
      }
      rows.push(['頻率範圍', `${fmt(lo, 3)} – ${fmt(hi, 3)} MHz`]);
      rows.push(['波長 λ', `${fixed(C_LIGHT / (sg.fc * 1e6) * 100, 2)} cm`]);
      const mult = sg.fc / GNSS_F0;
      if (Math.abs(mult - Math.round(mult * 10) / 10) < 1e-6) rows.push(['基本頻率倍數', `${fmt(mult, 1)} × f0（f0 = 10.23 MHz）`]);
      rows.push(['頻段分類', GNSS.group(sg.fc)]);
      rows.push(['ITU-R RNSS 頻段', GNSS.itu(lo, hi)]);
      rows.push(['訊號說明', sg.note]);
      rows.push(['依據文件', sg.doc]);
      if (sg.est) warns.push('此訊號頻寬為主瓣估算值（ICD 未規定接收頻寬），僅供參考。');

      const same = [];
      for (const s2 of GNSS_SYSTEMS) for (const s of s2.signals) {
        if (Math.abs(s.fc - sg.fc) < 1e-6 && !(s2.name === sys.name && s.name === sg.name) && !s.fdma) same.push(`${s2.name} ${s.name}`);
      }
      rows.push(['同頻訊號（跨系統）', null]);
      rows.push(['相同中心頻率', same.length && !sg.fdma ? same.join('、') : '無']);

      const nb = GNSS.neighbors(lo, hi);
      rows.push(['鄰近行動 / Wi-Fi 頻段（±50 MHz）', null]);
      if (nb.length) {
        for (const x of nb) rows.push([x.label, `${fmt(x.span[0])} – ${fmt(x.span[1])} MHz　${x.side}`]);
        if (nb.some((x) => x.gap < 0)) warns.unshift('與行動通訊 / Wi-Fi 頻段重疊，請注意共存與干擾。');
        else if (nb.some((x) => x.gap === 0)) warns.unshift('與行動通訊 / Wi-Fi 頻段邊緣相接，需注意濾波與帶外干擾。');
      } else rows.push(['結果', '±50 MHz 內無 LTE / NR / Wi-Fi 頻段']);

      const top = Math.max(1620.0, Math.max(...sigs.map((s) => s.hi)) + 10);
      const ticks = sigs.map((s, i) => [s.fdma ? s.fdma[0] : s.fc, s.name.split(' ')[0], i === idx ? 'primary' : 'member']);
      spec.push({ label: `${sys.name} 總覽`, lo: 1150, hi: top,
        slots: ITU_RNSS.filter(([a]) => a < top).map(([a, b]) => [a, b]),
        chan: [lo, hi], chanText: `${sg.name}　${fmt(lo, 3)} – ${fmt(hi, 3)} MHz`, ticks });
      const zlo = lo - 60, zhi = hi + 60;
      const zones = nb.filter((x) => x.span[1] > zlo && x.span[0] < zhi)
        .map((x) => [Math.max(x.span[0], zlo), Math.min(x.span[1], zhi), x.label.split(' ')[0]]);
      spec.push({ label: `${sg.name} 放大（含鄰近頻段）`, lo: zlo, hi: zhi, chan: [lo, hi],
        chanText: `中心 ${fmt(sg.fc, 4)} MHz`, center: sg.fc, zones });
      return { rows, spec, warns };
    },
  };

  // ---------------------------------------------------------------- Cable Loss
  const COAX = DATA.coax.map(([name, dia, a1, a6]) => ({ name, dia, a1, a6 }));
  const COAX_CUSTOM = '自訂（輸入規格書數值）';
  const COAX_FMAX = 6.0;
  const COAX_REF = [700, 900, 1575.42, 1800, 2400, 3500, 5150, 5800, 6000];
  const LEN_UNITS = { mm: 0.001, cm: 0.01, m: 1.0 };

  const Cable = {
    cables: COAX, customName: COAX_CUSTOM, lenUnits: LEN_UNITS,
    coeffs(a1, a6) {
      const s6 = Math.sqrt(6.0);
      let k1 = (6.0 * a1 - a6) / (6.0 - s6);
      let k2 = a1 - k1;
      const ok = k1 >= 0 && k2 >= 0;
      if (!ok) { k1 = Math.max(a6 / s6, 0); k2 = 0; }
      return [k1, k2, ok];
    },
    alpha(k1, k2, fMHz) { const g = Math.max(fMHz, 0) / 1000.0; return k1 * Math.sqrt(g) + k2 * g; },
    compute(cable, a1, a6, lengthM, fMHz, otherDb, pin) {
      const rows = [], spec = [], warns = [];
      const [k1, k2, ok] = Cable.coeffs(a1, a6);
      if (!ok) warns.push('自訂參考值不符合 √f 損耗模型，已改以單一 √f 項近似。');
      const alpha = Cable.alpha(k1, k2, fMHz);
      const cableDb = alpha * lengthM;
      const total = cableDb + otherDb;
      const lenMM = fmt(lengthM * 1000, 2);
      const known = COAX.find((c) => c.name === cable);

      rows.push(['線材資訊', null]);
      rows.push(['線材', cable]);
      if (known) rows.push(['外徑', `≈ ${known.dia} mm`]);
      rows.push(['參考衰減', `${fmt(a1)} dB/m @ 1 GHz ／ ${fmt(a6)} dB/m @ 6 GHz`]);
      rows.push(['損耗模型', `α(f) = ${fixed(k1, 4)}·√f + ${fixed(k2, 4)}·f　（dB/m，f 單位 GHz）`]);
      rows.push(['典型額定頻率', `DC – ${fmt(COAX_FMAX)} GHz`]);

      rows.push(['損耗計算', null]);
      rows.push(['頻率', `${fmt(fMHz, 3)} MHz`]);
      rows.push(['長度', `${lenMM} mm（${fmt(lengthM, 4)} m）`]);
      rows.push(['衰減係數', `${fixed(alpha, 3)} dB/m（${fixed(alpha / 10, 4)} dB/100 mm）`]);
      rows.push(['線材損耗', `${fixed(cableDb, 3)} dB`]);
      if (otherDb) rows.push(['其他損耗（連接器等）', `${fixed(otherDb, 3)} dB`]);
      rows.push(['總損耗', `${fixed(total, 3)} dB`]);
      rows.push(['功率剩餘比例', `${fixed(Math.pow(10, -total / 10) * 100, 2)} %`]);
      if (pin !== null) {
        rows.push(['輸入功率', `${fmt(pin, 3)} dBm（${dbmText(pin)}）`]);
        rows.push(['輸出功率', `${fixed(pin - total, 3)} dBm（${dbmText(pin - total)}）`]);
      }
      if (fMHz / 1000 > COAX_FMAX) warns.unshift(`頻率超出典型額定 ${fmt(COAX_FMAX)} GHz，結果為外插估算。`);

      rows.push([`常用頻率損耗（長度 ${lenMM} mm）`, null]);
      for (const f of COAX_REF) {
        const a = Cable.alpha(k1, k2, f);
        rows.push([`${fmt(f, 2)} MHz`, `${fixed(a * lengthM, 3)} dB　（${fixed(a, 3)} dB/m）`]);
      }
      rows.push([`各線材比較（${fmt(fMHz, 3)} MHz，${lenMM} mm）`, null]);
      for (const c of COAX) {
        const [q1, q2] = Cable.coeffs(c.a1, c.a6);
        const a = Cable.alpha(q1, q2, fMHz);
        rows.push([c.name, `${fixed(a * lengthM, 3)} dB　（${fixed(a, 3)} dB/m）` + (c.name === cable ? '　◀ 目前' : '')]);
      }

      const fmax = Math.max(COAX_FMAX, fMHz / 1000 * 1.1);
      const xs = range(0, 120).map((i) => fmax * i / 120);
      const series = [];
      for (const c of COAX) {
        if (c.name === cable) continue;
        const [q1, q2] = Cable.coeffs(c.a1, c.a6);
        series.push({ name: c.name, xs, ys: xs.map((x) => Cable.alpha(q1, q2, x * 1000) * lengthM + otherDb) });
      }
      series.push({ name: cable, xs, ys: xs.map((x) => Cable.alpha(k1, k2, x * 1000) * lengthM + otherDb), main: true });
      const step = fmax <= 8 ? 1 : 2;
      const xticks = range(0, Math.floor(fmax), step).map((gz) => [gz, `${gz} GHz`]);
      spec.push({ type: 'curve', title: `總損耗 (dB) vs 頻率（長度 ${lenMM} mm）`, series, xrange: [0, fmax], xlog: false,
        xticks, point: [fMHz / 1000, total, `${fixed(total, 2)} dB`], legend: [[cable, 'main'], ['其他線材', 'other']] });
      return { rows, spec, warns };
    },
  };

  // ---------------------------------------------------------------- FSPL
  const FSPL_K = 20 * Math.log10(4 * Math.PI / C_LIGHT) + 120;
  const DIST_UNITS = { m: 1.0, km: 1000.0 };
  const FSPL_REF_FREQS = [433.92, 868, 915, 1575.42, 2400, 3500, 5500, 5800, 6500];
  const FSPL_REF_DIST = [1, 10, 100, 1000, 10000];

  const FSPL = {
    distUnits: DIST_UNITS, refFreqs: FSPL_REF_FREQS, refDist: FSPL_REF_DIST,
    loss: (d, f) => 20 * Math.log10(d) + 20 * Math.log10(f) + FSPL_K,
    dist: (l, f) => Math.pow(10, (l - 20 * Math.log10(f) - FSPL_K) / 20),
    compute(dM, fMHz, tx, rx, gt, gr) {
      const rows = [], spec = [], warns = [];
      const loss = FSPL.loss(dM, fMHz);
      const lam = C_LIGHT / (fMHz * 1e6);
      const eirp = tx + gt;
      const prx = tx + gt + gr - loss;
      const margin = prx - rx;
      const allow = tx + gt + gr - rx;
      const dMax = FSPL.dist(allow, fMHz);

      rows.push(['自由空間路徑損耗', null]);
      rows.push(['距離', distText(dM)]);
      rows.push(['頻率', `${fmt(fMHz, 3)} MHz`]);
      rows.push(['波長 λ', `${fixed(lam * 100, 3)} cm`]);
      rows.push(['FSPL', `${fixed(loss, 2)} dB`]);
      rows.push(['計算式', `20·log10(${fmt(dM, 3)} m) + 20·log10(${fmt(fMHz, 3)} MHz) − 27.55`]);
      rows.push(['距離每加倍', '損耗增加 6.02 dB']);

      rows.push(['鏈路預算', null]);
      rows.push(['發射功率 Tx', `${fmt(tx, 3)} dBm（${dbmText(tx)}）`]);
      rows.push(['天線增益 Gt ／ Gr', `${fmt(gt, 2)} dBi ／ ${fmt(gr, 2)} dBi`]);
      rows.push(['EIRP', `${fixed(eirp, 2)} dBm（${dbmText(eirp)}）`]);
      rows.push(['預估接收功率', `${fixed(prx, 2)} dBm（${dbmText(prx)}）`]);
      rows.push(['公式', 'Prx = Tx + Gt + Gr − FSPL']);

      rows.push(['與接收端功率比較', null]);
      rows.push(['接收端功率（輸入）', `${fmt(rx, 3)} dBm（${dbmText(rx)}）`]);
      rows.push(['鏈路餘裕', `${margin >= 0 ? '+' : ''}${fixed(margin, 2)} dB　` + (margin >= 0 ? '✓ 可達' : '✗ 不足')]);
      rows.push(['可容許路徑損耗', `${fixed(allow, 2)} dB（Tx + Gt + Gr − Rx）`]);
      rows.push(['自由空間最大距離', allow > 0 ? distText(dMax) : '—']);
      if (margin < 0) warns.push(`預估接收功率低於接收端功率 ${fixed(Math.abs(margin), 2)} dB，鏈路不足。`);

      rows.push([`常用距離 FSPL（${fmt(fMHz, 3)} MHz）`, null]);
      for (const d of FSPL_REF_DIST) {
        const l = FSPL.loss(d, fMHz);
        rows.push([distText(d), `${fixed(l, 2)} dB　→ Prx ${fixed(tx + gt + gr - l, 2)} dBm`]);
      }
      rows.push(['備註', 'FSPL 適用遠場、無遮蔽視距 (LoS)；實際環境需另加衰落與穿透損耗']);

      const ref = allow > 0 ? dMax : dM;
      const lo = Math.max(Math.min(dM, ref) / 30, 0.01);
      const hi = Math.max(dM, ref) * 30;
      const n = 160;
      const xs = range(0, n).map((i) => lo * Math.pow(hi / lo, i / n));
      const ys = xs.map((x) => tx + gt + gr - FSPL.loss(x, fMHz));
      const xticks = [];
      for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
        const v = Math.pow(10, e);
        if (v >= lo && v <= hi) xticks.push([v, distText(v)]);
      }
      spec.push({ type: 'curve', title: '接收功率 (dBm) vs 距離', series: [{ name: 'Prx', xs, ys, main: true }],
        xrange: [lo, hi], xlog: true, xticks, point: [dM, prx, `${fixed(prx, 1)} dBm`],
        hline: [rx, `接收端功率 ${fmt(rx, 2)} dBm`],
        vline: (allow > 0 && lo <= dMax && dMax <= hi) ? [dMax, `最大 ${distText(dMax)}`] : null,
        legend: [['Prx', 'main']] });
      return { rows, spec, warns };
    },
  };

  // ---------------------------------------------------------------- 總表
  const Tables = {
    cell(tech) {
      if (tech === 'LTE') {
        return {
          cols: ['頻段', '名稱', '雙工', 'DL (MHz)', 'UL (MHz)', 'DL EARFCN', 'UL EARFCN', '頻寬 (MHz)'],
          rows: LTE_BANDS.map((b) => {
            const [lo, hi] = Cell.bandChRange(b);
            let ul = '—', nul = '—';
            if (b.duplex === 'FDD') { ul = `${fmt(b.ul[0])} – ${fmt(b.ul[1])}`; nul = `${b.nUL} – ${b.nUL + hi - lo}`; }
            else if (b.duplex === 'TDD') { ul = '（同 DL）'; nul = '（同 DL）'; }
            return [String(b.num), [b.name, b.alias, b.duplex, `${fmt(b.dl[0])} – ${fmt(b.dl[1])}`, ul, `${lo} – ${hi}`, nul,
              b.bws.map((x) => fmt(x)).join(' / ')]];
          }),
        };
      }
      return {
        cols: ['頻段', '名稱', 'FR', '雙工', 'DL (MHz)', 'UL (MHz)', '柵格 (kHz)', 'SCS (kHz)', '頻寬 (MHz)'],
        rows: NR_BANDS.map((b) => [String(b.num), [b.name, b.alias, b.fr, b.duplex,
          b.dl ? `${fmt(b.dl[0])} – ${fmt(b.dl[1])}` : '—',
          b.duplex === 'TDD' ? '（同 DL）' : (b.ul ? `${fmt(b.ul[0])} – ${fmt(b.ul[1])}` : '—'),
          b.raster.join(' / '), b.scs.join(' / '), b.bws.join(' / ')]]),
      };
    },
    wifi() {
      const rows = [];
      for (const [band, info] of Object.entries(WIFI_BANDS)) {
        for (const ch of info.channels) {
          const f = WiFi.freq(band, ch);
          const h = (band === '2.4 GHz' && ch === 14) ? 11 : 10;
          const notes = [];
          if (WiFi.dfs(band, ch)) notes.push('DFS');
          if (WiFi.psc(band, ch)) notes.push('PSC');
          if (band === '2.4 GHz' && [1, 6, 11].includes(ch)) notes.push('建議不重疊通道');
          if (band === '2.4 GHz' && ch === 14) notes.push('僅 802.11b（日本）');
          rows.push([`${band}|${ch}`, [band, String(ch), fmt(f), `${fmt(f - h)} – ${fmt(f + h)}`, WiFi.subband(band, ch), notes.join('、')]]);
        }
      }
      return { cols: ['頻段', '通道', '中心頻率 (MHz)', '頻率範圍 (MHz)', '子頻段', '備註'], rows };
    },
    gnss() {
      const rows = [];
      GNSS_SYSTEMS.forEach((sys, si) => sys.signals.forEach((s, gi) => {
        const bw = fmt(s.bw, 3) + (s.fdma ? '/頻道' : '') + (s.est ? '*' : '');
        rows.push([`${si}|${gi}`, [sys.name, s.name, fmt(s.fc, 4), bw, `${fmt(s.lo, 3)} – ${fmt(s.hi, 3)}`,
          fixed(C_LIGHT / (s.fc * 1e6) * 100, 2), s.doc, s.note]]);
      }));
      return { cols: ['系統', '訊號', '中心頻率 (MHz)', '頻寬 (MHz)', '頻率範圍 (MHz)', '波長 (cm)', '依據文件', '說明'], rows,
        note: '頻寬標示 * 者為主瓣估算值（ICD 未規定接收頻寬）。' };
    },
    cable() {
      const fq = [700, 1000, 1575.42, 2400, 3500, 5000, 5800, 6000];
      return {
        cols: ['線材', '外徑 (mm)'].concat(fq.map((f) => `${fmt(f / 1000, 4)} GHz`)),
        rows: COAX.map((c) => { const [k1, k2] = Cable.coeffs(c.a1, c.a6);
          return [c.name, [c.name, String(c.dia)].concat(fq.map((f) => fixed(Cable.alpha(k1, k2, f), 2)))]; }),
        note: '數值單位：dB/m（典型值）。',
      };
    },
    fspl() {
      return {
        cols: ['頻率 (MHz)'].concat(FSPL_REF_DIST.map(distText)),
        rows: FSPL_REF_FREQS.map((f) => [String(f), [fmt(f, 3)].concat(FSPL_REF_DIST.map((d) => fixed(FSPL.loss(d, f), 2)))]),
        note: '數值單位：dB（自由空間路徑損耗）。',
      };
    },
  };

  /** 分享 / 複製用純文字 */
  function plainText(title, out) {
    const lines = [`[RF Band Calculator] ${title}`];
    for (const [k, v] of out.rows) lines.push(v === null ? `\n■ ${k}` : `  ${k}：${v}`);
    if (out.warns.length) lines.push('', ...out.warns.map((w) => `⚠ ${w}`));
    return lines.join('\n');
  }

  const RFCore = { fmt, fixed, dbmText, distText, Cell, WiFi, GNSS, Cable, FSPL, Tables, plainText,
    nrArfcnToFreq, nrArfcnFloat };
  if (typeof module !== 'undefined' && module.exports) module.exports = RFCore;
  else root.RFCore = RFCore;
})(typeof self !== 'undefined' ? self : this);
