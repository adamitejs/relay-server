import fetch from "node-fetch";
import * as Server from "socket.io";
import RelayServer from "../src/RelayServer";
import RelayConnection from "../src/RelayConnection";

jest.mock("node-fetch");
jest.mock("socket.io");
jest.mock("../src/RelayConnection");

describe("RelayServer", () => {
  const mockServerInstance = {
    on: jest.fn(),
    listen: jest.fn()
  };

  beforeAll(() => {
    (Server as any).mockReturnValue(mockServerInstance);
  });

  beforeEach(() => {
    (fetch as any).mockReset();
    (RelayConnection as any).mockReset();
    mockServerInstance.on.mockReset();
  });

  describe("constructor", () => {
    it("should construct an RelayServer", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const server = new RelayServer(mockConfig, {});

      expect(server.config).toEqual(mockConfig);
      expect(server.commands).toEqual({});
      expect(Server).toBeCalled();
    });

    it("should listen for messages", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      new RelayServer(mockConfig, {});

      expect(mockServerInstance.on).toBeCalledWith(
        "connection",
        expect.any(Function)
      );
    });
  });

  describe("start", () => {
    it("should start the socket.io server", () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const server = new RelayServer(mockConfig, {});
      server.start();
      expect(mockServerInstance.listen).toBeCalledWith(mockConfig.port);
    });
  });

  describe("command", () => {
    it("should register the command", () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const mockCommandName = "test";
      const mockCommandHandler = jest.fn();

      const server = new RelayServer(mockConfig, {});
      server.command(mockCommandName, mockCommandHandler);

      expect(server.commands[mockCommandName]).toBe(mockCommandHandler);
    });
  });

  describe("listenForMessages", () => {
    it("should subscribe to the connection event", () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      new RelayServer(mockConfig, {});
      expect(mockServerInstance.on).toBeCalledWith(
        "connection",
        expect.any(Function)
      );
    });

    it("should validate the incoming connection key", () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new RelayServer(mockConfig, {});
      server.validateKey = jest.fn().mockResolvedValue(true);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      connectionHandler(mockSocket);

      expect(server.validateKey).toBeCalledWith(mockSocket);
    });

    it("should disconnect if the key is invalid", async () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new RelayServer(mockConfig, {});
      server.validateKey = jest.fn().mockResolvedValue(false);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      expect(mockSocket.disconnect).toBeCalled();
    });

    it("should create a new client if the token is valid", async () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: { key: "1234" } }
      };

      const server = new RelayServer(mockConfig, {});
      server.validateKey = jest.fn().mockResolvedValue(true);

      const connectionHandler = mockServerInstance.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      expect(RelayConnection).toBeCalledWith(server, mockSocket);
    });
  });

  describe("validateKey", () => {
    it("should return false if no key is passed", async () => {
      const mockConfig = { apiUrl: "", port: 9000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { _query: {} }
      };

      const server = new RelayServer(mockConfig, {});
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(false);
    });

    it("should request the API with no origin", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", port: 8000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: { headers: {}, _query: { key: "mock-key" } }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new RelayServer(mockConfig, {});
      const result = await server.validateKey(mockSocket);

      expect(fetch).toBeCalledWith(`${mockConfig.apiUrl}/api/keys/mock-key`);
    });

    it("should request the API with origins", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", port: 8000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: { origin: "localhost" },
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new RelayServer(mockConfig, {});
      const result = await server.validateKey(mockSocket);

      expect(fetch).toBeCalledWith(
        `${mockConfig.apiUrl}/api/keys/mock-key?origin=localhost`
      );
    });

    it("should return true if the returned status is 200", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", port: 8000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: {},
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 200 });

      const server = new RelayServer(mockConfig, {});
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(true);
    });

    it("should return false if the returned status is not 200", async () => {
      const mockConfig = { apiUrl: "http://localhost:3000", port: 8000 };
      const mockSocket = {
        disconnect: jest.fn(),
        request: {
          headers: {},
          _query: { key: "mock-key" }
        }
      };

      (fetch as any).mockResolvedValue({ status: 404 });

      const server = new RelayServer(mockConfig, {});
      const result = await server.validateKey(mockSocket);

      expect(result).toBe(false);
    });
  });
});
