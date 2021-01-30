const micro = require("micro");
const R = require("ramda");
const replies = require("./replies");
const { WELCOME, KREMLIN, INTRO, ONETYEAR } = require("./phrases");

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

    console.log(">>request:", JSON.stringify(request));
    console.log(">>state:", JSON.stringify(state));

    const isNewSession = session.new;

    
    if (location) {
      // const {distance, accuracy} = replies.getDistance(location, sights[1].location);
      const {session: {prevDistance}} = state;
      const distance = 0;

      switch (true) {
        // пользователь возле объекта
        case distance < 100 && !context:
          return replies.yesNoQuestion(
            'Вижу что ты находишься у ворот Кремлёвских. Рассказать про Кремль подробнее?',
            'Вижу что ты находишься у ворот Кремлёвских. Рассказать про Кремль подробнее?',
             'startKremlin');
        case intent.includes("YANDEX.CONFIRM"):
          console.log("the user agrees");
          if(context === 'startKremlin') return storyKremlin('startQuest')
          if(context === 'startQuest') return storyBegin('stageOneStory');
          if(context === 'stageOneStory') return storyOneT('stageOne');
          break;
        case intent.includes("YANDEX.REJECT"):
          console.log("the user disagrees");
          if(context === 'startKremlin') return storyBegin('stageOneStory');
          if(context === 'startQuest') return replies.bye();
          if(context === 'stageOneStory') return replies.quest('Кто тут пожаловал? Ах-ха-ха', 'step1');
          break;
        case intent.includes("location"):
          console.log("the user is near the object");
          if(context === 'stageOne') return replies.quest('Кто тут пожаловал? Ах-ха-ха', 'step1');
        
          break;
        default:
          return replies.fallback(command);
      }

    } else {
      if(context === 'requestGeolocation') return replies.bye('Без доступа к геолокации сыграть не выйдет.');
      return replies.askGeo(isNewSession);
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

function storyKremlin(stage) {
  const {txt, tts=txt} = KREMLIN;
  return replies.yesNoQuestion(txt, tts, stage)
}

function storyBegin(stage) {
  const {txt, tts=txt} = INTRO;
  return replies.yesNoQuestion(txt, tts, stage)
}

function storyOneT(stage) {
  const {txt, tts=txt} = ONETYEAR;
  return replies.iAmHereQuestion(txt, tts, stage)
}
