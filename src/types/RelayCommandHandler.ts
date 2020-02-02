import RelayClient from "../RelayClient";

export type RelayCommandHandler = (client: RelayClient, args?: any) => Promise<any>;
