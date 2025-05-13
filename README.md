- This script requires the installation of necessary npm packages.
- Please run `npm install` to install the required dependencies before executing the program.

---

**client**

```
cd client
npm install
npm start
```

---

**server**

```
cd server
npm install
npm start
```

**open DB**
```
mysql -u root -p
```

**create db**
```
mysql -u root -p
CREATE DATABASE "name";
use "name"
```

---
**import db***
```
mysql -u root -p school_management < env.sql
```

---
**password**
```
node
import bcrypt from 'bcrypt';
const saltRounds = 10;
const password = "1234567"; // Your actual password
bcrypt.hash(password, saltRounds, (err, hash) => {
  console.log("Hashed password:", hash);
});
UPDATE user 
SET password_hash = ''
WHERE email = '2@gmail.com';
```

---
**clear port**
```
netstat -ano | findstr :3000
taskkill /PID "" /F
```
