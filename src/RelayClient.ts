import * as io from "socket.io";
import RelayServer from "./RelayServer";
import { RelayInvokeCommandArgs } from "./types/RelayInvokeCommandArgs";

export default class RelayClient {
  public server: RelayServer;
  public socket: io.Socket;

  constructor(server: RelayServer, socket: io.Socket) {
    this.server = server;
    this.socket = socket;
    this.handleInvoke();
  }

  private handleInvoke() {
    this.socket.on("invoke", async (command: RelayInvokeCommandArgs, callback: (data: any) => void) => {
      try {
        const returnValue = await this.server.invoke(this, command.name, command.args);
        callback({ error: undefined, returnValue });
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });
  }
}
