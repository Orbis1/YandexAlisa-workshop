const { WELCOME, ASKGEO, KREMLIN } = require("./phrases");
const sights = require("./sights");

function makeResponse({
  text = "",
  tts = "",
  card = false,
  buttons = false,
  endSession = false,
  directives = false,
  context = false,
  userStateUpdate = false,
  target = false,
}) {
  let response = {
    response: {
      text: text,
      tts: tts ? tts : text,
      end_session: endSession,
    },
    version: '1.0',
  };

  if(userStateUpdate) response['user_state_update'] = userStateUpdate;
  if(target || context) {
    response['session_state']={};
    if(target) response.session_state['target'] = {target: target};
    if(context) response.session_state['context'] = {context: context};
  }
  if(card) response.response['card'] = card;
  if(directives) response.response['directives'] = directives;
  if(buttons) response.response['buttons'] = buttons;

  console.log(">>response:", JSON.stringify(response));
  return response;
}

exports.clearUserState = (userState) => {
  const keys = Object.keys(userState);
  const text = keys.length===0 ? 'User state is empty': JSON.stringify(keys) + 'will be delete';
  const userStateUpdate = Object.fromEntries(keys.map(item => [item, null]));
  return makeResponse({ text, userStateUpdate });
}

exports.saveTarget = (target) => {
  const {distance} = target;
  const text =`Есть`;
  return makeResponse({ text, target });
}


exports.askGeo = (welcome) => {
  const directives = { request_geolocation: {} };
  const hi = welcome ? `Привет странник. Я проведу тебя до места заветного. Если потеряшься спроси "Далёко ещё?" или "Где я?". Если надоест блуждать скажи "Хватит" \n` : '';
  const text = `Дай мне свой компас, прошу. Я потом обязательно верну его, в целости и сохранности`;
  return makeResponse({ text: hi + text, directives });
}

exports.forestallGeo = () => {
  const userStateUpdate = {isGeoAllowed: false};
  return makeResponse({ text, userStateUpdate });
}

exports.say = (text, tts, prevDistance) => {
  const buttons = [{ title: "Далее", hide: true }];
  return makeResponse({ text, tts, prevDistance, buttons});
}

exports.sayGeo = (location) => {
  const { lat, lon, accuracy } = location;
  const context = "sayGeo";
  const buttons = [
    { title: "Где я?", hide: true },
    { title: "Далеко ещё?", hide: true },
    { title: "Хватит?", hide: true },
  ];
  const text = `Ваши координаты: ${lat.toFixed(2)} северной долготы, ${lon.toFixed(2)} южной широты. Погрешность ${Math.round(accuracy)}`;
  return makeResponse({ text, context, buttons });
}

exports.sayDistance = (userLocation, targetLocation, targetName) => {
  const { lat, lon, accuracy } = userLocation;
  const { lat: lat1, lon: lon1 } = targetLocation;
  const distance = Math.trunc(
    getDistanceFromLatLonInKm(lat, lon, lat1, lon1) * 1000
  );
  const context = "sayDistance";
  const buttons = [{ title: "А теперь?", hide: true }];
  const text = `До ${targetName} осталось ещё ${distance} ± ${Math.trunc(accuracy)} метров`;
  return makeResponse({ text, context, buttons });
}

function getDistance (userLocation, targetLocation) {
  // console.log(targetLocation)
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


exports.getNearest = (userLocation) => {
  distances = Object.keys(sights.sights).map(key => {
    const name = sights.sights[key].name;
    const {distance} = getDistance(userLocation, sights.sights[key].location);
    // console.log(`расстояние до ${name} составляет ${distance} метров`)
    return {key, distance};
  })
  const nearest = distances.reduce((prev, curr) => prev.distance < curr.distance ? prev : curr);
  return sights.sights[nearest.key];
}




