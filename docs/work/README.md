# 工作證據：2026-11-09

## 環境與隔離

- macOS Apple Silicon：複製的 Herdr App 0.1.13，獨立 App home、獨立本機 Core 0.1.19、獨立 XDG 目錄及 session。沒有啟動正式 App bundle。
- SSH：`ubuntu@553588`，Linux aarch64；測試資料及獨立 Core 0.1.19 放在一次性 `/tmp` 目錄。官方 tarball 的 SHA-256 與官方 manifest 一致。此測試沒有覆寫既有 Core、SSH 設定或工作專案。
- GUI 實測使用基線 commit `00f01b4` 的原型。下述最新程式修改有自動化和載入檢查，**尚未重新取得 GUI 實測證據**。

## 截圖與觀察

- [遠端 TextView](2026-11-09-remote-textview.png)：官方 Herdr 的隔離遠端 Space 顯示測試 HTML 的文字內容。這是 TextView，並不顯示 CSS 或執行按鈕 JS。
- 在同一 GUI 選 Chrome，Herdr 回報已開啟；遠端檔案與本機暫存 HTML SHA-256 同為 `11914924d0930cc936cb38b80a98e8211c69432c2e424cc7ba4aa2550643db6b`。該基線版本只傳單檔。
- 新版透過真實 Core 和 SSH，在自動化測試中收集 HTML、相對 CSS、一般 JS 和 PNG；這證明檔案傳輸，不證明 Chrome 實際渲染或互動。嘗試用瀏覽器工具讀取 `file://` 測試頁時，工具的 URL 安全政策拒絕，沒有繞過該限制。
- 安裝器曾在隔離 App home 建立獨立 layout，Herdr 回報 layout 切換成功。最新包裝版另在全新隔離 app home 完成安裝及 `herdr-app check`；最新版本的 layout 切換與 UI 尚未重新測試。

## 自動化與缺口

[測試輸出](2026-11-09-tests.txt) 使用實際 SSH/Core 測試環境，18/18 通過、0 skip；其中遠端測試包括傳輸與越界／大小拒絕，其他為本機測試或 mock。Herdr `check` 通過只證明初始載入，不代表 GUI 動態狀態正確。

尚未驗證或未支援：Chrome 渲染與互動、動態 JS 資源、ES modules、Chrome 自動刷新、GUI Save Copy、遠端斷線與重連、競態攻擊、完整快取生命週期、Space 切換及重啟、Windows。尚未達日常使用或安全驗收。

舊版本本機 GUI smoke 的完整紀錄見 [2026-11-09 隔離測試](../validation/2026-11-09-macos-isolated-smoke.md)。
