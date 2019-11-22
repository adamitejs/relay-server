export default class RelaySerialization {
  static serializeWebSocketMessage(data: any): string {
    return JSON.stringify(data);
  }

  static deserializeWebSocketMessage(message: string): any {
    return JSON.parse(message);
  }
}
