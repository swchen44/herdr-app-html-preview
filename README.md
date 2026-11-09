# Herdr Files Preview

> **實驗原型，尚未達日常使用驗收。** 已有 macOS 本機及 SSH 遠端 Core 的部分實測；遠端 HTML 的動態資源、Chrome 自動更新、安全與安裝回復仍未完成。請勿用於敏感文件或日常 Herdr 環境。

在官方 Herdr App 的個人 Files layout 中預覽 Markdown、HTML、圖片與 PDF，並提供 Preview／Source、Chrome 開啟及另存副本。HTML 的原生 TextView 是文字渲染，不執行 JavaScript，也不支援完整 CSS。Chrome 目前以獨立視窗或分頁開啟；遠端 Chrome 原型會收集 HTML 明確引用的相對 CSS、一般 JavaScript、圖片與 CSS 中的資源；動態產生的 URL、ES modules、根目錄相對 URL、`<base>` 和 Chrome 自動更新仍不支援。Chrome 的實際渲染尚未驗收。

## 目前適合什麼時候用

適合在獨立測試環境研究 Herdr Mod API、原生 Markdown／HTML 預覽和受限遠端單檔傳輸。**不適合**需要完整遠端互動式網站、機密資料、穩定自動刷新、Windows，或正式工作環境的情境。完整範圍與驗證邊界見 [Mod README](mods/files-preview/README.md) 及 [測試紀錄](docs/work/README.md)。

## 安裝方式與官方慣例

Herdr 官方的分享慣例是 `mods/<name>/`、`RECIPE.md`、`preview.png`，GitHub repo 加 `herdr-mod` topic；安裝時先閱讀全部檔案，複製至個人 Mod 目錄並檢查，不覆寫既有 Mod 或 layout。這不是經官方 marketplace 審核的一鍵套件。參考 [Herdr Mod 指南](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/defaults/AGENTS.md#layouts-and-mods-other-people-made)。

本 repo 的實驗安裝器複製現有 `main` layout，建立新的 `files-preview` layout 和 Mod，拒絕覆寫同名檔案。下列步驟僅供**隔離測試用的 Herdr app home**；先用隔離 home 啟動一次 Herdr 讓它建立預設 layout。這段操作會讓 Mod 執行本機程式與讀取檔案，連遠端時也會在選定機器上執行 Python；請先閱讀程式碼。

```sh
git clone https://github.com/swchen44/herdr-app-html-preview.git
cd herdr-app-html-preview
python3 scripts/install.py --app-home "$HERDR_APP_HOME"
herdr-app check "$HERDR_APP_HOME/mods/files-preview"
herdr-app do layout.switch '{"name":"files-preview"}'
```

`HERDR_APP_HOME` 必須指向已啟動之隔離 App 的 home；如果原始 layout 不是 `main`，使用 `--base-layout <名稱>`。在 Files 對檔案按右鍵後選 Preview、Chrome 或 Save Copy。Save Copy 目前只能選擇目的資料夾，以原檔名建立副本，不能在對話框更名，並拒絕覆寫。回復時在同一隔離 App 中切回原 layout；手動刪除測試 layout 和 Mod 前，先確認路徑與內容。此安裝器不修改既有 layout，也不自動刪除檔案。

## 限制與驗證

- 目前只實作 macOS Apple Silicon 客戶端；Windows 尚不支援。圖片、PDF、Chrome 和另存依賴 macOS 工具及 Python 3。遠端 Linux 需要 Python 3 和現有 Herdr Core 機器連線。
- 遠端單檔上限 5 MiB；逐層拒絕 symlink，資料分段並驗證 SHA-256。開啟時最多收集 64 個檔案、總計 20 MiB；以 SHA-256 檢查資源在收集期間未變更。失敗傳輸會嘗試清理部分檔案；成功快取超過 7 天後，在下次操作時才清理，不是定時刪除。
- PDF 上限 30 頁。圖片／PDF 暫存、磁碟配額及錯誤處理尚未完成正式驗收；目前無法在另存時指定新檔名。Chrome 的動態載入與 `fetch()` 等內容不能保證正常。遠端使用真實敏感內容前需先完成安全測試。
- 目前測試及證據放在 [docs/work](docs/work/README.md)。

```sh
node --test tests/*.test.mjs
```

真實 Core 測試預設跳過，需明確設定測試用 `HERDR_TEST_MACHINE`、`HERDR_TEST_ROOT` 和 `HERDR_TEST_HC`，並以隔離 Core 的 session 與 XDG 環境執行。測試通過不代表日常使用已驗收。
