# TimetableQuery_ver2

學校課表查詢及行政管理系統，供教師、科主任、職員及管理員查閱課表、處理學生提名，以及管理教師和學生資料。前端使用 Vue 2，後端使用 Express，資料儲存於 MySQL。

## 主要功能

| 範疇 | 功能 |
| --- | --- |
| 課表查詢 | 教師、班別、學生及課室課表；空堂教師查詢；觀課及調堂配對查詢 |
| 課堂資料 | 選修科查詢、課堂分組及學生選擇 |
| 學生提名 | BLA、操行獎及領袖生提名、投票與結果查詢；學習目標輸入及結果 |
| 資料管理 | 教師帳戶與權限、教師名冊、學生資料、學年及學期設定 |
| 資料匯入 | 課表 Excel、教師名冊、學生及分組資料；匯入預覽、進度及紀錄 |
| 登入 | Google OAuth、帳戶密碼登入、修改及重設密碼 |

系統支援 `teacher`、`subject_head`、`staff`、`manager` 四種角色。管理員可使用所有權限，其他帳戶按角色及帳戶權限設定存取功能。

## 技術及目錄

| 層級 | 技術 |
| --- | --- |
| 前端 | Vue 2、Vue Router 3、Axios、Webpack 3 |
| 後端 | Node.js、Express、Passport、express-session |
| 資料庫 | MySQL 8、mysql2 |
| Docker | MySQL、Node.js 後端、Nginx 靜態前端及 API 代理 |

```text
.
├── client/                 # Vue 頁面、路由、前端建置及測試
├── server/                 # API、登入、匯入邏輯及後端測試
├── database/               # 新安裝 SQL、migration 及資料庫說明
├── docker/                 # Nginx 設定
├── docs/                   # 部署及安全檢查文件
├── compose.yml             # Docker 基礎設定
├── compose.local.yml       # 本機 HTTP 開發覆寫設定
└── .env.docker.example     # Docker 環境變數範本
```

## 本機快速啟動（Docker）

先安裝 Docker Engine／Docker Desktop 及 Docker Compose，並準備 Google OAuth 用戶端設定。以下指令在專案根目錄執行，不需要先安裝本機 npm 依賴。

### 1. 建立環境設定

PowerShell：

```powershell
Copy-Item .env.docker.example .env.docker
```

macOS／Linux：

```sh
cp .env.docker.example .env.docker
```

編輯 `.env.docker`，替換所有 `CHANGE_ME` 值，並核對以下設定：

| 變數 | 用途／本機設定 |
| --- | --- |
| `MYSQL_DATABASE`、`DB_NAME` | 使用 `school_management`，與安裝 SQL 一致 |
| `MYSQL_USER`、`DB_USER` | 使用相同應用程式資料庫帳戶 |
| `MYSQL_PASSWORD`、`DB_PASS` | 必須使用相同資料庫密碼 |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密碼 |
| `DB_HOST`、`DB_PORT` | Docker 內使用 `db`、`3306` |
| `SESSION_SECRET` | 使用隨機長字串；正式環境至少 32 字元 |
| `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` | Google OAuth 用戶端憑證 |
| `GOOGLE_ALLOWED_DOMAIN` | 允許登入的 Google 帳戶網域，例如學校網域 |
| `MANAGER_EMAILS` | 管理員 Google 電郵，以逗號分隔；不會自動建立帳戶 |
| `CLIENT_ORIGIN` | `http://localhost:8080` |
| `GOOGLE_CALLBACK_URL` | `http://localhost:8080/api/auth/google/callback` |

在 Google OAuth 設定中加入相同的 authorized redirect URI：

```text
http://localhost:8080/api/auth/google/callback
```

目前 `.env.docker.example` 仍包含舊 callback 及 `JWT_SECRET`。請按上表更新 callback；現行登入使用伺服器 session，不再使用 JWT。不要將實際 `.env` 或 `.env.docker` 提交至 Git。

### 2. 啟動服務

```sh
docker compose -f compose.yml -f compose.local.yml up -d --build
docker compose -f compose.yml -f compose.local.yml ps
```

本機 HTTP 必須載入 `compose.local.yml`，它會設定開發模式及同源 Google callback。基礎後端映像預設為 production，HTTP 的 `CLIENT_ORIGIN` 會被拒絕。

| 服務 | 位址 |
| --- | --- |
| 系統入口 | http://localhost:8080 |
| API 健康檢查（經前端代理） | http://localhost:8080/api/health |
| 後端 | http://127.0.0.1:3000 |
| MySQL／Workbench | `127.0.0.1:3307` |

### 3. 建立首個管理員

首次建立空白 MySQL volume 時，Docker 會自動執行 `database/school_install.sql`。安裝檔包含班別、課室及核心科目預設資料，但不會建立可登入的管理員。

1. 使用 MySQL Workbench 或 MySQL 用戶端連接資料庫。
2. 找到 [school_install.sql](database/school_install.sql) 的 `FIRST MANAGER ACCOUNT` 範例。
3. 將範例改成真實 Google 電郵，取消該段 INSERT 的註解，並在 `school_management` 執行。
4. 核對 `.env.docker` 的 `MANAGER_EMAILS` 及 `GOOGLE_ALLOWED_DOMAIN`，如有修改則重新執行啟動指令。
5. 使用 Google 登入，再匯入課表及建立其餘帳戶。

這個範例建立 Google-only 管理員，不會設定本地密碼。

### 4. 查看日誌及停止

```sh
docker compose -f compose.yml -f compose.local.yml logs -f
docker compose -f compose.yml -f compose.local.yml down
```

一般 `down` 會保留資料庫 volume。`down -v` 會刪除資料庫資料，只應在確定要清除資料且已有備份時使用。已有 volume 不會因重啟而再次執行安裝 SQL。

## 本機原始碼開發

前端仍使用舊版 Webpack 3／webpack-dev-server 2。Docker 前端建置使用 Node.js 16，後端使用 Node.js 20；這是目前映像的版本配置，不代表前端支援所有新版 Node.js。本機開發需分別準備相容執行環境。

1. 準備 MySQL 8。全新資料庫執行 `database/school_install.sql`；現有資料庫按 [資料庫說明](database/README.md) 處理 migration。
2. 複製 `server/.env.example` 為 `server/.env`，設定資料庫、Google OAuth 及 session。保留 `NODE_ENV=development`，callback 使用上述前端代理位址。
3. 在兩個終端分別安裝依賴並啟動。

後端（Node.js 20）：

```sh
cd server
npm ci
npm run dev
```

前端（與舊版工具鏈相容的 Node.js 環境）：

```sh
cd client
npm ci --ignore-scripts
npm start
```

前端預設為 `http://localhost:8080`，並將 `/api` 代理至 `http://localhost:3000`。依賴清單仍包含舊測試用 PhantomJS，`--ignore-scripts` 可避免執行其下載腳本。舊模板單元測試及 E2E 已移除，目前使用 Node.js 執行 `test/navigation/` 的回歸測試。

若本機後端連接 Docker MySQL，`server/.env` 使用 `DB_HOST=127.0.0.1`、`DB_PORT=3307`。完整 Docker 堆疊與本機前後端不能同時佔用 8080／3000。

## 常用指令與驗證

| 指令（專案根目錄執行） | 用途 |
| --- | --- |
| `npm start` | 使用基礎 Compose 建置及前台啟動；不會載入本機 HTTP override |
| `npm run docker:up` | 使用基礎 Compose 背景啟動 |
| `npm run docker:down` | 停止基礎 Compose 堆疊，保留 volume |
| `npm run docker:logs` | 追蹤容器日誌 |
| `npm run start:local` | 同時啟動本機前後端；需先安裝根目錄及兩邊依賴，並確保 Node.js 相容 |
| `npm --prefix server test` | 後端 Node.js 測試 |
| `npm --prefix client test` | 全部現有前端回歸測試 |
| `npm --prefix client run test:navigation` | 根路徑導航回歸測試 |
| `npm --prefix client run build` | 建置前端至 `client/dist/` |

後端部分資料庫整合測試預設跳過，需按 `server/test/` 內的環境變數及測試資料庫要求啟用。測試命令成功不代表已驗證真實 Google 登入或正式環境的 HTTPS 代理。

## 資料匯入與帳戶連結

- 課表匯入建立教師資料，不會自動建立登入帳戶。建立帳戶時需連結正確教師，才會顯示個人課表。
- 教師名冊匯入支援 `UserLogin`、`UserEmail`、`EnglishName`、`ChineseName`，以及可選的 `TeacherCode`／`Abbreviation`。匯入前應在預覽核對教師對應及帳戶衝突。
- 教師 ID 與課表代碼分開處理；匯入及帳戶連結會保留既有教師 ID 和課表關聯。
- 部分匯入使用背景工作及進度輪詢。進度達 100% 後仍可能正在提交交易，應等待成功結果。
- 匯入工作在單一後端程序內執行，目前不適合啟動多個後端副本。程序重啟後，未完成工作會標記失敗，重試前應先查閱匯入紀錄。

新安裝、既有資料庫升級及完整匯入規則見 [database/README.md](database/README.md)。其中舊 JWT／callback／token 說明請以本 README 及下方 session 部署文件為準。

## 登入、導航與正式部署

登入狀態由 MySQL 保存的 session 管理，瀏覽器使用 HttpOnly cookie；前端共用 Axios 會處理 CSRF token。舊 JWT 不再接受，切換版本時前後端應一起更新，使用者需重新登入。

Vue Router 使用記憶體導航，正常操作時網址維持 `/`。目前頁面會按登入使用者保存在分頁的 session storage，供重新整理時還原；儲存不可用時會返回首頁或登入頁。舊路徑入口仍需保留 Nginx SPA fallback。

正式部署需設定：

- `NODE_ENV=production`、HTTPS 的 `CLIENT_ORIGIN` 及隨機 `SESSION_SECRET`。
- 前端與 `/api` 使用相同 HTTPS 網域，Google callback 指向 `/api/auth/google/callback`。
- 根據實際代理設定 `TRUST_PROXY` 及 `X-Forwarded-Proto`。現有 Nginx 使用自身 `$scheme`，前方另有 TLS 代理時須配合調整。
- 資料庫帳戶具備初始化 session／匯入資料表所需權限，並先備份既有資料。

正式環境不要套用 `compose.local.yml`。詳細設定、密碼規則、session 行為及上線驗收步驟見 [Session 登入部署及驗收](docs/deployment/SESSION_AUTH.md)。
