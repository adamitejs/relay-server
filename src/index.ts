import RelayServer from "./RelayServer";

export default function(relayConfig: any, adamiteConfig: any): RelayServer {
  return new RelayServer(relayConfig, adamiteConfig);
}
