import * as jsonwebtoken from "jsonwebtoken";

class AdamiteConnection {
  public server: any;

  public socket: any;

  public data: any;

  public auth: any;

  constructor(server: any, socket: any) {
    this.server = server;
    this.socket = socket;
    this.data = {};
    this.loadAuthStateFromQuery();
    this.listenForMessages();
  }

  get id() {
    return this.socket.id;
  }

  listenForMessages() {
    this.socket.on("authStateChange", (data: any) => {
      if (!data.token) return;
      this.auth = jsonwebtoken.verify(data.token, this.server.config.auth.secret);
    });

    this.socket.on("command", (data: any, callback: any) => {
      const commandHandler = this.server.commands[data.name];
      if (!commandHandler) return;
      commandHandler(this, data.args, callback);
    });
  }

  loadAuthStateFromQuery() {
    if (!this.socket.request._query.token || this.socket.request._query.token === "") return;
    this.auth = jsonwebtoken.decode(this.socket.request._query.token);
  }
}

export default AdamiteConnection;
