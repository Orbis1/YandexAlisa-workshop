const micro = require("micro");
const handler = require('./handler');

// достопримечательности с координатами
const sights = {
  1: {
    name: "Перекрёсток в парке",
    location: {
      lat: 59.911768,
      lon: 30.508970,     
    },
    isVisited: false,
  },
};

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

