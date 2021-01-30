from fun import make_response, fallback, button
from person import person

def handler(event, context):
    intents  = event['request'].get('nlu',{}).get('intents')
    text ={'Куку тест функции'}
    # Перенести
    step=event.get('state').get('application').get('step')
    status=event.get('state').get('application').get('status')
    
    if event['session']['new']:
        
        return make_response(text="Первый", buttons=[
            button('Купол', hide=True),button('Звонница', hide=True),
            button('Собор', hide=True),],step=0)
    elif  'place_pers' in intents: #Первый запуск нового объекта
        place_first=event['request'].get('nlu',{}).get('intents').get('place_pers').get('slots').get('place').get('value')
        return person(event,step,place_first)
    elif step >0:
        place_early=event.get('state').get('application').get('place_seen')
        return person(event,step,place_early, status=status)
    else:
        return fallback(event)