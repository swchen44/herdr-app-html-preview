# Files HTML 右鍵操作：初步設計

狀態：研究中；尚未實作或驗證。2026-11-08。

## 使用者需求

官方 Herdr App 的 Files 中，選取 HTML 後以右鍵選擇 Chrome、TextView 或另存新檔。保持現有 Space、Core 與原始碼檢視行為；先以 macOS 實驗，Windows 標示未測。

## 初步設計

以個人 Files Mod 副本加入選單，保留普通點擊的原始碼檢視。TextView 用官方 GPUI 原生 HTML 呈現；它不是完整瀏覽器，JavaScript、CSS、相對資源不可假定支援。Chrome 使用本機安裝的 Google Chrome；本機文件直接開啟。遠端文件須透過既有連線讀取並在本機隔離暫存後開啟，不能僅以遠端路徑交給本機 Chrome。另存提供使用者選擇本機目的地，不能覆寫既有檔案。

## 尚待確認的實作風險

- 官方 readTextFile 遠端限制 1 MiB 且為 lossy UTF-8；完整 binary 檔案與相對資源需要獨立驗證。不能以單一 HTML 傳輸宣稱完整網頁支援。
- Core 檔案存取權限、路徑限制和 symlink escape 尚未驗證；不可假定以 Space 目錄限制存取。
- 暫存路徑的機密性、清理、更新偵測、同名 Space 隔離以及不可信 HTML 的 Chrome 存取仍須設計與測試。
- 系統另存介面及防覆寫行為尚待確認；社群 Mod 未找到授權檔，不得複製其程式碼。
- 未經核准不增加遠端服務、不更改 Core 或官方 App，不安裝到日常環境；先以隔離 App home 驗證。

## 證據

- [官方 Files Mod，固定版本](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/defaults/mods/files/main.js)
- [遠端文字讀取實作](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/src/mods.rs#L862-L875)
- [Mod API](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/defaults/AGENTS.md#L975-L1005)
