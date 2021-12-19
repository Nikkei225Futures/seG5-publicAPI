/**
 * @file サーバ全体を制御するモジュール, クライアントからのメッセージによって各モジュールを呼び出す.
 */

const server = require('ws').Server;
const ws = new server({port: 8889});
const api = require('./api.js');
let uuid4 = require('uuid4');


ws.on('connection', sock => {

    sock.id = uuid4();

    sock.on("message", msg => {
        console.log("=============================");
        console.log("msg from: " + sock.id);

        msg = api.jsonParser(msg);      // if can not parse msg, msg == false
        msgId = api.getMsgID(msg);      // if id not included, msgId == -1

        console.log("msg: " + msg);
        //if msg can not parse, return errorMsg(400 bad req)
        if(msg == false){
            api.errorSender(sock, "400", msgId);
        }else{
            result = api.methodExecuter(sock, msg, msgId);

            if(result != false){
                api.resultSender(sock, result, msgId);
            }

        }

    });

    sock.on("close", () => {
        console.log("============================");
        console.log("disconnected: " + sock.id);
    });
});

