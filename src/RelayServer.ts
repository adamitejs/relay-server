import * as io from "socket.io";
import { RelayServerConfig } from "./types/RelayServerConfig";
import RelayClient from "./RelayClient";
import { RelayCommandHandler } from "./types/RelayCommandHandler";

export default class RelayServer {
  public server: io.Server;
  public config: RelayServerConfig;
  private commands: { [name: string]: RelayCommandHandler } = {};

  constructor(config: RelayServerConfig) {
    this.config = config;
    this.server = io(this.config.port);
    this.handleIncomingConnections();
  }

  command(name: string, handler: RelayCommandHandler) {
    this.commands[name] = handler;
  }

  async invoke(client: RelayClient, name: string, args?: any) {
    if (!this.commands[name]) {
      throw new Error(`Command not found: ${name}`);
    }

    const handler = this.commands[name];
    const returnValue = await handler(client, args);

    return returnValue;
  }

  private handleIncomingConnections() {
    this.server.on("connection", this.handleIncomingConnection.bind(this));
  }

  private handleIncomingConnection(socket: io.Socket) {
    try {
      this.validateApiKey(socket);
      new RelayClient(this, socket);
    } catch (err) {
      console.error(err);
      socket.disconnect(true);
    }
  }

  private validateApiKey(socket: io.Socket) {
    const apiKey = socket.handshake.query.key;

    if (apiKey !== this.config.apiKey) {
      throw new Error(`Invalid API Key: ${apiKey}`);
    }
  }
}
