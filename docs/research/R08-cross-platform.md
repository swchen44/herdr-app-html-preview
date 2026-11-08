# R08 跨平台 WebView

狀態：初稿／進行中。觀察日期：2026-11-08。信心：所引本地原始碼高；外部 README 陳述僅限文件層級。

## 問題

跨平台 WebView 是否能支援交接文件所需的遠端同 Space 預覽？

## 已知事實

官方 README 提供 Apple Silicon macOS 與 Windows 安裝說明。

## 查證方法與環境

唯讀檢視本地官方 App `7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8`、Core `cd12ddd88bc11490228343291dc1096c9ed3bf77` 與公開文件；macOS 15.7.7 arm64。

## 實驗步驟與實際結果

原始碼搜尋及閱讀；runtime 實驗 NOT TESTED。上述是靜態證據或明確標註的文件陳述。

## 推論

目前證據不足以保證完整互動式 HTML 或既有連線可安全承載全部相對資源。

## 未知與風險

WebView focus、resize、GPU 與兩平台 runtime 均未測。

## 建議及下一個驗證動作

繼續追蹤相關原始碼、固定外部版本，然後依 HANDOFF 在隔離環境做最小實驗；尚未核准 fork 或 Core 變更。

## 參考來源

- https://github.com/herdrdev/herdr-app/blob/7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8/README.md#install
