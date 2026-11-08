# R06 社群 Files Preview 實作

狀態：來源與官方程式碼查核；未做社群 Mod runtime 驗證。觀察日期：2026-11-08，macOS 15.7.7 arm64。

## 問題

日本網友的 Files Mod 是否可作為 HTML 預覽、Chrome 開啟、遠端資源及另存的實作基礎？

## 事實與來源

- [日本作者文章](https://kt-tech.blog/blogs/herdr-app-mod-file-preview)，2026-10-30 發表、11-03 更新，描述複製官方 Files 和 layout、以 `TextView.html` / `TextView.markdown` 渲染，並提供 Preview / Source 與 Open 按鈕。文中指出 HTML CSS 不支援，因此排版可能不完整。這是作者的實作報告，非本專案 runtime 觀察。
- 同一文章描述獨立 Markdown pane 每 1.5 秒讀取、偵測變更；這不代表 Files 中 HTML 會自動刷新。圖片透過本機 cache；PDF 以 macOS PDFKit 轉圖片。作者明說遠端 Space 的圖片與 PDF 無法以其方法顯示。
- 文章沒有提供完整 Mod 儲存庫或可安裝程式碼連結，也沒有描述右鍵 Chrome、遠端 HTML 傳送及另存新檔。檢查文章連結及 [作者公開 repo 清單](https://github.com/j19015?tab=repositories) 未發現可明確對應的 Mod repo，這不是證明其他位置不存在。
- 文章頁尾標示 all rights reserved；目前沒有查到作者對全文範例的獨立程式碼授權。故採用其公開描述的做法與官方 API 作參考，不直接複製文章程式或宣稱授權。
- [官方 Files 固定版本](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/defaults/mods/files/main.js#L130-L177) 使用 readTextFile 和 Editor；[官方 TextView 用例](https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/defaults/mods/machine-add/main.js#L214) 使用 `TextView.html`。官方 App LICENSE 為 Apache-2.0，需保留其授權與歸屬。
- [herdr-reader](https://github.com/giacolees/herdr-reader) README 宣稱支援遠端 Markdown、圖片、Mermaid 及單檔下載，local HTML 可開預設 browser，remote HTML 不提供該操作。查核 commit `adc649b045e745ac7c6a36f3442a9b182850029e` 對應 repo 根目錄，未看到 LICENSE；功能僅 README 層級，尚未執行。

## 查證方法及實驗

讀取文章、外部 repo 清單及本地官方來源；沒有安裝或執行社群 Mod。程式碼開發環境與使用者實際遠端環境不同，所有 runtime 結果均 NOT TESTED。

## 推論、未知與風險

可借鏡在 Files 內加入原生 HTML 文字預覽與 Source 切換；原生 TextView 不是瀏覽器，不保證 CSS、JS 或網頁的相對資源。文章不足以推定遠端互動式 HTML、右鍵開 Chrome、另存、刷新或跨平台已完成。

## 建議及下一步

以固定版本官方 Files 為可授權基礎，獨立實作右鍵選單，先做原生 TextView；分別驗證 Chrome 及遠端儲存和資源傳輸。任何遠端能力均需獨立測試，不從文章推論成功。
