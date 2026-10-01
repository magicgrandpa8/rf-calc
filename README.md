# RF Band Calculator — 手機離線版（PWA）

功能與 Windows 版 v1.3.0 相同：4G LTE / 5G NR、Wi-Fi、GNSS、Cable Loss、FSPL。
安裝到 iPhone / Android 主畫面後，**開飛航模式也能使用**。完全免費，不需要 App Store。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 主畫面 |
| `core.js` | 計算核心與頻段資料 |
| `app.js` | 介面操作 |
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
