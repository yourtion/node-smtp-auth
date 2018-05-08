import SMTPAuth from "./index";

const client = new SMTPAuth({
  host: "smtp.163.com",
  port: 25,
});

client.auth("test@extmail.org", "test").then(() => {
    console.log("login success")
}).catch((err) => {
    console.log("login fail: ", err)
});
