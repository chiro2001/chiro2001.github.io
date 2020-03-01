# -*- coding: utf8 -*-
# 读写
key_rw = {
    'code': 0,
    'id': 'AKID2sTqzvX7NPCrHRP1RecKn00mJbfUOMQE',
    'key': '*'
}
# 只读
key_r = {
    'code': 1,
    'id': 'AKIDv9Aiw0tTMwA9vULgJYAptiOi38FYFLfy',
    'key': '*'
}

import json
def main_handler(event, context):
    print("Received event: " + json.dumps(event, indent = 2)) 
    print("Received context: " + str(context))
    password = event['pathParameters']['password']

    if password != '1352040930':
        return key_r
    
    return key_rw