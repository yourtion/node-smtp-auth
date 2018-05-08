import net from "net";
import tls from "tls";

export interface ISMTPConfig {
  host: string;
  port: number;
  isSecure?: boolean;
}

export interface ISMTPRes {
  msg: string;
  code: number;
  res: string;
}

export default class SMTPAuth {

  private config: ISMTPConfig;
  private socket?: net.Socket;

  constructor(config: ISMTPConfig) {
    this.config = config;
  }

  private getConnection(cb: () => void) {
    return this.config.isSecure ? tls.connect(this.config, cb) : net.connect(this.config, cb);
  }

  public connect() {
    return new Promise((resolve, reject) => {
      const socket = this.getConnection(() => {
        socket.on("close", () => this.socket = undefined);
        socket.once("data", (data) => {
          this.socket = socket;
          socket.removeAllListeners("error");
          resolve();
        });
        socket.once("error", err => reject(err));
      });
    });
  }

  private send(msg: string, base64 = false): Promise<ISMTPRes> {
    if (!this.socket) { throw new Error("connect first"); }
    const socket = this.socket;
    return new Promise((resolve, reject) => {
        socket.once("data", (data) => {
          const str = Buffer.from(data).toString();
          const code = Number(str.substr(0, 3));
          const res = str.substr(4).replace(/\r\n/, "");
          return resolve({ code, res, msg});
        });
        socket.once("error", err => reject(err));
        const message = base64 ? Buffer.from(msg).toString("base64") : msg;
        socket.write(message + "\r\n");
      });
  }

  public auth(username: string, password: string) {
    return this.connect()
    .then((data) => {
      return this.send("HELO localhost");
    }).then(({code, res}) => {
      if (code !== 250) { throw new Error(res); }
      return this.send("AUTH LOGIN");
    }).then(({code, res}) => {
      if (code !== 334) { throw new Error(res); }
      return this.send(username, true);
    }).then(({code, res}) => {
      if (code !== 334) { throw new Error(res); }
      return this.send(password, true);
    }).then(({code, res}) => {
      if (code !== 235) { throw new Error(res); }
      this.send("QUIT");
      return res;
    });
  }
}
