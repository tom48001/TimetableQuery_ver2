# 上線前安全初查

日期：2026-10-12（America/Toronto）

更新：以下為修改前的初查紀錄。本次已在原始碼修正 session 撤銷、URL token、OAuth state／PKCE、CSRF、登入限速及一致密碼驗證，並通過相關測試；尚未部署至運行中的網站。請以 [Session 部署及驗收](deployment/SESSION_AUTH.md) 查看最新狀態與限制。匯入限制及正式環境檢查仍需另行處理。

## 結論與範圍

目前不能判定適合直接公開上線。先修正登入憑證生命週期及 Google 登入流程，再由學校 IT 核實 HTTPS、網絡隔離與營運安排。

本次為本地原始碼、部署範例審查及隔離程式測試，並非學校正式網站滲透測試或安全認證。沒有提供正式網址，未核實正式防火牆、憑證、資料庫權限、備份或實際安裝套件漏洞；沒有更改應用程式或真實資料。

## 發現及修正

### 1. 高：舊 JWT 不會隨登出或帳戶權限變更失效

位置：server/src/auth/auth.js:74；server/src/routes/authRoutes.js:69、117、156。

ensureJWT 只核對簽章及有效期，直接採用 token 內的角色／權限。登出只呼叫 Passport logout；改密碼沒有撤銷 JWT。刪除帳戶或降權亦不會令此 middleware 拒絕舊 token。在通常設定下，舊 token 可用至原本兩小時期限；個別業務操作可能因另有資料庫檢查而失敗。這不是無憑證即可入侵，但會令失竊憑證及已撤權帳戶繼續構成風險。

修正：採用可撤銷的伺服器 session，或在 JWT 加入 session ID／帳戶 token version，請求時核對有效 session 及最新帳戶權限。登出撤銷該 session；改密碼、停用、刪除或降權時撤銷所需 session。單靠清除 localStorage 或縮短有效期不足。

驗收：登入後保存測試 token，再登出／改密碼／降權／刪除測試帳戶，舊 token 必須被拒絕或立即反映新權限。

### 2. 高：Google 登入憑證置於 URL

位置：server/src/routes/authRoutes.js:108；client/src/pages/GoogleRedirect.vue:13。

JWT 放在 query string，可能進入瀏覽器歷史及接收該 URL 的伺服器／代理存取紀錄。前端也把 token 存入 localStorage；若同源頁面出現 XSS，token 可被 JavaScript 讀取。本次沒有證明存在可利用的 XSS。

修正：以 Secure、HttpOnly cookie 配合伺服器 session；若保留交換流程，用短效、一次性且與登入瀏覽器綁定的交換碼，勿在 URL 傳長效 bearer token。使用 cookie 認證後須同步加入寫入操作的 CSRF 防護。檢查既有 log 存取權及 token 是否曾被記錄。

### 3. 中：Google OAuth 未明確啟用 state／PKCE

位置：server/src/auth/auth.js 的 GoogleStrategy 設定及 server/src/routes/authRoutes.js 的 /google 路由。

未見 state 或 PKCE 設定，缺少明確的登入請求與回調綁定；可能導致登入 CSRF。尚未執行完整 Google 流程重現。

修正：啟用並驗證每次登入的 session-bound state，按供應商及函式庫支援採用 PKCE；拒絕缺少、錯誤、重用的 state。正式 session store 須支援多實例及重啟策略。

### 4. 中：登入防猜密碼及密碼規則不足

位置：server/src/routes/authRoutes.js /login、/change-password；server/src/controllers/manageTeacherRoutes.js。

應用層未見登入限速；新增、重設及更改密碼未見一致的長度與弱密碼檢查。代理層是否另有限制未知。

修正：登入加上帳戶與 IP 維度的限速、漸進延遲及安全紀錄；统一密碼驗證。若由校方 Google Workspace 管理登入，可評估關閉本地密碼登入並由 IT 執行 MFA 政策，保留受控的應急流程。

### 5. 中：部分上傳缺少應用層資源限制

位置：server/src/routes/importRoutes.js:22。

通用匯入 multer 未設定檔案大小限制；nginx 的 50 MB 限制只涵蓋經該代理的流量，Apache 範例亦未設定對應限制。這些匯入有權限檢查，並非匿名上傳。teacherImportRoutes 已有 10 MB 限制。壓縮試算表的解析資源仍需另行控制。

修正：所有入口統一檔案、欄位、列數及並行作業上限；解析放入可限時／限記憶體的 worker；確保錯誤路徑清除暫存檔。以測試檔验证超限回應，不在正式環境做資源耗盡測試。

### 6. 上線必要條件：部署範例未提供完整傳輸及 session 保護

位置：docs/deployment/apache-timetable.conf；compose.yml；server/src/app.js:45、97。

Apache 範例只有 HTTP；Docker 前端將 8080 發佈到所有介面。學校可能另有 HTTPS 入口，不能據此斷言正式站沒有 HTTPS。非 Docker 的 app.listen(3000) 未指定 loopback，與 Apache 範例註解不一致。Session 未配置 Secure／SameSite／明確期限或正式 store。

修正：IT 設定 HTTPS 強制跳轉及適當 HSTS、阻止繞過入口的 HTTP／後端存取。依部署模式設定 bind address；Docker 內部可保留容器可達位址，由主機 port mapping／防火牆限制。配置可信反向代理、Secure／HttpOnly／SameSite cookie、session 期限及持久 store。若置於學校主站同源，建議評估獨立子網域以縮小主站與本系統互相影響的範圍。

## 已有防護

抽查 API 有 JWT 及後端權限 middleware；密碼使用 bcrypt；所檢查登入及帳戶更新 SQL 使用參數；Docker 資料庫及後端 host ports 綁定 127.0.0.1。這些是良好基礎，不能代替完整逐路由審查。

## 實際測試紀錄

執行 docs/security-auth-check.cjs，退出碼 0。

- 缺少、無效、過期 token：被拒絕。
- 使用獨立測試密鑰簽發的 manager token：ensureJWT 接受，沒有查詢最新帳戶狀態。
- 實際 logout handler 在 Passport logout 成功 stub 下執行後：原 token 仍被接受。

測試直接抽取現有函式並使用真實 jsonwebtoken；不是 live HTTP／真實資料庫／Google 端到端測試。系統 node shim 無法啟動，改用內附 Node 執行，未安裝套件。未做 npm audit，因此沒有宣稱套件不存在漏洞。

## 建議責任分工及下一步

- 開發／維護者：修正應用登入、授權、輸入驗證、套件維護及安全測試；記錄已知風險。
- 學校 IT／供應商：HTTPS、網絡隔離、主機及資料庫更新、密鑰管理、備份還原、監察與事故處理。
- 學校管理層／系統負責人：確認誰可存取學生資料、誰負責長期維護，以及上線風險的接受與簽核。實際工作責任須按職務及校方安排確認，不能由本報告判定。

先在使用假資料的 staging 修正和回歸測試，再由 IT 核對實際 URL、部署架構與測試範圍，執行未登入／老師／職員／管理員權限測試和依賴漏洞掃描。未完成前建議限制在受控測試環境；如已上線，先告知 IT 並評估限制公開存取。

參考：
- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
