const micro = require('micro');
const R = require('ramda');
const replies = require('./replies');
const data = require('./data');


const server = micro(async (req, res) => {
  const { version, request, session, state } = await micro.json(req);
  const sessionState = state.session || false;
  const userState = state.user || false;
  

  // варианты
  /*
  1. Новый пользователь, первый запуск: 
    sessionState есть, но пустой
    userState.gps || false = false
    userTarget = false
  2. Пользователь, у которого закончился срок предоставления геолокации
    userState.gps.endTime < Date.Now()



  */

  

  return checkAnswer(state, request.command, version, session, request)
});


 
function isGeoAllowed(time) {
  const currentTime = Date.now();
  return currentTime < time;
}

function checkAnswer(state, command, version, session, intent) {
  // const intents = Object.keys(intent);

  
  const context = state.session && state.session.context; /*
  показывает на какую тему был задан вопрос в предыдущем request-e
   location access - запросили доступ к геолокации
   last game - у пользователя есть прогрес в игре и мы справшиваем хочет ли он продолжить старую игру или начать новую
   */
  console.log(context);
  
  // default response
  let response = {
    "response": {
      "text": "",
      "end_session": false
    },
    "version": version
  }

  if (session.new) {
    response.response["text"] += 'Приветствую! Механика навыка такая-то.\n';

  }

  const userTarget = state.user && state.user.target;
  if (!userTarget) {
    return;
    // новый пользователь. добавить данные в state.user
    response["user_state_update"] = {
      target: 1000, 
      data: {
        1: {
          nameObj: 'Тысячелетие России',
          location: { x: 20, y: 20 },
          reference: 'Купол железный',
          isVisited: false
        },
      }
    };
  }


  const gpsAccess = state.user.gps && state.user.gps.endTime;
  console.log(response.session_state && response.session_state.context);
  
  if (!session.location && !(response.session_state && response.session_state.context)) {
    // разрешение на доступ гео-локации просрочено или отсутствует
    // запросить разрешение
    response.response["text"] += 'Для работы навыка нужен доступ к гео-локации';
    // response.response["buttons"] = [{ title: 'Да', hide: true }, { title: 'Нет', hide: true }];
    response.response["directives"] = {"request_geolocation": {}};
    response['session_state'] = {"context": "location access"}; // сохраняем в сессии признак, чтобы потом понять когда не него ответят
  };
  

  if(userTarget!==1000 && !(response.session_state && response.session_state.context)) {
    response.response["text"] += 'У вас есть загаданный объект. Прододжить или начать новую игру?';
    response.response["buttons"] = [{ title: 'Продолжить', hide: true }, { title: 'Новая игра', hide: true }];
    response['session_state'] = {"context": "last game"}; // сохраняем в сессии признак, чтобы потом понять когда не него ответят
  }


  // ДА
  if (/да/i.test(command)) {
    // Ответ на запрос по поводу представления доступа к гео-локации
    if(context === "location access") {
      // рассчитать время окончания доступа
      const newEndTime = Date.now() + 1*60*60*1000 // даём доступ на час. час переводим в миллисекунды
      // добавить в state.user.gps
      response["user_state_update"] = { gps: { endTime: newEndTime } };
      response['session_state'] = {};
    }
  }

  // НЕТ
  if (/нет/i.test(command)) {
    // Ответ на запрос по поводу представления доступа к гео-локации
    if(context === "location access") {
      // выход из навыка
      response.response["text"] = 'До свидания';
      response.response["end_session"] = true;
    }
  }

  // Продожить
  if (/продолжить/i.test(command)) {
    // Ответ на запрос по поводу продолжения предущей игры
    if(context === "last game") {
      // Перейти к игре
      response['session_state'] = {};
    }
  }

  // Продожить
  if (/Новая игра/i.test(command)) {
    // Ответ на запрос по поводу продолжения предущей игры
    if(context === "last game") {
      // Перезапиcать target
      response["user_state_update"] = { target: 1 };

      // Перейти к игре
      response['session_state'] = {};

    }
  }

  // очистить стейт
  if (command === 'clear all') {
    response["user_state_update"] = { 
      target: 1,
      data: null,
      gps: null,
    };

  }



  


 



  // // добавить в стейт state.user data еслиесли его нет 

  // if (/сдаюсь/i.test(command)) {
  //   const { number1, number2 } = sessionState.question;
  //   const answer = number1 + number2;
  //   question = generateQuestion(sessionState);
  //   return replies.capitulate(answer, question);
  // }

  // if (/давай до свидания/i.test(command)) {
  //   return replies.farewell();
  // }

  // let question = sessionState.question;
  // if (!question) {
  //   question = generateQuestion(sessionState);
  //   return replies.firstQuestion(question);
  // }

  // if (isCorrectAnswer(question, command)) {
  //   question = generateQuestion(sessionState);
  //   return replies.correctAnswer(question);
  // }

  // return replies.incorrectAnswer(question);

  const loc = JSON.stringify(session.location);
  if (loc) response.response["text"] = `\n Ваши координаты ${loc}`;
  console.log('location', loc);

  return response
}

function isCorrectAnswer(question, command) {
  const matches = command.match(/[0-9]+/);
  const correctAnswer =  question.number1 + question.number2;
  return matches && Number(matches) === correctAnswer;
}

function generateQuestion(sessionState) {
  const question = {
    number1: Math.ceil(Math.random() * 20),
    number2: Math.ceil(Math.random() * 20),
  };
  sessionState.question = question;
  return question;
}

const PORT = 3000;
server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}, tunnel: http://localhost:4040`));
