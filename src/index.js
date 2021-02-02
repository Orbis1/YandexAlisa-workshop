const micro = require("micro");
const handler = require('./handler');

const server = micro(async (req, res) => {
  const { session, request, state } = await micro.json(req);
  return handler.handler(session, request, state);
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(
    `Server started on http://localhost:${PORT}, tunnel: http://localhost:4040`
  )
);

