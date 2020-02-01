import * as io from "socket.io";
import * as jwt from "jsonwebtoken";
import RelayServer from "./RelayServer";
import { InvokeCommandArgs } from "./types/InvokeCommandArgs";
import { AuthStateChangeCommandArgs } from "./types/AuthStateChangeCommandArgs";
import { RelayAuthState } from "./types/RelayAuthState";

export default class RelayClient {
  public server: RelayServer;
  public socket: io.Socket;
  public auth: RelayAuthState;

  constructor(server: RelayServer, socket: io.Socket) {
    this.auth = { isLoggedIn: false };
    this.server = server;
    this.socket = socket;
    this.handleInvoke();
    this.handleAuthStateChange();
  }

  private handleAuthStateChange() {
    this.socket.on("authStateChange", (command: AuthStateChangeCommandArgs) => {
      try {
        if (command.token && !this.server.config.authSecret) {
          throw new Error("Unable to verify auth JWT because authSecret is not set.");
        } else if (command.token && this.server.config.authSecret) {
          const decoded = jwt.verify(command.token, this.server.config.authSecret);
          this.auth = { isLoggedIn: true, data: decoded };
        } else {
          this.auth = { isLoggedIn: false };
        }
      } catch (err) {
        console.error(err);
        this.auth = { isLoggedIn: false };
      }
    });
  }

  private handleInvoke() {
    this.socket.on("invoke", async (command: InvokeCommandArgs, callback: (data: any) => void) => {
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
