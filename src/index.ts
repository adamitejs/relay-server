import RelayServer from "./RelayServer";

export default function(relayConfig: any, serviceConfig: any, adamiteConfig: any): RelayServer {
  return new RelayServer(relayConfig, serviceConfig, adamiteConfig);
}
