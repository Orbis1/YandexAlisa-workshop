const replies = require("./replies");
const { WELCOME, KREMLIN, INTRO, ONETYEAR } = require("./phrases");

exports.handler = (session, request, state) => {
  console.log('>>request', JSON.stringify(request));
  console.log('>>session', JSON.stringify(session.location));
  console.log('>>state', JSON.stringify(state));
  const { location: userLocation } = session;
  // const { session: { target }} = state;

  if (userLocation) {
    // если есть доступ к геолокации
    const target = replies.getNearest(userLocation);
    console.log("ближайший объект", JSON.stringify(target))
    return replies.sayDistance(userLocation, target.location, target.name);
 
  } else {
    return replies.askGeo(session.new);
  }

}