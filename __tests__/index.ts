import index from "../src/index";
import RelayServer from "../src/RelayServer";
jest.mock("../src/RelayServer");

describe("index", () => {
  it("should return an RelayServer instance", () => {
    const mockConfig = { abc: "123" };
    const server = index(mockConfig);
    expect(RelayServer).toHaveBeenCalledWith(mockConfig);
    expect(server).toBe((RelayServer as any).mock.instances[0]);
  });
});
