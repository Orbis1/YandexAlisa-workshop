from fun import make_response, fallback, button,image_gallery
from resource import pers_step, pers_help

def person (event,step,place, status=None):
    
    intents  = event['request'].get('nlu',{}).get('intents')
    if step<3:
        text=pers_step[place][step][0]
        tts=pers_step[place][step][1]
        status=pers_step[place][step][2]
    if place is not None:
        if step==0:
            return make_response(text=text,tts=tts,buttons=[
            button('Жар-птицу', hide=True)],step=step+1, place=place,
            status=status)
        elif step==1:
            if 'gift' in intents:
                return make_response(text=text,tts=tts,buttons=[
                    button('Да', hide=True),button('Нет', hide=True)],step=step+2, place=place,
                                    status=status)
            else:
                step=step+1
                text=pers_step[place][step][0]
                tts=pers_step[place][step][1]
                status=pers_step[place][step][2]
                return make_response(text=text,tts=tts, buttons=[
                    button('Да', hide=True),button('Нет', hide=True)],step=step+1, place=place,
                                    status=status)
        elif step == 3:
            if 'answer_da' in intents or 'YANDEX.CONFIRM' in intents:
                return make_response(text='Здесь будет загадка',tts='Здесь будет загадка',step=step+1, place=place,
                                    status='zagadka')
            elif 'net' in intents or 'YANDEX.REJECT' in intents:
                if status!="help_not_end":
                    text=pers_help[999][0][0]
                    tts=pers_help[999][0][1]
                    status=pers_help[999][0][2]
                    card=image_gallery(pers_help[999][0][3],description=text)
                    return make_response(text=text,tts=tts, buttons=[
                    button('Да', hide=True),button('Нет', hide=True)],step=step, place=place,
                                    status=status, card=card)
                elif status=='help_not_end':
                    text=pers_help[999][1][0]
                    tts=pers_help[999][1][1]
                    status=pers_help[999][1][2]
                    card=image_gallery(pers_help[999][1][3],description=text)
                    return make_response(text=text,tts=tts, buttons=[
                    button('Да', hide=True),],step=step+1, place=place,
                                    status=status, card=card)
                else:
                    return fallback(event)
                    
            else:
                return fallback(event)
        else:
            return fallback(event)