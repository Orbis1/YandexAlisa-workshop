/**
 * Приветственное сообщение при входе в навык.
 */
exports.welcome = () => {
    const hi = getRandomElement(['Салам алейкум!','Хэй','Ииди сюда слыш']);
    
    return {
        text: `${hi}`,
        tts: `${hi} Я твой учытэль по матише. Начнём урок?`,
        buttons: [
            { title: 'Поехали!', hide: true},
        ],
        end_session: false
    };
};

exports.firstQuestion = ({ number1, number2 }) => {
    return {
        text: `Сколько будет ${number1} + ${number2} = ?`,
        tts: `Сколько будет ${number1} + ${number2} ээже`,
        buttons: answerButtons,
        end_session: false
    };
};

exports.incorrectAnswer = ({ number1, number2 }) => {
    const no = getRandomElement(['Уф!','Нэт брат','Зачэм так гаваришь а']);
    return {
        text: `Неверно. Попробуй ещё раз: ${number1} + ${number2} = ?`,
        tts: `${no}! Давай ещё раз: ${number1} + ${number2} это сколько ээже`,
        buttons: answerButtons,
        end_session: false
    };
};

exports.correctAnswer = ({ number1, number2 }) => {
    const yes = getRandomElement(['Агонь!','Вай красаучик']);
    return {
        text: `Правильно! Следующий вопрос: ${number1} + ${number2} = ?`,
        tts: `${yes} Следующий вопрос: ${number1} + ${number2} это сколько ээже`,
        buttons: answerButtons,
        end_session: false
    };
};

exports.farewell = () => {
    const buy = getRandomElement(['Удачи брат!','Имшалла', 'Давай до свиданья']);
    return {
        text: `${buy}`,
        end_session: true
    };
};

/**
 * Реакция на "сдаюсь".
 *
 * @param {Number} answer
 * @param {Number} number1
 * @param {Number} number2
 */
exports.capitulate = (answer, { number1, number2 }) => {
    return {
      text: `Правильный ответ ${answer}. Задам другой пример: ${number1} + ${number2} = ?`,
      tts: `<speaker audio="alice-sounds-human-laugh-5.opus">Правильный ответ ${answer}. Задам другой пример: ${number1} + ${number2}`,
      buttons: [answerButtons],
      end_session: false
    };
  };
  
  const capitulateButton = {
    title: 'Сдаюсь', hide: true,
  };

  const endButton = {
    title: 'Давай до свидания', hide: true,
  };

  const answerButtons = [
    capitulateButton,
    endButton
  ];

  function getRandomElement(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  } 