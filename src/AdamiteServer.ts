import fetch from "node-fetch";
import * as Server from "socket.io";
import AdamiteConnection from "./AdamiteConnection";

class AdamiteServer {
  public config: any;

  public commands: any;

  public server: any;

  constructor(config: any) {
    this.config = config;
    this.commands = {};
    this.server = Server();
    this.listenForMessages();
  }

  start() {
    this.server.listen(this.config.port);
    return this;
  }

  command(commandName: string, commandHandler: any) {
    this.commands[commandName] = commandHandler;
    return this;
  }

  listenForMessages() {
    this.server.on("connection", async (socket: any) => {
      const isKeyValid = await this.validateKey(socket);
      if (!isKeyValid) return socket.disconnect();
      new AdamiteConnection(this, socket);
    });
  }

  async validateKey(socket: any) {
    const { key } = socket.request._query;
    if (!key) return false;

    const url = socket.request.headers.origin
      ? `${this.config.apiUrl}/api/keys/${key}?origin=${encodeURIComponent(socket.request.headers.origin)}`
      : `${this.config.apiUrl}/api/keys/${key}`;

    const { status } = await fetch(url);
    return status === 200;
  }
}

export default AdamiteServer;
