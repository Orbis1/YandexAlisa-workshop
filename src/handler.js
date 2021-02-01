const replies = require("./replies");
const { WELCOME, KREMLIN, INTRO, ONETYEAR } = require("./phrases");

exports.handler = (session, request, state) => {
  const { location, user: {user_id} } = session;
  const { session: { context }, application} = state;
  const { type, command, nlu } = request;
  const intent = nlu && nlu.intents ? Object.keys(nlu.intents) : [];

  console.log(`>> request:`, JSON.stringify(request),);
  console.log(`>> state:`, JSON.stringify(state));
  console.log(`>> session:`, JSON.stringify(session));

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
          false,
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
        if(context === 'stageOneStory') return replies.quest('Для продолжения перейди по ссылке', 'step1');
        break;
      case intent.includes("location"):
        console.log("the user is near the object");
        if(context === 'stageOne') return replies.quest('Для продолжения перейди по ссылке', 'step1');
        break;
      case intent.includes("restart"):
        console.log("the user wants to starover");
        return replies.restart();
      default:
        return replies.fallback(command);
    }

  } else if (type = "Geolocation.Rejected") {
    

  } else {
    if(context === 'requestGeolocation') return replies.bye('Без доступа к геолокации сыграть не выйдет.');
    return replies.askGeo(isNewSession);
  }
}

function storyKremlin(stage) {
  const {txt, tts=txt, card} = KREMLIN;
  return replies.yesNoQuestion(txt, tts, card, stage)
}

function storyBegin(stage) {
  const {txt, tts=txt} = INTRO;
  return replies.yesNoQuestion(txt, tts, false, stage)
}

function storyOneT(stage) {
  const {txt, tts=txt} = ONETYEAR;
  return replies.iAmHereQuestion(txt, tts, stage)
}
