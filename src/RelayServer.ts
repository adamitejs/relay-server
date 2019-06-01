import fetch from "node-fetch";
import * as Server from "socket.io";
import RelayConnection from "./RelayConnection";
import { RelayServerConfig } from "./RelayTypes";

class RelayServer {
  public config: RelayServerConfig;

  public adamiteConfig: any;

  public commands: any;

  public server: any;

  constructor(relayConfig: RelayServerConfig, adamiteConfig: any) {
    this.config = relayConfig;
    this.adamiteConfig = adamiteConfig;
    this.commands = {};
    this.server = Server();
    this.server.origins("*.*");
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
      new RelayConnection(this, socket);
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

export default RelayServer;
