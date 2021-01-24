const micro = require('micro');
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

  

  return checkAnswer(state, request.command, version, session)
});


 
function isGeoAllowed(time) {
  const currentTime = Date.now();
  return currentTime < time;
}

function checkAnswer(state, command, version, session) {
  const welcome = session.new ? 'Приветствую! Механика навыка такая-то.\n' : '';
  
  // default response
  let response = {
    "response": {
      "text": "",
      "end_session": false
    },
    "version": version
  }

  const userTarget = state.user.data && state.user.data.target || false;
  if (!userTarget) {
    // новый пользователь. добавить данные в state.user
    response["user_state_update"] = data;
  }

  const gpsAccess = state.user.data && state.user.data.gps && state.user.data.gps.endTime || false;
  if (!gpsAccess || !isGeoAllowed(gpsAccess)) {
    // разрешение на доступ гео-локации просрочено или отсутствует
    // запросить разрешение
    response.response["text"] += 'Для работы навыка нужен доступ к гео-локации. Разрешить?';
    response.response["buttons"] = [{ title: 'Да', hide: true }, { title: 'Нет', hide: true }];
    response['session_state'] = {"context": "location access"}; // сохраняем в сессии признак, чтобы потом понять когда не него ответят
  };

  // ДА
  if (/да/i.test(command)) {
    const context = state.session.context;
    // Ответ на запрос по поводу представления доступа к гео-локации
    if(context === "location access") {
      // рассчитать время окончания доступа
      const newEndTime = Date.now() + 1*60*60*1000 // даём доступ на час. час переводим в миллисекунды
      // добавить в state.user.gps
      response["user_state_update"] = { data: {gps: { endTime: newEndTime } } };
    }
  }

  // НЕТ
  if (/нет/i.test(command)) {
    const context = state.session.context;
    // Ответ на запрос по поводу представления доступа к гео-локации
    if(context === "location access") {
      // выход из навыка
      response.response["text"] = 'До свидания';
      response.response["end_session"] = true;
    }
  }

    // очистить стейт
    if (command === 'clear all') {
      response["user_state_update"] = { 
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
