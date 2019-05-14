import RelayServer from "./RelayServer";

export default function(config: any): RelayServer {
  return new RelayServer(config);
}
