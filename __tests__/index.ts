import index from "../src/index";
import AdamiteServer from "../src/AdamiteServer";
jest.mock("../src/AdamiteServer");

describe("index", () => {
  it("should return an AdamiteServer instance", () => {
    const mockConfig = { abc: "123" };
    const server = index(mockConfig);
    expect(AdamiteServer).toHaveBeenCalledWith(mockConfig);
    expect(server).toBe((AdamiteServer as any).mock.instances[0]);
  });
});
