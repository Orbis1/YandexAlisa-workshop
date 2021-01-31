const { WELCOME, ASKGEO, KREMLIN } = require("./phrases");

function makeResponse({
  text = "",
  tts = "",
  card = false,
  buttons = [],
  endSession = false,
  directives = {},
  context = "",
  userStateUpdate = {},
  sightId = "",
  level = "",
  prevDistance = "",
}) {
  const response = {
    response: {
      text: text,
      tts: tts ? tts : text,
      buttons: buttons,
      end_session: endSession,
      directives: directives,
    },
    session_state: {
      context: context,
      prevDistance: prevDistance,
    },
    user_state_update: userStateUpdate,
    version: '1.0',
  };

  console.log(">>response:", JSON.stringify(response));
  if(card) response.response['card'] = card;
  return response;
}

exports.clearUserState = (userState) => {
  const keys = Object.keys(userState);
  const text = keys.length===0 ? 'User state is empty': JSON.stringify(keys) + 'will be delete';
  const userStateUpdate = Object.fromEntries(keys.map(item => [item, null]));
  return makeResponse({ text, userStateUpdate });
}


exports.askGeo = (welcome) => {
  const directives = { request_geolocation: {} };
  const text = welcome ? `${WELCOME.txt} \n ${ASKGEO.txt}` : `${ASKGEO.txt}`;
  const tts = welcome ? `${WELCOME.tts} \n ${ASKGEO.tts}` : `${ASKGEO.tts}`;
  return makeResponse({ text, tts, directives });
}

exports.say = (text, tts, prevDistance) => {
  const buttons = [{ title: "Далее", hide: true }];
  return makeResponse({ text, tts, prevDistance, buttons});
}

exports.sayGeo = (location) => {
  const { lat, lon, accuracy } = location;
  const context = "sayGeo";
  const buttons = [
    { title: "Сохранить", hide: true },
    { title: "Далее", hide: true },
  ];
  const text = `Ваши координаты: ${lat} северной долготы, ${lon} южной широты. Погрешность ${accuracy}`;
  return makeResponse({ text, context, buttons });
}

exports.sayDistance = (userLocation, targetLocation) => {
  const { lat, lon, accuracy } = userLocation;
  const { lat: lat1, lon: lon1 } = targetLocation;
  const distance = Math.trunc(
    getDistanceFromLatLonInKm(lat, lon, lat1, lon1) * 1000
  );
  const context = "sayDistance";
  const buttons = [{ title: "Далее", hide: true }];
  const text = `Расстояние до объекта ${distance} ± ${Math.trunc(accuracy)} метров`;
  return makeResponse({ text, context, buttons });
}

exports.getDistance = (userLocation, targetLocation) => {
  const { lat, lon, accuracy } = userLocation;
  const { lat: lat1, lon: lon1 } = targetLocation;
  const distance = Math.trunc(
    getDistanceFromLatLonInKm(lat, lon, lat1, lon1) * 1000
  );

  return {
    distance: distance,
    accuracy: Math.trunc(accuracy)
  };
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

exports.fallback = (command = "") => {
  const text = `Вы сказали ${command}. Команда не распознана. Попробуйте переформулировать`;
  return makeResponse({ text });
}

exports.bye = (text = "") => {
  return makeResponse({ text: text += ` Ну чтож. Увидимся в следующий раз` , endSession: true });
}

exports.yesNoQuestion = (question, tts = question, card = false, context) => {
  const text = question;
  const buttons = [{ title: "Да", hide: true }, { title: "Нет", hide: true }];
  return makeResponse({ text, tts, context, buttons, card });
}

exports.iAmHereQuestion = (question, tts, context) => {
  const text = question;
  const buttons = [{ title: "Я на месте", hide: true }];
  return makeResponse({ text, tts, context, buttons });
}

exports.quest = (question, context) => {
  const text = question;
  const buttons = [{ title: "Перейти к квесту", hide: false, url: 'https://dialogs.yandex.ru/share?key=bf124FfJmnAYrSFiz1pF' }];
  return makeResponse({ text, context, buttons });
}

exports.restart = () => {
  return makeResponse({ text: 'Начинаю заново', context: ''});
}




