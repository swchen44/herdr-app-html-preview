# R03 Core 與遠端檔案

狀態：初稿／進行中。觀察日期：2026-11-08。信心：所引本地原始碼高；外部 README 陳述僅限文件層級。

## 問題

Core 與遠端檔案 是否能支援交接文件所需的遠端同 Space 預覽？

## 已知事實

App remote readTextFile 透過遠端 cat 或 Windows type，超過 1 MiB 拒絕並以 lossy UTF-8 轉字串。Core 的 file.read 支援 on 路由，但只回傳 UTF-8 文字，整檔上限 64 MiB，單次回應上限 8 MiB。這是兩條不同程式路徑。

## 查證方法與環境

唯讀檢視本地官方 App `7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8`、Core `cd12ddd88bc11490228343291dc1096c9ed3bf77` 與公開文件；macOS 15.7.7 arm64。

## 實驗步驟與實際結果

原始碼搜尋及閱讀；runtime 實驗 NOT TESTED。上述是靜態證據或明確標註的文件陳述。

## 推論

目前證據不足以保證完整互動式 HTML 或既有連線可安全承載全部相對資源。

## 未知與風險

binary 資源傳輸、路徑授權與實際通訊尚未驗證。

## 建議及下一個驗證動作

繼續追蹤相關原始碼、固定外部版本，然後依 HANDOFF 在隔離環境做最小實驗；尚未核准 fork 或 Core 變更。

## 參考來源

- https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/src/mods.rs#L862-L875
- https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/src/mod_files.rs#L7-L23
- https://github.com/herdrdev/herdr-core/blob/cd12ddd88bc11490228343291dc1096c9ed3bf77/crates/herdr-core/src/files.rs#L8-L16
- https://github.com/herdrdev/herdr-core/blob/cd12ddd88bc11490228343291dc1096c9ed3bf77/crates/herdr-core/src/files.rs#L48-L91
- https://github.com/herdrdev/herdr-core/blob/cd12ddd88bc11490228343291dc1096c9ed3bf77/crates/herdr-core/src/remote.rs#L758-L769
