import RelayConnection from "../src/RelayConnection";
import RelayServer from "../src/RelayServer";
jest.mock("../src/RelayServer");

describe("RelayConnection", () => {
  const mockRequest = { _query: {} };
  describe("constructor", () => {
    it("should construct an RelayConnection", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      const mockSocket = { request: mockRequest, on: jest.fn() };

      const client = new RelayConnection(mockServer, mockSocket);

      expect(client).toBeDefined();
      expect(client.server).toBe(mockServer);
      expect(client.socket).toBe(mockSocket);
    });

    it("should listen for messages", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      const mockSocket = { request: mockRequest, on: jest.fn() };

      const client = new RelayConnection(mockServer, mockSocket);

      expect(mockSocket.on).toBeCalledWith("command", expect.any(Function));
    });
  });

  describe("id", () => {
    it("should return an id", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      const mockSocket = {
        request: mockRequest,
        on: jest.fn(),
        id: "socket-id"
      };
      const client = new RelayConnection(mockServer, mockSocket);

      expect(client.id).toBe(mockSocket.id);
    });
  });

  describe("listenForMessages", () => {
    it("should subscribe to the command event", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      const mockSocket = { request: mockRequest, on: jest.fn() };
      new RelayConnection(mockServer, mockSocket);

      expect(mockSocket.on).toBeCalledWith("command", expect.any(Function));
    });

    it("should invoke a command handler if one is registered", () => {
      const mockServerHandler = jest.fn();
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      mockServer.commands = { test: mockServerHandler };
      const mockSocket = { request: mockRequest, on: jest.fn() };
      const mockData = { name: "test", args: { xyz: "123" } };
      const mockCallback = jest.fn();

      const client = new RelayConnection(mockServer, mockSocket);
      const mockCommandHandler = mockSocket.on.mock.calls[1][1];

      mockCommandHandler(mockData, mockCallback);

      expect(mockServerHandler).toBeCalledWith(
        client,
        mockData.args,
        mockCallback
      );
    });

    it("should not invoke a handler if one is not defined", () => {
      const mockConfig = { apiUrl: "", port: 8000 };
      const mockServer = new RelayServer(mockConfig, {});
      const mockSocket = { request: mockRequest, on: jest.fn() };
      const mockData = { name: "test", args: { xyz: "123" } };
      const mockCallback = jest.fn();

      const client = new RelayConnection(mockServer, mockSocket);
      const mockCommandHandler = mockSocket.on.mock.calls[0][1];

      mockCommandHandler(mockData, mockCallback);
    });
  });
});
