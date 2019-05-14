import RelayConnection from "../src/RelayConnection";

describe("RelayConnection", () => {
  const mockRequest = { _query: {} };
  describe("constructor", () => {
    it("should construct an RelayConnection", () => {
      const mockServer = "mockServer";
      const mockSocket = { request: mockRequest, on: jest.fn() };

      const client = new RelayConnection(mockServer, mockSocket);

      expect(client).toBeDefined();
      expect(client.server).toBe(mockServer);
      expect(client.socket).toBe(mockSocket);
      expect(client.data).toEqual({});
    });

    it("should listen for messages", () => {
      const mockServer = "mockServer";
      const mockSocket = { request: mockRequest, on: jest.fn() };

      const client = new RelayConnection(mockServer, mockSocket);

      expect(mockSocket.on).toBeCalledWith("command", expect.any(Function));
    });
  });

  describe("id", () => {
    it("should return an id", () => {
      const mockServer = "mockServer";
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
      const mockServer = "mockServer";
      const mockSocket = { request: mockRequest, on: jest.fn() };

      const client = new RelayConnection(mockServer, mockSocket);

      expect(mockSocket.on).toBeCalledWith("command", expect.any(Function));
    });

    it("should invoke a command handler if one is registered", () => {
      const mockServerHandler = jest.fn();
      const mockServer = { commands: { test: mockServerHandler } };
      const mockSocket = { request: mockRequest, on: jest.fn() };
      const mockData = { name: "test", args: { xyz: "123" } };
      const mockCallback = jest.fn();

      const client = new RelayConnection(mockServer, mockSocket);
      const mockCommandHandler = mockSocket.on.mock.calls[1][1];

      mockCommandHandler(mockData, mockCallback);

      expect(mockServerHandler).toBeCalledWith(client, mockData.args, mockCallback);
    });

    it("should not invoke a handler if one is not defined", () => {
      const mockServer = { commands: {} };
      const mockSocket = { request: mockRequest, on: jest.fn() };
      const mockData = { name: "test", args: { xyz: "123" } };
      const mockCallback = jest.fn();

      const client = new RelayConnection(mockServer, mockSocket);
      const mockCommandHandler = mockSocket.on.mock.calls[0][1];

      mockCommandHandler(mockData, mockCallback);
    });
  });
});
