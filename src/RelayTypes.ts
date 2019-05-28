export type AuthServiceToken = {
  sub: string;
  email: string;
};

export type RelayServerConfig = {
  name: string;
  apiUrl: string;
  port: number;
};
