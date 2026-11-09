# ADR 0001：遠端 HTML 在 Chrome 的 live preview

狀態：PROPOSED，尚未實作或驗收。日期：2026-11-09。

## 問題與現況

目前 Mod 只把 HTML 的靜態相對資源快照複製到本機，Chrome 必須手動重新開啟，ES modules、動態資源與 root-relative URL 均不支援。真實遠端 1 MiB 單次傳輸在 64 KiB 分段下為 6,484 ms 和 6,544 ms，不能保證 1–3 秒。

## 候選方案

1. 繼續使用 `file://` 快照：無需額外 listener，但 ES modules、`fetch()`、自動更新與網站路徑語意受瀏覽器限制。
2. **待驗證：本機 loopback preview server**，只綁 `127.0.0.1` 的動態連接埠，使用高熵 session token，僅服務本次明確授權且經檢查的快取資源；遠端存取繼續走現有 Core。監看來源變化後，以版本切換通知本機 Chrome 更新。此為設計方向，不是已確立的安全方案。
3. 遠端 HTTP server 加轉送：需遠端服務與生命週期管理；依交接文件，任何遠端 HTTP server 或對外 port 都須先取得明確核准，目前不得實作。

## Loopback 必須先證明的安全與正確性

- 不提供目錄索引；僅允許本次 bundle 的正規化路徑，不接受 symlink、路徑跳脫、私有檔案或超出配額的資源。
- 檢查 Host、token 和來源；避免 DNS rebinding、cross-origin 存取、token 經 Referer 外洩。不得把 Core socket、認證資訊或任意本機檔案暴露給 HTML。
- 明確設計 Content Security Policy 與外部網路限制；不能只靠 token 宣稱能安全執行不可信 HTML。頁面可見資料、外連、iframe 和下載能力仍須測試並告知使用者。
- 正式指定服務存活時間、App 結束及 crash 時的退出、併發 preview 上限、快取清除、原子切換和故障訊息，不能遺留無主背景服務。
- 驗證經實際 Core 的 HTML、CSS、JS、圖片、ES module、`fetch()`、nested paths 和修改更新；各 Space 同名文件不能混淆。量測對遠端 CPU、頻寬與刷新延遲的影響。
- 測試失敗／拒絕存取／斷線／檔案變更競態，並在 macOS 真實 Chrome 渲染驗證；Windows 另行驗證。缺項不可標 PASS。

## 決策

尚無核准的實作決策。保持目前原型為 experimental，先完成具體設計、威脅模型與上述測試，再判斷是否適合日常使用。瀏覽器工具拒絕直接存取 `file://` 的限制不得以其他 browser surface 或間接方式繞過。
