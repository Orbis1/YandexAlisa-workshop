const micro = require("micro");
const R = require("ramda");
const replies = require("./replies");
const { WELCOME } = require("./phrases");

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


  function handler(session, request, state) {
    const { location } = session;
    const { session: { context }, application} = state;
    const { type, command, nlu } = request;
    const intent = nlu && nlu.intents ? Object.keys(nlu.intents) : [];

    console.log("request:", JSON.stringify(request));
    console.log("state:", JSON.stringify(state));

    const welcome = session.new ? 'Привет!' : '';

    
    if (location) {
      const {distance, accuracy} = replies.getDistance(location, sights[1].location);
      const {session: {prevDistance}} = state;
      switch (true) {
        case prevDistance === undefined:
          return replies.say(`Расстояние до объекта ${distance} метров`, `Клубок покатился`, distance);
        case distance > prevDistance:
          return replies.say(`Расстояние до объекта ${distance} метров`, `Холоднее`, distance);
        case distance === prevDistance:
          return replies.say(`Расстояние до объекта ${distance} метров`, `Вы стоите на месте`, distance);
        case distance < prevDistance:
          if (distance < 100) return replies.say(`Расстояние до объекта ${distance} метров`, `Горячо`, distance);
          if (distance < 300) return replies.say(`Расстояние до объекта ${distance} метров`, `Тепло`, distance);
          if (distance > 300) return replies.say(`Расстояние до объекта ${distance} метров`, `Теплее`, distance);
        // case intent.includes("YANDEX.CONFIRM"):
        //   console.log("user agree");
        //   break;
        // case intent.includes("YANDEX.REJECT"):
        //   console.log("user disagree");
        //   break;
        default:
          return replies.fallback(command);
      }
    } else {
      return replies.askGeo(welcome);
    }



  }
  return handler(session, request, state);
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(
    `Server started on http://localhost:${PORT}, tunnel: http://localhost:4040`
  )
);
