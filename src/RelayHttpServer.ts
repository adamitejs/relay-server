import RelayServer from "./RelayServer";

export default class RelayHttpServer {
  public server: RelayServer;

  constructor(server: RelayServer) {
    this.server = server;
  }
}
