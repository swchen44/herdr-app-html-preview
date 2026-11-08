# macOS 隔離 GUI smoke，2026-11-09

## 環境與邊界

Herdr App 0.1.13；官方 Core 0.1.19（manifest SHA-256 `5338d900adadb6d273b9c8e97027247db3179ccffede10a1793358f16e08d683`）；測試程式碼 commit `00f01b4ed33442732cffba5c0f9b1aba6a9f9914`；macOS arm64。獨立 `HERDR_APP_HOME`、`HC_SESSION=previewtest`、獨立 XDG runtime/state/config、獨立 Core binary 與 fixture Space。Core 實際使用 macOS 臨時 launchd 啟動，測試後只停止本次 Core。

## 實際觀察

- PASS：右鍵 HTML 顯示 Preview / Chrome / Save As / Cancel 操作列；Preview 呈現標題及文字，Source 顯示 HTML 原始碼。
- PASS：在 Preview 開啟時更改 HTML fixture，4 秒後截圖已顯示更新；未量測精確 latency 分布。
- PASS：Markdown 標題、清單於 TextView 顯示。
- PASS（有限）：兩頁空白 PDF 載入，並可捲動看到兩頁；頁面內容品質與大量 PDF 未測。
- PASS（有限）：由測試 PDF 轉出的有效 PNG 在介面顯示。第一個 1×1 PNG fixture 顯示讀取失敗，獨立執行 `sips` 也無法將它轉檔；不能由此判斷所有 PNG 均正確。
- PASS（有限）：右鍵 Chrome 後，Chrome tab 列表顯示 `file:///private/tmp/herdr-preview-isolated/work/sample.html`。未驗證 JS、CSS 或 Chrome 重新整理。
- NOT TESTED：GUI 另存；切換至 Chrome 後，Computer Use 後續點擊回傳 `noWindowsAvailable`，沒有操作檔案選擇器。真實遠端 Core、斷線、相對資源、安全競態、Space 隔離、重啟、Windows 均未測。

## 測試副作用與處理

雖然 App home 和 Core 隔離，這次直接執行使用者的 `~/Applications/Herdr.app`，官方自動更新把 0.1.14 暫存到 `~/Applications/Herdr.app.new.noindex`。已把該次測試產生的暫存移至 `/tmp/herdr-preview-isolated/staged-update.app`，在關閉前以 SIGKILL 結束本次 App 避免 quit handler 套用更新，並只停止測試 Core。重新核對原 App 為 0.1.13，原暫存路徑不存在。下次應先複製整個 App bundle 到隔離目錄再執行，避免更新觸及正式安裝。測試終端啟動了使用者的 zsh 並停在 oh-my-zsh 更新詢問，沒有回答或執行更新。

## 結論

這是本機單一 Space 的 smoke，不是功能或安全驗收。不可據此安裝至日常 App。測試截圖與 fixture 保留在 `/tmp/herdr-preview-isolated`，屬本機暫存，並非正式可重現測試包。
