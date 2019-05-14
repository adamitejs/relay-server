import index from "../src/index";
import RelayServer from "../src/RelayServer";
jest.mock("../src/RelayServer");

describe("index", () => {
  it("should return an RelayServer instance", () => {
    const mockRelayConfig = { "123": "abc" };
    const mockAdamiteConfig = { abc: "123" };
    const server = index(mockRelayConfig, mockAdamiteConfig);
    expect(RelayServer).toHaveBeenCalledWith(mockRelayConfig, mockAdamiteConfig);
    expect(server).toBe((RelayServer as any).mock.instances[0]);
  });
});
