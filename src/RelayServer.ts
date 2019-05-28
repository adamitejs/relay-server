import * as express from "express";
import * as http from "http";
import * as io from "socket.io";
import * as path from "path";
import fetch from "node-fetch";
import RelayConnection from "./RelayConnection";
import { RelayServerConfig } from "./RelayTypes";

class RelayServer {
  public app: express.Application;

  public server: http.Server;

  public io: io.Server;

  public config: RelayServerConfig;

  public adamiteConfig: any;

  public commands: any;

  constructor(relayConfig: RelayServerConfig, adamiteConfig: any) {
    this.config = relayConfig;
    this.adamiteConfig = adamiteConfig;
    this.app = express();
    this.server = new http.Server(this.app);
    this.io = io(this.server);
    this.commands = {};
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
    this.app.get("/", (req, res) => {
      res.json({
        name: require(path.join(process.cwd(), "package.json")).name,
        version: require(path.join(process.cwd(), "package.json")).version,
        relay: require("../package.json").version,
        service: this.config.name
      });
    });

    this.io.on("connection", async (socket: any) => {
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
