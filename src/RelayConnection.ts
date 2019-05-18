import * as jsonwebtoken from "jsonwebtoken";
import RelayServer from "./RelayServer";
import { AuthServiceToken } from "../../sdk";

class RelayConnection {
  public server: RelayServer;

  public socket: any;

  public auth: AuthServiceToken | undefined;

  constructor(server: RelayServer, socket: any) {
    this.server = server;
    this.socket = socket;
    this.loadAuthStateFromQuery();
    this.listenForMessages();
  }

  get id() {
    return this.socket.id;
  }

  listenForMessages() {
    this.socket.on("authStateChange", (data: any) => {
      if (!data.token) return;
      this.auth = jsonwebtoken.verify(
        data.token,
        this.server.adamiteConfig.auth.secret
      ) as AuthServiceToken;
    });

    this.socket.on("command", (data: any, callback: any) => {
      const commandHandler = this.server.commands[data.name];
      if (!commandHandler) return;
      commandHandler(this, data.args, callback);
    });
  }

  loadAuthStateFromQuery() {
    if (
      !this.socket.request._query.token ||
      this.socket.request._query.token === ""
    )
      return;
    const token = this.socket.request._query.token;
    this.auth = jsonwebtoken.verify(
      token,
      this.server.adamiteConfig.auth.secret
    ) as AuthServiceToken;
  }
}

export default RelayConnection;
