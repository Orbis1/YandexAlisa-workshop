def make_response(text="Текст ответа здесь",tts=None, buttons=None,
step=None, place=None, status=None, card=None):
    response = {
            'text':text,
            'tts': tts if tts is not None else text,
            # "end_session": false
        }
    if buttons is not None:
        response['buttons'] = buttons
    if card is not None:
        response['card']=card
    webhook_response={
        'response': response,
        "application_state": {
        "step": step,
        "place_seen": place,
        "status": status
        },
        'version':'1.0',
    }
    return webhook_response

def fallback(event):
    text="Сорян"
    return make_response(text)

def button(title, payload=None, url=None, hide=False):
    button = {
        'title': title,
        'hide': hide,
    }
    if payload is not None:
        button['payload'] = payload
    if url is not None:
        button['url'] = url
    return button
def image_gallery(image_ids,description):
    return {
        'type':'BigImage',
        'image_id':image_ids,
        'description':description
    }