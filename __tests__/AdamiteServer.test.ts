import fetch from "node-fetch";
import * as Server from "socket.io";
import AdamiteServer from "../src/AdamiteServer";
import AdamiteConnection from "../src/AdamiteConnection";

jest.mock("node-fetch");
jest.mock("socket.io");
jest.mock("../src/AdamiteConnection");

describe("AdamiteServer", () => {
  const mockServerInstance = {
    on: jest.fn(),
    listen: jest.fn()
  };

  beforeAll(() => {
    (Server as any).mockReturnValue(mockServerInstance);
  });

  beforeEach(() => {
    (fetch as any).mockReset();
    (AdamiteConnection as any).mockReset();
    mockServerInstance.on.mockReset();
  });

  describe("constructor", () => {
    it("should construct an AdamiteServer", () => {
      const mockConfig = { xy: "123" };
      const server = new AdamiteServer(mockConfig);

      expect(server.config).toEqual(mockConfig);
      expect(server.commands).toEqual({});
      expect(Server).toBeCalled();
    });

    it("should listen for messages", () => {
      const mockConfig = { xy: "123" };
      new AdamiteServer(mockConfig);

      expect(mockServerInstance.on).toBeCalledWith("connection", expect.any(Function));
    });
  });

  describe("start", () => {
    it("should start the socket.io server", () => {
      const mockConfig = { port: 9000 };
      const server = new AdamiteServer(mockConfig);
      server.start();
      expect(mockServerInstance.listen).toBeCalledWith(mockConfig.port);
    });
  });

  describe("command", () => {
    it("should register the command", () => {
      const mockConfig = { port: 9000 };
      const mockCommandName = "test";
      const mockCommandHandler = jest.fn();

      const server = new AdamiteServer(mockConfig);
      server.command(mockCommandName, mockCommandHandler);

      expect(server.commands[mockCommandName]).toBe(mockCommandHandler);
    });
  });

  describe("listenForMessages", () => {
    it("should subscribe to the connection event", () => {
      const mockConfig = { xy: "123" };
      new AdamiteServer(mockConfig);
      expect(mockServerInstance.on).toBeCalledWith("connection", expect.any(Function));
    });

    it("should validate the incoming connection key", () => {
      const mockConfig = { xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new AdamiteServer(mockConfig);
      server.validateKey = jest.fn().mockResolvedValue(true);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      connectionHandler(mockSocket);

      expect(server.validateKey).toBeCalledWith(mockSocket);
    });

    it("should disconnect if the key is invalid", async () => {
      const mockConfig = { xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new AdamiteServer(mockConfig);
      server.validateKey = jest.fn().mockResolvedValue(false);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      expect(mockSocket.disconnect).toBeCalled();
    });

    it("should create a new client if the token is valid", async () => {
      const mockConfig = { xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new AdamiteServer(mockConfig);
      server.validateKey = jest.fn().mockResolvedValue(true);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      expect(AdamiteConnection).toBeCalledWith(server, mockSocket);
    });
  });

  describe("validateKey", () => {
    it("should return false if no key is passed", async () => {
      const mockConfig = { xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: {} }
      };

      const server = new AdamiteServer(mockConfig);
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(false);
    });

    it("should request the API with no origin", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { headers: {}, _query: { key: "mock-key" } }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new AdamiteServer(mockConfig);
      const result = await server.validateKey(mockSocket);

      expect(fetch).toBeCalledWith(`${mockConfig.apiUrl}/api/keys/mock-key`);
    });

    it("should request the API with origins", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", xy: "123" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: { origin: "localhost" },
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new AdamiteServer(mockConfig);
      const result = await server.validateKey(mockSocket);

      expect(fetch).toBeCalledWith(`${mockConfig.apiUrl}/api/keys/mock-key?origin=localhost`);
    });

    it("should return true if the returned status is 200", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: {},
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new AdamiteServer(mockConfig);
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(true);
    });

    it("should return false if the returned status is not 200", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000" };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: {},
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 404 });

      const server = new AdamiteServer(mockConfig);
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(false);
    });
  });
});
