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

## Windows Server 2019 部署（Node.js + MySQL）

預設啟動不需要 Docker。Express 同時提供已建置的前端及 `/api`，在專案根目錄執行 `npm start` 即可啟動網站。

### 1. 準備執行環境

- Windows Server 2019 x64，安裝 Node.js 22 LTS 及 npm。平台資訊見 [Node.js 官方支援平台](https://github.com/nodejs/node/blob/main/BUILDING.md)。
- 安裝 MySQL 8，並啟動 MySQL Windows 服務。
- 準備 Google OAuth 用戶端及學校資料庫帳戶。
- 前端仍使用舊 Webpack 3：目前已驗證 Node.js 16 可以建置。建議在獨立建置環境產生 `client/dist/`，再複製到伺服器；正式後端使用 Node.js 22。Node.js 16 只作舊工具鏈建置用途。

### 2. 安裝後端及設定環境

在專案根目錄執行 PowerShell：

```powershell
npm --prefix server ci --omit=dev
Copy-Item server/.env.example server/.env
```

如果已有 `server/.env`，保留原檔並逐項核對，勿覆蓋現有設定。

編輯 `server/.env`：

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
CLIENT_ORIGIN=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=school_management
DB_USER=school_app
DB_PASS=replace-with-database-password
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GOOGLE_ALLOWED_DOMAIN=your-school-domain
MANAGER_EMAILS=admin@your-school-domain
SESSION_SECRET=replace-with-a-long-random-secret
```

以上 HTTP 設定只供伺服器本機驗證。Google Console 的 authorized redirect URI 必須與 `GOOGLE_CALLBACK_URL` 完全一致。可用以下指令產生 session secret：

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 初始化 MySQL

全新安裝可在 MySQL Workbench 執行 [database/school_install.sql](database/school_install.sql)。建立 `school_app` 帳戶並授予 `school_management` 所需權限：日常資料讀寫，以及初始化／升級使用的 CREATE、ALTER、INDEX、REFERENCES。

按該 SQL 的 `FIRST MANAGER ACCOUNT` 範例，填入真實 Google 電郵並執行 INSERT，然後設定對應的 `MANAGER_EMAILS`。環境變數本身不會建立帳戶。

已有資料庫先備份，再按 [資料庫升級說明](database/README.md) 執行適用 migration。不要用全新安裝流程覆蓋現有資料。

### 4. 建置前端

在 Node.js 16 建置環境，於專案根目錄執行：

```powershell
npm --prefix client ci --ignore-scripts
npm run build
```

將產生的完整 `client/dist/` 複製至 Windows Server 相同位置。此目錄不會提交至 Git，因此只 clone 專案並不足以提供網頁。伺服器不需要啟動 webpack-dev-server，也不需要安裝前端依賴。

### 5. 啟動網站

在伺服器使用 Node.js 22，於專案根目錄執行：

```powershell
npm start
```

本機測試入口為 `http://localhost:3000`；健康檢查為 `http://localhost:3000/api/health`。`npm start` 會讀取 `server/.env`，不會自動啟動 MySQL 或建置前端。

`Ctrl+C` 停止服務。此指令是前台程序；持續運行及開機自啟需另外由 Windows 服務管理工具或工作排程器管理，工作目錄設為專案根目錄。

### 6. 正式 HTTPS 部署

使用 IIS／Apache 等 HTTPS 反向代理，將同一網域的全部請求轉發至 `http://127.0.0.1:3000`。正式設定範例：

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
CLIENT_ORIGIN=https://timetable.example.edu.hk
GOOGLE_CALLBACK_URL=https://timetable.example.edu.hk/api/auth/google/callback
TRUST_PROXY=loopback
```

`TRUST_PROXY=loopback` 只適用於同機代理。代理須正確設定 `X-Forwarded-Proto: https` 並清除客戶端偽造的轉送標頭。更新 Google Console callback，讓外部使用者透過 HTTPS 網域登入。現行 production 登入要求 HTTPS，不能只把 `HOST` 改成 `0.0.0.0` 就當作正式部署。

詳細設定及驗收見 [Session 登入部署及驗收](docs/deployment/SESSION_AUTH.md)。

## 開發及測試

| 指令（專案根目錄執行） | 用途 |
| --- | --- |
| `npm start` | 啟動 Express，提供前端成品及 API |
| `npm run build` | 建置前端至 `client/dist/` |
| `npm run start:local` | 舊前後端開發模式，需根目錄及兩邊依賴、相容 Node.js |
| `npm --prefix server test` | 後端測試 |
| `npm --prefix client test` | 前端回歸測試；使用支援 Node test runner 的新版 Node.js |
| `npm --prefix client run lint` | 前端程式檢查 |

開發模式的前端仍使用 8080，因此需將 `CLIENT_ORIGIN` 及 Google callback 改成 `http://localhost:8080` 及 `http://localhost:8080/api/auth/google/callback`。一般部署的 `npm start` 使用 3000。

部分資料庫整合測試預設跳過，需按 `server/test/` 內的環境變數及測試資料庫要求啟用。Docker 檔案及 `docker:*` 指令暫作舊部署參考，Windows 原生部署不使用它們。

## 資料匯入與帳戶連結

- 課表匯入建立教師資料，不會自動建立登入帳戶。建立帳戶時需連結正確教師，才會顯示個人課表。
- 教師名冊匯入支援 `UserLogin`、`UserEmail`、`EnglishName`、`ChineseName`，以及可選的 `TeacherCode`／`Abbreviation`。匯入前應在預覽核對教師對應及帳戶衝突。
- 教師 ID 與課表代碼分開處理；匯入及帳戶連結會保留既有教師 ID 和課表關聯。
- 部分匯入使用背景工作及進度輪詢。進度達 100% 後仍可能正在提交交易，應等待成功結果。
- 匯入工作在單一後端程序內執行，目前不適合啟動多個後端副本。程序重啟後，未完成工作會標記失敗，重試前應先查閱匯入紀錄。

新安裝、既有資料庫升級及完整匯入規則見 [database/README.md](database/README.md)。其中舊 JWT／callback／token 說明請以本 README 及下方 session 部署文件為準。

## 登入、導航與正式部署

登入狀態由 MySQL 保存的 session 管理，瀏覽器使用 HttpOnly cookie；前端共用 Axios 會處理 CSRF token。舊 JWT 不再接受，切換版本時前後端應一起更新，使用者需重新登入。

Vue Router 使用記憶體導航，正常操作時網址維持 `/`。目前頁面會按登入使用者保存在分頁的 session storage，供重新整理時還原；儲存不可用時會返回首頁或登入頁。Express 已提供舊路徑入口的 SPA fallback。

## 取消匯入

資料導入頁的「取消我未完成的匯入」會要求取消目前帳戶在此後端程序的未完成工作，亦可用於重新開啟頁面後的工作。其他使用者的工作不能取消。仍在上傳時會排定取消，待收到工作 ID 後再送出取消要求。

取消是合作式處理：等目前 SQL 完成後，在下一個資料庫操作前停止並回滾交易，最後釋放匯入鎖。正在等待資料庫鎖的 SQL 仍需等待完成或逾時；UI 不會假裝已即時完成。已開始 commit 的工作不能取消。取消結果以 failed 狀態及「Import cancelled」訊息保存，不會標記成功。

更新此功能時需重啟唯一的 Node.js 後端程序。舊程序的工作不能由新程序取消；正常停止舊程序會關閉連線並釋放它持有的 MySQL 命名鎖。啟動會將尚未完成的舊工作標記失敗，重試前先檢查匯入紀錄。
