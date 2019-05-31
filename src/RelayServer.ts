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
      try {
        await this.validateKey(socket);
        this.validateSecret(socket);
        new RelayConnection(this, socket);
      } catch (err) {
        console.error(err);
        socket.disconnect();
      }
    });
  }

  async validateKey(socket: any) {
    const { key } = socket.request._query;
    if (!key) throw new Error("Invalid API key.");

    const url = socket.request.headers.origin
      ? `${this.config.apiUrl}/api/keys/${key}?origin=${encodeURIComponent(socket.request.headers.origin)}`
      : `${this.config.apiUrl}/api/keys/${key}`;

    const { status } = await fetch(url);
    if (status !== 200) throw new Error("Invalid API key.");
  }

  validateSecret(socket: any) {
    const { secret } = socket.request._query;
    if (!secret) return;
    if (secret !== this.adamiteConfig.api.secret) throw new Error("Invalid secret.");
  }
}

export default RelayServer;
