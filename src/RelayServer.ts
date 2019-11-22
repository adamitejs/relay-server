import RelayHttpServer from "./RelayHttpServer";
import RelayWebSocketServer from "./RelayWebSocketServer";

export default class RelayServer {
  public name: string;

  public config: any;

  public http: RelayHttpServer;

  public ws: RelayWebSocketServer;

  constructor(serviceName: string, serviceConfig: any) {
    this.name = serviceName;
    this.config = serviceConfig;
    this.http = new RelayHttpServer(this);
    this.ws = new RelayWebSocketServer(this);
  }

  start(startConfig: any) {
    // this.http.start(startConfig.http);
    this.ws.start(startConfig.ws);
  }
}
