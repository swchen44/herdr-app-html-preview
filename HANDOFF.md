# Herdr App Remote Live Preview — Research / PoC / Implementation Handoff

> Status: **BRAINSTORMING / NOT APPROVED FOR PRODUCTION**  
> Date: 2026-11-08  
> Language: Traditional Chinese  
> Intended executor: MakerOS 上的 Codex / ChatGPT Coding Agent  
> Project name (provisional): `herdr-remote-preview` — **GitHub Repo 名稱尚待使用者確認**

## 0. 交接摘要與核心原則

本專案研究：在**官方 Herdr App** 的 Files Panel 選取遠端 Linux Space 中的 HTML/Markdown/SVG 文件，於**同一個 Space** 的 Agent/Terminal 旁邊顯示可互動、可自動更新的 Preview Pane；優先沿用既有 **Herdr App ↔ herdr-core 遠端連線**，不要求手動 SCP，不預設更換為 Sheprd GUI。

**最重要的限制：**目前尚未證明官方 Herdr App 能以現有 Mod API 嵌入完整 Browser/WebView；不得把 Sheprd 的 Browser 元件可直接移植當作事實。先讀原始碼、寫研究報告、做最小 PoC，再決定修改範圍。

**工作邊界（「不要踩我的地圖」）：**未經明確授權，不得改動、清理、重設、覆蓋、遷移或破壞使用者現有的 Herdr GUI、遠端 Core、Space、Agent Sessions、其他專案、Git 設定、SSH 設定、工作樹或系統服務。不得為了測試而停止正在運作的 Core。任何超出本專案範圍的改動都須先取得同意。

## 1. 使用者需求與現況

### 1.1 已確認需求（USER-CONFIRMED）

- 使用**官方 Herdr App** 作為主要 GUI；macOS / Windows 客戶端，遠端 Linux 上的 `herdr-core` (`hc`) 執行 Agent/Terminal。
- 在 Herdr Files Panel 看到某個 Space 的文件，點選後能在**同一個 Space** 裡與 Agent/Terminal 並排預覽。
- 支援遠端文件，優先沿用**既有 Herdr Core 連線**；避免每次手動 `scp`、另開 Chrome。
- 預覽目標包含 HTML、Markdown、SVG、Mermaid；HTML 期望包含 CSS/JavaScript 互動與相對路徑資源。
- Agent 儲存文件後，預覽應更新；每個 Space 的文件、預覽狀態與來源機器彼此隔離。
- GitHub 上建立**新的 Public Repo**；研究、設計、PoC、驗證紀錄以文件形式持續保存於 `docs/research/`（使用者原文稱 DOCS 下 Research；實際路徑大小寫可由 Repo 慣例決定）。
- 交接給 MakerOS 的 Codex 持續研究、PoC、實作、驗收。

### 1.2 目前不在範圍（OUT OF SCOPE / DEFERRED）

- Herdr Space rename bug（使用者已要求暫時忽略）。
- 重做 Herdr 的 Space、Terminal、Agent、Core 通訊或權限管理。
- 把 Sheprd 整套 GUI 換成主要客戶端；僅作技術研究參考。
- 遠端 Linux 安裝 Chrome / Chromium 作為必要條件。
- 跨 Space 搜尋、文件索引、多人同步編輯、完整 IDE 編輯器。
- 直接將本機或遠端不受信任 HTML 賦予系統／Core 權限。

### 1.3 尚未確認（OPEN DECISIONS）

1. 新 Public Repo 的**正式名稱**及 GitHub 所有者／組織；暫用 `herdr-remote-preview` 作為建議，不得未經確認直接建立。
2. 是否允許 Fork 官方 Herdr App，以及 Fork 的 Repo 名稱、維護策略、上游同步方式。
3. 第一版平台優先順序：macOS、Windows 或兩者；Linux GUI 是否需要。
4. HTML 需要的能力邊界：外部網路請求、`fetch()`、ES modules、iframe、localStorage、下載、列印、DevTools 等。
5. 自動刷新目標：暫以 1–3 秒作**驗收提案**，非已測量能力。
6. 檔案大小、目錄同步上限、相對資源根目錄、允許預覽的路徑範圍。
7. 預覽開啟操作：單擊即預覽、雙擊預覽、右鍵選單或 Preview 按鈕；避免破壞現有點擊看原始碼行為。

## 2. 事實、證據與不確定性登錄

> 任何研究結論均須附上：**來源 URL、commit SHA、檔案路徑、行號／程式碼片段、觀察日期、測試環境、信心等級**。以下是交接時的初始資訊，仍須 Codex 在實際鎖定版本上重查。

| ID | 敘述 | 類別 | 證據／待查 | 結論 |
|---|---|---|---|---|
| F-01 | 官方 `defaults/mods/files/main.js` 中，檔案列的 `on_click` 會呼叫 `this.show(path,cx)` | 已直接檢視原始碼 | https://github.com/herdrdev/herdr-app/blob/master/defaults/mods/files/main.js ，約第 154–156 行（**master 行號可能變動**） | Files 點擊流程已有擴充切入點 |
| F-02 | `show()` 使用 `readTextFile(...,{on})` 讀取，並以 `Editor.new(...)` 顯示文字；超過 400,000 字元的內容會截斷 | 已直接檢視原始碼 | 同上，約第 131–145、177 行 | 目前是**文字原始碼預覽**，非完整 Browser |
| F-03 | Files Mod 使用 `spaces`、`panes`、`focused`、`exec`、`readTextFile` 等 Herdr API | 已直接檢視原始碼 | 同上，檔案 import 與實作 | 有機會重用現有遠端 Machine/Space 脈絡 |
| F-04 | 官方 Mod 開發文件表示不可使用 HTML、CSS、WebView、Node APIs | 先前已檢視文件，**需重新鎖定版本驗證** | https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md | 現有 Mod API 不應被假定可嵌完整 Browser |
| F-05 | Sheprd 有 Browser Preview 與 Herdr Core 相容性相關敘述 | README 層級資訊，**尚未做整合實測** | https://github.com/sheprd-labs/sheprd | 可作參考，不等於可直接移植 |
| H-01 | 可以在官方 Herdr Rust/GPUI GUI 中整合 WebView2/WebKit | 技術假設 | 需驗證 native window/view lifecycle、focus、clipping、GPU compositing、平台 API | **未確認** |
| H-02 | 遠端 Core 的既有讀檔能力足以提供完整 HTML+CSS+JS+圖片資源 | 技術假設 | 需驗證 binary、相對路徑、大小、watch、RPC、權限 | **未確認** |
| H-03 | 無須修改 Core 就能完成所有自動刷新與資源傳輸 | 技術假設 | PoC 驗證後再決定 | **未確認** |
| H-04 | 可直接複製 Sheprd WebView 程式碼到 Herdr | **不應預設成立** | 授權、依賴、架構、跨平台、API 差異均待查 | 禁止未研究就複製 |

### 2.1 原始碼優先查核來源

- 官方 Herdr App: https://github.com/herdrdev/herdr-app
- 官方 Files Mod: https://github.com/herdrdev/herdr-app/blob/master/defaults/mods/files/main.js
- 官方 Mod 指南: https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md
- Sheprd: https://github.com/sheprd-labs/sheprd
- 社群參考 Mod（需重新核實存在、版本及授權）: https://github.com/giacolees/herdr-reader
- 社群文章（需重新核實內容及日期）: https://kt-tech.blog/blogs/herdr-app-mod-file-preview

**注意：**先前聊天中的社群截圖、實作細節與 Sheprd Browser 的內部協定，不可視為已經由本專案驗證的事實；必須在 Research 階段逐項查核。

## 3. 目標使用者體驗與功能範圍

### 3.1 目標操作流程（PROPOSED）

1. 使用者在官方 Herdr App 選擇連到遠端 Linux 的 Space。
2. Agent 在遠端工作目錄產生或修改 `docs/design.html`。
3. 使用者在該 Space 的 Files Panel 選取 `docs/design.html`，選擇 **Preview**（具體操作尚待 UX 決策）。
4. App 利用目前 Space/Machine 的既有 Core 連線讀取文件與必要相對資源。
5. App 在同 Space 的右側 Pane 使用**本機**渲染引擎呈現文件；左側 Agent 保持可操作。
6. Agent 儲存文件後，Preview 自動刷新；切換 Space 時保留各自獨立狀態。
7. 可切換 Preview / Source、手動 Refresh、顯示來源路徑與錯誤。

### 3.2 功能需求編號

| ID | 功能 | 優先級 | 驗收方式 |
|---|---|---|---|
| FR-01 | 依 Space 找到正確 Machine、工作目錄與文件路徑 | P0 | 兩個 Space、不同同名檔案不混淆 |
| FR-02 | 使用既有 Core 連線讀遠端文字檔 | P0 | 不需另輸入 SSH 密碼、不手動 SCP |
| FR-03 | 在同 Space 分割 Pane 顯示 HTML | P0 | 左 Agent + 右 Preview 同時可操作 |
| FR-04 | HTML/CSS/JS/SVG 與相對圖片、樣式、腳本 | P0（目標） | 範例頁面按鈕互動、樣式、圖片皆正確；PoC 失敗需回報 |
| FR-05 | Markdown + Mermaid 渲染 | P1 | 範例表格、程式碼、流程圖正確 |
| FR-06 | Agent 儲存後自動更新 | P1 | 記錄刷新延遲及穩定性 |
| FR-07 | Preview / Source / Refresh | P1 | 切換不破壞文件與 Space |
| FR-08 | 各 Space 獨立預覽與還原 | P1 | 切換／重開 App 後依決策還原 |
| FR-09 | 本機 macOS + Windows 支援 | P1 | 各平台測試矩陣；優先級待確認 |
| FR-10 | 安全限制與錯誤處理 | P0 | 無權限、檔案刪除、惡意 HTML、Core 斷線測試 |

### 3.3 非功能需求（PROPOSED, 待確認數值）

- 不影響既有 Agent Terminal 的互動、焦點、快捷鍵及 Session 恢復。
- 大檔案及資源載入有上限、取消、逾時、錯誤訊息；不得無限制遍歷遠端目錄。
- 不在日誌中洩漏 Core token、SSH 憑證、敏感文件內容。
- Windows/macOS 可重現建置，標註必要的 WebView runtime 與授權。
- 不因 Preview 故障造成 Herdr App 崩潰或遠端 Agent 中斷。

## 4. 候選技術方案（尚未選型）

| 方案 | 優點 | 風險／限制 | 初步定位 |
|---|---|---|---|
| A. 官方 Herdr GUI Fork + Rust/GPUI WebView Pane + Core 讀檔 | 最符合需求、保留原 GUI/Space | WebView 嵌入複雜度、跨平台、上游維護成本未明 | **優先研究** |
| B. 官方 Herdr Mod + 原生 Markdown/有限 HTML 預覽 | 可少改 Rust，沿用 Files | 無法保證完整 CSS/JS 互動 | 快速可交付的降級方案 |
| C. 官方 Herdr + 外部 Browser 視窗 + Core 同步 | 實作可能較容易 | 不符合「同一 GUI Pane」核心目標 | PoC fallback，不作最終預設 |
| D. Sheprd 作為替代 GUI | 已有 Browser 方向可研究 | 與官方 Herdr App 介面、Core 相容性、遠端文件仍需驗證 | 比較基準，不預設遷移 |
| E. 遠端 HTTP Preview Server + Port Forward | 對複雜網站相對自然 | 新服務、安全、連接埠、生命周期管理 | 僅在直接讀檔不足時研究 |

### 4.1 遠端檔案傳輸研究

- 優先檢視 `readTextFile` 與 `exec({on})` 的實際遠端路由、binary 能力及權限界線。
- 比較：**Core RPC 直接讀取**、Core exec + 編碼傳輸、Core 上新增受限 File API、SSH/SFTP（僅 fallback）、遠端 HTTP + port forwarding。
- HTML 相對資源：CSS、JS、字型、圖片、SVG、`fetch()`、ES modules、URL resolution、base URL、同源政策與 CSP。
- 本機渲染：本機 HTTP loopback server、受限 custom URL scheme、WebView 虛擬檔案映射等；**不可假定 `file://` 足夠**。
- 同步方式：watch 事件、輪詢 mtime、內容 hash、dependency graph；衡量效能與 Core 負擔。

## 5. 研究工作包（每項都要輸出 docs/research 文件）

| 編號 | 研究主題 | 必要交付物 |
|---|---|---|
| R01 | Herdr App repo 結構、Build、License、Release、Windows/macOS 依賴 | `docs/research/R01-herdr-baseline.md` |
| R02 | Files Mod 點擊流程、Space/Pane/Machine state、現有讀檔限制 | `docs/research/R02-files-and-space.md` |
| R03 | Core 連線與 Remote RPC：文字、binary、watch、執行命令、安全 | `docs/research/R03-core-file-transport.md` |
| R04 | Herdr GPUI Pane / Mod 擴充點、原生 WebView 可能性 | `docs/research/R04-gpui-webview.md` |
| R05 | Sheprd Browser 的真實實作、依賴、License、可重用範圍 | `docs/research/R05-sheprd-browser.md` |
| R06 | 社群 Herdr Reader / File Preview 的原始碼、效果與限制 | `docs/research/R06-community-solutions.md` |
| R07 | HTML 資源、JS 隔離、custom scheme / localhost、威脅模型 | `docs/research/R07-resource-and-security.md` |
| R08 | macOS / Windows WebView 與 GPUI 焦點、尺寸、生命週期 | `docs/research/R08-cross-platform.md` |
| R09 | 技術方案比較與 Architecture Decision Record | `docs/research/R09-decision-matrix.md` |

**每份 Research 文件固定格式：**問題、已知事實（附 commit SHA/行號）、查證方法、實驗環境、實驗步驟、實際結果、推論（明確標示）、未知項目、風險、建議、下一個驗證動作、參考來源、日期。

## 6. 分階段 PoC 與 Gate

### Gate 0 — 建立獨立 Public Repo（需先確認 Repo 名稱）

- 在指定 GitHub owner 下建立**空白 Public Repo**，不覆蓋既有 Repo。
- 首次提交本交接文件、`README.md`、`AGENTS.md`、`docs/research/`、`docs/adr/`、`poc/`、`tests/`。
- 記錄原始碼參考的 tag/commit SHA；檢查授權相容性；不得把他人程式碼直接貼入而不確認授權。
- GitHub 推送必須確認遠端 URL、branch、working tree；禁止 `push --force`、刪 branch 或改其他 Repo。

### Gate 1 — Baseline / Read-only Research

- 先檢視官方 Herdr App、Core 與 Sheprd 原始碼，寫 R01–R09。
- 在**獨立工作目錄／測試 Space**中驗證現有 Files 點擊、遠端讀檔；記錄版本與結果。
- **停止條件：**若 Core 沒有安全可用的遠端檔案 API，先提交方案比較，不能直接改 Core。

### Gate 2 — Minimal File Transport PoC

- 只針對單一指定測試 Space 讀取遠端 `index.html` 與 `style.css`、`app.js`、`image.svg`。
- 驗證相對路徑、binary、錯誤處理、斷線、檔案更新。
- 不修改正式 Core，不在現有工作專案寫入測試檔。
- 交付：`poc/transport/`、重現步驟、測試輸出與 R03 更新。

### Gate 3 — WebView-in-GPUI Feasibility PoC（最大風險）

- 在隔離 Fork/branch 實驗最小 Browser Pane，先顯示本機靜態 HTML + JS 按鈕。
- 驗證 macOS/Windows 的 resize、split、focus、keyboard、scroll、close/reopen、GPU/compositing。
- **不得在未驗證前宣稱 Sheprd 元件可直接移植。**
- 若失敗，提交可重現證據及替代方案，不得暗中改需求。

### Gate 4 — Vertical Slice

- 單一遠端 Space：Files 選取 → Core 讀取 → 同 Space Preview → Source 切換 → 刷新。
- HTML 互動、CSS、JS、SVG、相對資源正常。
- 交付架構圖、操作錄影／截圖、失敗案例、測試報告。

### Gate 5 — 完整功能與多 Space

- Markdown/Mermaid、跨 Space 隔離、錯誤提示、更新偵測、狀態保存、效能及安全。
- 兩個 Space 同名文件測試；Core 斷線／重連測試；跨平台回歸。

### Gate 6 — Release / Handoff

- 可重現 Build、安裝／回復步驟、使用說明、架構、ADR、已知限制、測試矩陣、版本與 release notes。
- 僅在使用者批准後才對日常使用的 Herdr 安裝環境進行部署或替換。

## 7. 測試資料與驗收矩陣

建立**無敏感資料**的獨立 fixtures：

- `basic.html`：標題、表格、圖片、相對 CSS。
- `interactive.html`：JS 按鈕、DOM 更新、事件監聽。
- `svg.html`：內嵌及外部 SVG。
- `mermaid.md`：Markdown、表格、程式碼區塊、Mermaid。
- `assets/`：相對 CSS/JS/PNG/SVG/字型；測試 nested path。
- `bad-path.html`：不存在資源、拒絕存取、超大檔、循環 symlink、跨目錄路徑。
- `untrusted.html`：測試本機檔案讀取、Core token 暴露、外部請求及 JS 權限邊界。

驗收至少包含：macOS/Windows、單/多 Space、local/remote Machine、讀檔成功/失敗、刷新、切換 Pane、Core 中斷、相對資源、互動、快捷鍵、視窗重啟、安全測試。未測項目標註 **NOT TESTED**，不可填 PASS。

## 8. 安全與 Agent 操作護欄（必讀）

1. **先讀後改**：先列出將讀取與修改的 Repo、branch、檔案及命令；先確認 `pwd`, `git remote -v`, `git status`, `git branch --show-current`。
2. **禁止越界**：除本專案測試 Repo／獨立工作樹外，禁止修改使用者既有程式、Space、Core 配置或系統服務。
3. **禁止破壞性指令**：不得擅自 `rm -rf`、`git reset --hard`、`git clean -fdx`、`git push --force`、刪除/覆寫 Repo、改 SSH credentials、終止 Core 進程。
4. **變更需核准**：Fork 官方 Herdr、改 Core 協定、改用 Sheprd、加入遠端 HTTP Server、開對外 Port、引入大型依賴、改授權、安裝正式 App 前，提交 ADR 並詢問使用者。
5. **每個研究結論要可稽核**：來源、commit SHA、測試指令、輸出、日期、限制；區分 FACT / OBSERVED / HYPOTHESIS / UNKNOWN / DECISION。
6. **不假裝完成**：不能用 mock 畫面或截圖代替真實整合；不能把編譯成功當作功能驗收；未在 Windows 測過就寫 NOT TESTED。
7. **最小權限**：遠端文件讀取限制在目前 Space 的授權路徑；防止 path traversal、symlink escape、XSS/JS 取得本機或 Core 憑證。
8. **可回退**：實驗一律隔離 branch/worktree，清楚標註回退方式；不得影響正在使用的 Agent Sessions。
9. **持續提交**：每個研究或 PoC 小階段完成後更新 `docs/research/`，使用小而可審核的 commit；Push 到確認的本專案 Public Repo。
10. **遇到未知要停下來問**：架構、權限、安全、相容性、工作環境不確定時先報告，不自行假設或越權。

## 9. Repo 建議結構

```text
herdr-remote-preview/                  # 暫定名稱，待確認
├── README.md
├── AGENTS.md                            # Codex/AI Agent 強制閱讀
├── HANDOFF.md                           # 本文件
├── docs/
│   ├── research/
│   │   ├── README.md                    # 研究索引／狀態
│   │   ├── R01-herdr-baseline.md
│   │   ├── ...
│   │   └── R09-decision-matrix.md
│   ├── adr/                             # 架構決策與核准紀錄
│   ├── design/                          # 需求、架構、時序、威脅模型
│   ├── validation/                      # 實測結果、平台矩陣、截圖
│   └── operations/                      # Build、部署、回退
├── poc/
│   ├── transport/
│   └── webview/
├── fixtures/
│   ├── html/
│   └── markdown/
├── tests/
└── .github/
    └── workflows/
```

**注意：**實際整合若需要 Herdr Fork，應明確區分「研究/文件 Repo」與「程式 Fork Repo」，不可默默把兩個 Repo 混在一起。由 ADR 決定是否採 monorepo、submodule 或雙 Repo。

## 10. Codex 開工指令（可直接貼入 MakerOS）

> 你接手的是 Herdr App Remote Live Preview 的 **brainstorming/research-first** 專案。請先完整閱讀 `HANDOFF.md` 與 `AGENTS.md`，不要直接實作正式功能。
>
> 先確認 GitHub owner、Public Repo 正式名稱、目前工作目錄與 Git remote；若 Repo 尚未建立，**先詢問我確認名稱與 owner**，不可自行選定後建立。之後按 Gate 0 → Gate 1 → Gate 2 ... 推進，每個 Gate 都要輸出可重現研究紀錄，放在 `docs/research/`，提交並 Push 至本專案 GitHub Repo。
>
> 第一輪只做：盤點官方 Herdr App/Files/Pane/Core、Sheprd Browser 與社群 Mod；鎖定 commit SHA；建立事實/假設/未知矩陣、可行性比較、風險與最小 PoC 計畫。**不要修改現有 Herdr 安裝、正在執行的 Core、Space 或其他 Repo。**
>
> 特別注意：不要「踩我的地圖」——不要越界改動使用者現有環境、不要把推測當成事實、不要跳過研究直接大改、不要擅自換 GUI 或新增遠端服務。每一步要能審查、能重現、能回退。遇到不確定或重大決策先提出選項、影響與待確認事項。
>
> 第一輪交付：`docs/research/R01` 至 `R09` 的初稿（未完成部分明確標 UNKNOWN）、`docs/adr/` 的待決清單、PoC Gate 計畫、Repo 狀態與下一步建議。禁止宣稱未實測項目已完成。

## 11. 下一步需要使用者確認的最少事項

- **GitHub Repo 名稱與 owner**：建議 `herdr-remote-preview`；Public。
- **第一版開發平台**：建議先 macOS PoC，再 Windows 驗證（僅提案）。
- **是否允許建立 Herdr App Fork**：先研究，確認需要後再請求批准。

在上述事項確認前，Codex 可進行唯讀原始碼研究、撰寫文件及隔離的本機實驗；**不可把未確認的決策視為授權**。
