# Session 登入部署及驗收

本次登入已改用 MySQL 保存的伺服器 session。舊 JWT 不再接受；前後端必須一起更新，所有人需重新登入。

## 必要設定

- 正式環境設定 `NODE_ENV=production`、`CLIENT_ORIGIN=https://你的系統網域`，並使用至少 32 字元的隨機 `SESSION_SECRET`。正式環境若仍用 HTTP 會拒絕啟動。
- 前端和 `/api` 應經同一 HTTPS 網域提供。`GOOGLE_CALLBACK_URL` 使用該網域的 `/api/auth/google/callback`，並同步修改 Google Console 的 authorized redirect URI。
- TLS 代理必須傳送正確 `X-Forwarded-Proto: https`，並清除用戶可偽造的轉送標頭。`TRUST_PROXY` 只列出實際代理 IP／CIDR；Apache 與 Node 直接在同一主機可用 `loopback`。Docker 網絡須使用實際代理來源，不能隨意信任所有地址。後端連接埠必須限制只容許代理存取。
- 若經 Docker nginx 再轉發，現有 nginx 會把 `X-Forwarded-Proto` 設為本身的 `$scheme`；IT 必須按 TLS 終止位置調整，確保 HTTPS 資訊不會在中途變成 HTTP。不要直接信任公開用戶傳入的標頭。
- 啟動時建立 `auth_session`、`auth_attempt` 兩張表。部署帳戶需要建表權限；可先由 IT 建立後再調整權限。日常操作需要 SELECT／INSERT／UPDATE／DELETE，session 資料庫不可公開。
- Cookie 名稱 `timetable.sid`，HttpOnly、SameSite=Lax、正式環境 Secure，最長登入兩小時。Session 不會因讀取頁面無限延長。
- 舊 `JWT_SECRET` 不再用於登入，可以在完成切換後移除。不要把 `.env` 上傳到公開網站或 Git。

## 本機 HTTP 測試

直接執行 Node 時，參考 `server/.env.example` 使用 `NODE_ENV=development`，前端代理 `/api` 到後端，Google callback 也經前端相同主機名稱。不要混用 `localhost` 和 `127.0.0.1`。

Docker 本機測試可使用：

```sh
docker compose -f compose.yml -f compose.local.yml up -d --build
```

`compose.local.yml` 只供本機 HTTP；正式部署不可套用。這次沒有重建或重啟正在運行的容器。

## 行為

- 登出撤銷該 session；保留撤銷標記，避免並行請求重新寫回已登出的 session。
- 自行改密碼、管理員重設密碼後，舊 session 在下次請求失效；每次請求讀取最新帳戶角色／權限，刪除帳戶立即不能再驗證。
- Google 登入使用 session-bound state 及 PKCE S256；回調有效期十分鐘。完成後 URL 只有 `/google-redirect`，沒有登入憑證。
- 所有非 GET／HEAD／OPTIONS API 請求（包括登入）都要帶 session 綁定的 CSRF token。前端共用 axios 已處理，不可只移除後端檢查來修復第三方客戶端。
- 每十五分鐘，同一帳戶最多十次密碼登入嘗試，同一 IP 最多一百次；成功嘗試亦計算。更改密碼另外按帳戶 ID 計算。超限回傳 429 及 Retry-After。多人共用學校出口時，IT 應在 staging 評估此上限；勿停用限制。
- 新建／重設／更改密碼不設最少長度或複雜度要求，但密碼不可為空，且最多 72 UTF-8 bytes（bcrypt 技術限制）。允許空格及中文；Google-only 帳戶可不設本地密碼。
- 既有密碼不會被批量重設；本地登入仍可使用原密碼。舊系統如曾允許超過 72 bytes 的密碼，需由管理員重設，避免 bcrypt 截斷歧義。

## 驗證紀錄

- 後端 `node --test`：52 通過、7 跳過。跳過項目包含六組既有真實業務資料庫測試及預設需手動啟用的 auth storage 測試。
- 前端 navigation：4 通過。
- Webpack production configuration 建置成功（本機 npm shim 壞掉，直接呼叫相同 webpack production config）。
- 真實 MySQL 儲存測試另外已從現有容器執行：只建立連線專用 TEMPORARY tables，確認儲存、過期、撤銷後並行寫回及限速窗口／並行請求；沒有讀寫學校資料。
- HTTP 安全測試使用假資料庫、真實 Express／Passport／session／bcrypt，覆蓋登入、session ID 更新、登出重播拒絕、即時降權、改密碼撤銷所有 session、CSRF、OAuth state／PKCE、限速。
- Google 真實帳戶完整登入、正式 HTTPS／代理 cookie、學校網絡仍需部署後驗收；自動測試沒有向 Google 換取真實 token。

正式上線前以測試帳戶驗收：登入 → 查課表 → 提名／管理操作 → 改密碼 → 重登入 → 登出；另外核對瀏覽器 cookie Secure 屬性、錯誤 origin／state 被拒絕，及兩台裝置在改密碼後均失效。
