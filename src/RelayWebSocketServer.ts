import * as WebSocket from "ws";
import RelayServer from "./RelayServer";
import RelaySerialization from "./RelaySerialization";

type RelayMessage = {
  type: "invoke" | "return";
  serviceName: string;
  commandName: string;
  commandData?: any;
  returnId?: string;
  returnValue?: any;
  returnError?: string;
};

type RelayCommandHandler = (data: any, context: any) => Promise<any>;

export default class RelayWebSocketServer {
  public server: RelayServer;

  public webSocketServer?: WebSocket.Server;

  public commands: { [commandName: string]: RelayCommandHandler };

  constructor(server: RelayServer) {
    this.server = server;
    this.commands = {};
  }

  start(startConfig: any | WebSocket.ServerOptions) {
    this.webSocketServer = new WebSocket.Server(startConfig);
    this.webSocketServer.on("connection", this.handleIncomingConnection.bind(this));
  }

  addCommand(commandName: string, commandHandler: RelayCommandHandler) {
    const scopedCommandName = `${this.server.name}.${commandName}`;

    if (!!this.commands[scopedCommandName]) {
      throw new Error(`Attempted to register duplicate command: ${scopedCommandName}.`);
    }

    this.commands[scopedCommandName] = commandHandler;
  }

  invokeCommand(commandName: string, commandData: any, ws?: WebSocket): Promise<any> | undefined {
    if (!this.commands[commandName]) {
      throw new Error(`Attempted to invoke non-existant command: ${commandName}.`);
    }

    return this.commands[commandName](commandData, this.getCommandContext(ws));
  }

  private getCommandContext(ws?: WebSocket): any {
    return {
      server: this.server,
      ws
    };
  }

  private handleIncomingConnection(ws: WebSocket) {
    ws.on("message", (data: WebSocket.Data) => {
      this.handleIncomingMessage(ws, data);
    });
  }

  private async handleIncomingMessage(ws: WebSocket, data: WebSocket.Data) {
    const deserializedData = RelaySerialization.deserializeWebSocketMessage(data as string);
    const { type, serviceName, commandName, commandData, returnId } = deserializedData as RelayMessage;

    try {
      if (type !== "invoke") {
        throw new Error(`Incoming WebSocket message was not of type "invoke".`);
      }

      const scopedCommandName = `${serviceName}.${commandName}`;
      const commandResult = await this.invokeCommand(scopedCommandName, commandData, ws);

      ws.send(
        RelaySerialization.serializeWebSocketMessage({
          type: "return",
          serviceName,
          commandName,
          returnId,
          returnValue: commandResult
        })
      );
    } catch (err) {
      console.error(err);

      ws.send(
        RelaySerialization.serializeWebSocketMessage({
          type: "return",
          serviceName,
          commandName,
          returnId,
          returnError: err.message
        })
      );
    }
  }
}
