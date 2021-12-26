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
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const query_deleteToken = `delete from auth_token where expiry < ${currentTime}`;
    let delInfo = await db.queryExecuter(query_deleteToken);
    let affectedRows = delInfo[0].affectedRows;
    unmute();
    if(affectedRows > 0){
        console.log("================tokenManager=================");
        console.log("token deletions: " + affectedRows);
    }
}, 1000);

/**
 * 1秒ごとに予約情報を監視し, 予約終了時間が過ぎた予約情報のis_expiredをtrueにする.
 * @function
 */
let reservationManager = setInterval(async () => {
    mute();
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const query_expireReservation = `update reservation set is_expired=1 where time_end < ${currentTime} and is_expired=0`;
    let changeInfo = await db.queryExecuter(query_expireReservation);
    let affectedRows = changeInfo[0].affectedRows;
    unmute();
    if(affectedRows > 0){
        console.log("================reservationManager=================");
        console.log("reservation expires: " + affectedRows);
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