# 工作證據：2026-11-09

## 環境與隔離

- macOS Apple Silicon：複製的 Herdr App 0.1.13，獨立 App home、獨立本機 Core 0.1.19、獨立 XDG 目錄及 session。沒有啟動正式 App bundle。
- SSH：`ubuntu@553588`，Linux aarch64；測試資料及獨立 Core 0.1.19 放在一次性 `/tmp` 目錄。官方 tarball 的 SHA-256 與官方 manifest 一致。此測試沒有覆寫既有 Core、SSH 設定或工作專案。
- 遠端 TextView 的點選實測使用基線 commit `00f01b4`。狀態訊息文字調整前的測試版已熱載入隔離 App 並取得 Files 清單截圖，但新版點選、Chrome 渲染與 GUI 另存尚未重新驗證。

## 截圖與觀察

- [測試版遠端 Files 清單](2026-11-09-latest-layout.png)：該測試版 Mod 載入後，隔離 Space 顯示遠端 fixture；此圖不證明點選或 Chrome 渲染。
- [遠端 TextView（基線版）](2026-11-09-remote-textview.png)：官方 Herdr 的隔離遠端 Space 顯示測試 HTML 的文字內容。這是 TextView，並不顯示 CSS 或執行按鈕 JS。
- 在同一 GUI 選 Chrome，Herdr 回報已開啟；遠端檔案與本機暫存 HTML SHA-256 同為 `11914924d0930cc936cb38b80a98e8211c69432c2e424cc7ba4aa2550643db6b`。該基線版本只傳單檔。
- 新版透過真實 Core 和 SSH，在自動化測試中收集 HTML、相對 CSS、一般 JS 和 PNG；這證明檔案傳輸，不證明 Chrome 實際渲染或互動。嘗試用瀏覽器工具讀取 `file://` 測試頁時，工具的 URL 安全政策拒絕，沒有繞過該限制。
- 安裝器曾在隔離 App home 建立獨立 layout，Herdr 回報 layout 切換成功。最新包裝版另在全新隔離 app home 完成安裝及 `herdr-app check`；最新版本的 layout 切換與 UI 尚未重新測試。

## 傳輸速度單次量測

相同遠端測試連線，1 MiB 零值 fixture：32 KiB 分段為 **11,405 ms**；改為 64 KiB 分段後為 **6,484 ms**；完整測試另一次為 **6,544 ms**。前兩者各一次，並非基準測試或穩定延遲保證；仍高於先前 1–3 秒的提案。

## 自動化與缺口

[測試輸出](2026-11-09-tests.txt) 使用實際 SSH/Core 測試環境，21/21 通過、0 skip；其中遠端測試包括傳輸與越界／大小拒絕，其他為本機測試或 mock。Herdr `check` 通過只證明初始載入，不代表 GUI 動態狀態正確。

尚未驗證或未支援：Chrome 渲染與互動、動態 JS 資源、ES modules、Chrome 自動刷新、GUI Save Copy、遠端斷線與重連、競態攻擊、完整快取生命週期、Space 切換及重啟、Windows。尚未達日常使用或安全驗收。

舊版本本機 GUI smoke 的完整紀錄見 [2026-11-09 隔離測試](../validation/2026-11-09-macos-isolated-smoke.md)。

## 測試結束

本次 App 副本正常結束，本機與遠端獨立測試 Core 均以各自隔離的 session 停止；遠端 Core PID 已退出、測試 socket 不存在。隔離 fixture 與下載檔留在各自的 `/tmp`，沒有刪除使用者其他檔案。正式 App 確認仍為 0.1.13，旁邊沒有本輪產生的更新暫存。
