const { RelayServer } = require("../");

function initialize() {
  const server = new RelayServer("example", {});

  server.ws.addCommand("sayHello", ({ name }) => {
    return `hello, ${name}`;
  });

  return server;
}

const s = initialize();

s.start({
  ws: {
    port: 9000
  }
});
