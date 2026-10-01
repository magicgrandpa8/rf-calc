# RF Band Calculator — 手機離線版（PWA）

目前版本 **v1.5.0**：4G LTE / 5G NR、Wi-Fi、GNSS、Cable Loss、FSPL，支援中文 / English。
安裝到 iPhone / Android 主畫面後，**開飛航模式也能使用**。完全免費，不需要 App Store。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 主畫面 |
| `core.js` | 計算核心與頻段資料 |
| `app.js` | 介面操作 |
| `i18n.js` | 英文翻譯字典 |
| `sw.js` | 離線快取（讓 App 在沒有網路時也能開啟） |
| `manifest.webmanifest`、`icons/` | 主畫面圖示與 App 設定 |

---

## 步驟一：放到免費網頁空間（GitHub Pages，約 10 分鐘，只做一次）

1. 到 <https://github.com> 註冊免費帳號（只需 Email）。
2. 登入後點右上角 **＋ → New repository**。
   * Repository name：`rf-calc`（可自訂，會成為網址的一部分）
   * 選 **Public**
   * 按 **Create repository**
3. 在新頁面點 **uploading an existing file** 連結。
4. 把本資料夾內的**所有檔案與 `icons` 資料夾**一起拖進網頁（建議用電腦版 Chrome 或 Edge），等待上傳完成後按下方綠色 **Commit changes**。
   * 確認上傳後的清單中，`index.html` 位在最外層，而不是在另一個資料夾裡面。
5. 點上方 **Settings → 左側 Pages**。
   * Source：**Deploy from a branch**
   * Branch：**main**、資料夾 **/ (root)** → 按 **Save**
6. 約 1–2 分鐘後重新整理該頁，上方會出現網址：
   `https://您的帳號.github.io/rf-calc/`

> 用電腦瀏覽器打開這個網址，確認工具可以正常使用。

## 步驟二：安裝到 iPhone（需在有網路的地方完成）

1. 用 **Safari** 開啟上面的網址（必須是 Safari）。
2. 點下方 **分享按鈕** → 往下滑選 **加入主畫面** → **新增**。
3. **重要：從主畫面的「RF Calc」圖示開啟一次**，看到「已下載到此裝置，沒有網路時也能使用」提示即完成。
   * iPhone 的主畫面 App 與 Safari 使用不同的儲存空間，所以這一步一定要從主畫面圖示開啟。
4. 驗證：開啟飛航模式 → 從主畫面點 RF Calc → 應可正常計算。

右上角 ⓘ「關於」會顯示目前狀態：綠點表示已可離線使用。

### Android
用 Chrome 開啟網址 → 右上角選單 → **安裝應用程式**（或「加到主畫面」）→ 從主畫面開啟一次即可。

---

## 更新版本

1. 修改檔案後，將 `sw.js` 的 `VERSION` 與 `app.js` 的 `APP_VERSION` 改成相同的新版本號（例如 `1.3.1`）。
2. 到 GitHub 的 repository 頁面 → **Add file → Upload files**，上傳修改過的檔案（同名檔案會覆蓋）→ Commit。
3. 手機在有網路時開啟 App 一次，關閉後再開啟，即為新版本。

## 常見問題

| 狀況 | 處理方式 |
|---|---|
| 飛航模式下打不開 | 在有網路時從**主畫面圖示**開啟一次，等提示出現後再試。 |
| 「關於」顯示黃點 | 表示尚未下載完成，請在有網路時開啟並停留幾秒。 |
| 很久沒用後離線打不開 | iPhone 儲存空間不足時可能清除網頁資料，連網開啟一次即可恢復。 |
| 想要不公開的網址 | 免費 GitHub Pages 網址是公開的；可改用 Cloudflare Pages 或 Netlify（同樣免費，可設定存取限制）。 |

## 隱私

所有計算都在手機上完成，輸入的數值只儲存在本機，不會傳送到任何地方。

---

## 版本紀錄

### v1.5.0
* 行動網路 / Wi-Fi 頻譜圖中心標籤同時顯示頻率與通道號（例：2140 MHz · EARFCN 300、5290 MHz · CH 58）
* 行動網路通道號與中心頻率改為 DL / UL 雙欄，FDD 頻段可由任一欄輸入（UL 會自動換算為 DL）；TDD 為 DL / UL 共用
* Wi-Fi 新增中心頻率輸入（自動對應最近通道），並標示 UL / DL 同頻
* 行動網路移除「頻道計算」「L / M / H 測試頻點」區段；Wi-Fi 移除「L / M / H 測試通道」區段（資訊已整合至輸入區與頻譜圖）
* Cable Loss 新增「資料來源」區段
* 所有結果區段與頻譜圖可個別摺疊，並提供「全部收合 / 全部展開」，狀態會記住

### v1.4.0
* 介面改為無印風格配色（未漂白紙色、炭灰文字、低彩度自然色），支援深色模式
* 新增中文 / English 切換（右上角「EN / 中」），選擇會記住
* 行動網路與 Wi-Fi 新增 L / M / H 測試頻點：結果區列出頻率與 EARFCN / NR-ARFCN（FDD 含 UL），可一鍵切換，頻譜圖上標示位置
* 行動網路新增「靈敏度測試 RB 設定（REFSENS）」：LTE 依 TS 36.101 Table 7.3.1-2；NR TDD 為全 RB；NR FDD 標示配置原則

**更新方式**：上傳全部檔案（含新增的 `i18n.js`）到 GitHub，手機連網開啟一次後重新開啟即可。
