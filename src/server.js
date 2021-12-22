/**
 * @file サーバ全体を制御するモジュール, クライアントからのメッセージによって各モジュールを呼び出す.
 */

const server = require('ws').Server;
const ws = new server({ port: 8889 });
const api = require('./api.js');
const db = require('./db.js');
let uuid4 = require('uuid4');

ws.on('connection', sock => {

    sock.id = uuid4();

    sock.on("message", msg => {
        console.log("=============================");
        console.log("msg from: " + sock.id);

        msg = api.jsonParser(msg);      // if can not parse msg, msg == false
        msgId = api.getMsgID(msg);      // if id not included, msgId == -1

        console.log("msg: " + JSON.stringify(msg));
        //if msg can not parse, return errorMsg(400 bad req)
        if (msg == false) {
            api.errorSender(sock, "400", msgId);
        } else {
            result = api.methodExecuter(sock, msg, msgId);
        }

    });

    sock.on("close", () => {
        console.log("============================");
        console.log("disconnected: " + sock.id);
    });
});

/**
 * 1秒ごとにトークンを監視し, 有効期限が切れたトークンを削除する.
 * @function
 */
let tokenManager = setInterval(async () => {
    mute();
    console.log("tokenManager");
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const query_deleteToken = `delete from auth_token where expiry < ${currentTime}`;
    let delInfo = await db.queryExecuter(query_deleteToken);
    let affectedRows = delInfo[0].affectedRows;
    unmute();
    if(affectedRows > 0){
        console.log("=================================");
        console.log("token deletions: " + affectedRows);
    }
}, 1000);


var ___log = console.log;
function mute() {
    console.log = function(){};
}
/**
 * Un-silences console.log
 */
function unmute() {
    console.log = ___log;
}