const micro = require('micro');
const R = require('ramda');

// достопримечательности с координатами
const sights = {
  1: {
    name: 'Фонтан Поцелуй',
    location: {
      lat: 59.915029,
      lon: 30.511382, 
    },
    isVisited: false,
  }
}

const server = micro(async (req, res) => {
  const { session, request, state, version } = await micro.json(req);
  const { location } = session;
  const {session: { context }} = state;
  const { type, command } = request;

  function makeRequest({ text = '', directives = {}, endSession = false,  userStateUpdate = {}, context = '' , buttons = []}) {
    const response = {
      'response': {
        'text': text,
        'buttons': buttons,
        'end_session': endSession,
        'directives': directives,
      },
      'session_state': { 
        context: context 
      }, 
      'user_state_update': userStateUpdate,
      'version': version,
    };
    console.log('response:', JSON.stringify(response));
    return response;
  }


  function askGeo() {
    const directives = { "request_geolocation": {} };
    const text = 'нужен доступ к геолокации';
    return makeRequest({text, directives})
  }

  function sayGeo(location) {
    const { lat, lon, accuracy } = location;
    const context = 'sayGeo';
    const buttons = [ { title: 'Сохранить', hide: true }, { title: 'Далее', hide: true } ];
    const text = `Ваши координаты: ${lat} северной долготы, ${lon} южной широты. Погрешность ${accuracy}`;
    return makeRequest({ text, context, buttons });
  }

  function saveGeo(location) {
    const id = `f${(~~(Math.random()*1e8)).toString(16)}`;
    const userStateUpdate = {location, ...{id: id}};
    const { lat, lon, accuracy } = location;
    const context = 'sayGeo';
    const buttons = [ { title: 'Сохранить', hide: true }, { title: 'Далее', hide: true } ];
    const text = `Ваши координаты: ${lat} северной долготы, ${lon} южной широты. Погрешность ${accuracy}`;
    return makeRequest({ text, context, buttons, userStateUpdate });
  }

  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  function sayDistance() {
    const { lat, lon, accuracy } = location;
    const { lat: lat1, lon: lon1} = sights[1].location;
    const distance = Math.trunc(getDistanceFromLatLonInKm(lat, lon, lat1, lon1) * 1000);
    const context = 'sayDistance';
    const buttons = [ { title: 'Далее', hide: true } ];
    const text = `Расстояние до объекта ${distance} ± ${Math.trunc(accuracy)} метров`;
    return makeRequest({ text, context, buttons });
  }

  function handler() {
    console.log('request:', JSON.stringify(request));
    console.log('state:', JSON.stringify(state));

    

    if(location) {
      if(/сохранить/i.test(command) && context === 'sayGeo') {
        return saveGeo(location);
      } else {
        return sayDistance();
      }
    } else {
      return askGeo();
    }
  }

  return handler();

});


const PORT = 3000;
server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}, tunnel: http://localhost:4040`));

/*
{
  "meta": {
    "locale": "ru-RU",
    "timezone": "UTC",
    "client_id": "ru.yandex.searchplugin/7.16 (none none; android 4.4.2)",
    "interfaces": {
      "screen": {},
      "payments": {},
      "account_linking": {},
      "geolocation_sharing": {}
    }
  },
  "session": {
    "message_id": 1,
    "session_id": "ee67f0c1-f01c-4150-8c61-f109ff5183d9",
    "skill_id": "5fb9aa09-f841-499d-8a83-f469b5448553",
    "user": {
      "user_id": "FFCBB8172A1D1C4BD4E7B37EE3C20CC895D4716DF808C8473D8A8B95E9EAE456"
    },
    "application": {
      "application_id": "9CCE201EB1888F74D54490F39097517E030FAA3209C69D396F2E5B6A0708E10A"
    },
    "user_id": "9CCE201EB1888F74D54490F39097517E030FAA3209C69D396F2E5B6A0708E10A",
    "new": false
  },
  "request": {
    "command": "да",
    "original_utterance": "Да",
    "nlu": {
      "tokens": [
        "да"
      ],
      "entities": [],
      "intents": {
        "YANDEX.CONFIRM": {
          "slots": {}
        },
        "agree": {
          "slots": {}
        }
      }
    },
    "markup": {
      "dangerous_context": false
    },
    "type": "SimpleUtterance"
  },
  "state": {
    "session": {
      "context": "location access"
    },
    "user": {
      "target": 1
    },
    "application": {}
  },
  "version": "1.0"
}
*/