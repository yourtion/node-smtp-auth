# node-smtp-auth

Auth user from smtp server

more info: [使用SMTP服务进行用户登录认证](https://blog.yourtion.com/auth-user-from-smtp-on-nodejs.html)

## Install

```bash
$ npm install smtp-auth --save
```

## How to use

```javascript
const SMTPAuth = require("smtp-auth");
const client = new SMTPAuth({
  host: "smtp.163.com",
  port: 25,
});

client.auth("test@extmail.org", "test").then(() => {
  console.log("login success")
}).catch((err) => {
  console.log("login fail: ", err)
});
```
