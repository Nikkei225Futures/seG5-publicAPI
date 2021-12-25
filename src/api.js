/**
 * @file APIで使用するモジュール, 関数実行モジュール, パラメータ抽出, 実行結果返却モジュール等が含まれる.
 */

exports.jsonParser = jsonParser;
exports.errorSender = errorSender;
exports.warnSender = warnSender;
exports.resultSender = resultSender;
exports.getMethodName = getMethodName;
exports.methodExecuter = methodExecuter;
exports.getMsgID = getMsgID;
exports.isNotSQLInjection = isNotSQLInjection;
exports.isObjectEmpty = isObjectEmpty;

const method = require("./methods.js");


/**
 * メソッドが存在し, 実行が成功すれば結果をクライアントに送信する. 
 * 実行に失敗した場合は各メソッド内でクライアントにエラーメッセージを送信する.
 * @param {ws.sock} sock socket
 * @param {JSONObject} msg JSONデータ 
 * @param {JSONObject} msgId メッセージのID 
 * @returns {false} エラーの場合のみ返却する.
 */
async function methodExecuter(sock, msg, msgId){
    //get msg.method, ignore method is valid or not here.
    methodName = getMethodName(msg);
    console.log("methodName: " + methodName);

    //get msg.params, if no params=>err
    params = paramParser(msg);
    if(params == false){
        errorSender(sock, "453", msgId);
        return false;
    }

    let result;

    if(methodName == "register/user"){
        result = await method.registerUser(params, sock, msgId);
        console.log("result-register/user");
        console.log(result);

    }else if(methodName == "register/restaurant"){
        result = await method.registerRestaurant(params, sock, msgId);
        console.log("result-register/restaurant");
        console.log(result);

    }else if(methodName == "register/admin"){
        result = await method.registerAdmin(params, sock, msgId);
        console.log("result-register/admin");
        console.log(result);

    }else if(methodName == "login"){
        result = await method.login(params, sock, msgId);
        console.log("result-login");
        console.log(result);

    }else if(methodName == "logout"){
        result = await method.logout(params, sock, msgId);
        console.log("result-logout");
        console.log(result);

    }else if(methodName == "getInfo/user/basic"){
        result = await method.getInfoUserBasic(params, sock, msgId);
        console.log("result-getInfo/user/basic");
        console.log(result);

    }else if(methodName == "getInfo/user/reservations"){
        result = await method.getInfoUserReservations(params, sock, msgId);
        console.log("result-getInfo/user/reservations");
        console.log(result);

    }else if(methodName == "getInfo/user/evaluations"){
        result = await method.getInfoUserEvaluations(params, sock, msgId);
        console.log("result-getInfo/user/evaluations");
        console.log(result);

    }else if(methodName == "getInfo/restaurant/basic"){
        result = await method.getInfoRestaurantBasic(params, sock, msgId);
        console.log("result-getInfo/restaurant/basic");
        console.log(result);

    }else if(methodName == "getInfo/restaurant/seats"){
        result = await method.getInfoRestaurantSeats(params, sock, msgId);
        console.log("result-getInfo/restaurant/seats");
        console.log(result);

    }else if(methodName == "getInfo/restaurant/evaluations"){
        result = await method.getInfoRestaurantEvaluations(params, sock, msgId);
        console.log("result-getInfo/restaurant/evaluations");
        console.log(result);

    }else if(methodName == "getInfo/restaurants"){
        result = await method.getInfoRestaurants(params, sock, msgId);
        console.log("result-getInfo/restaurants");
        console.log(result);

    }else if(methodName == "getInfo/admin/basic"){
        result = await method.getInfoAdminBasic(params, sock, msgId);
        console.log("result-getInfo/admin/basic");
        console.log(result);

    }else if(methodName == "updateInfo/user/basic"){
        result = await method.updateInfoUserBasic(params, sock, msgId);
        console.log("result-updateInfo/user/basic");
        console.log(result);

    }else if(methodName == "updateInfo/restaurant/basic"){
        result = await method.updateInfoRestaurantBasic(params, sock, msgId);
        console.log("result-updateInfo/restaurant/basic");
        console.log(result);

    }else if(methodName == "updateInfo/restaurant/seat"){
        result = await method.updateInfoRestaurantSeat(params, sock, msgId);
        console.log("result-updateInfo/restaurant/seat");
        console.log(result);

    }else if(methodName == "updateInfo/restaurant/seatsAvailability"){
        result = await method.updateInfoRestaurantSeatsAvailability(params, sock, msgId);
        console.log("result-updateInfo/restaurant/seatsAvailability");
        console.log(result);

    }else if(methodName == "updateInfo/restaurant/holidays"){
        result = await method.updateInfoRestaurantHOlidays(params, sock, msgId);
        console.log("result-updateInfo/restaurant/holidays");
        console.log(result);

    }else if(methodName == "updateInfo/admin/basic"){

    }else if(methodName == "updateInfo/reservation"){

    }else if(methodName == "updateInfo/evaluation"){

    }else if(methodName == "resign"){

    }else if(methodName == "resign/forced"){

    }else if(methodName == "ping"){
        result = await method.pong(params, sock, msgId);
        console.log("pong");
        console.log(result);

    }else{
        // no valid method found
        console.log("404 - not found");
        errorSender(sock, "404", msgId);
        return false;
    }

    if(result != false){
        resultSender(sock, result, msgId);
    }
}


/**
 * 受信したメッセージが正しくJSONに変換できるか
 * @param {string} msg 受信したメッセージ
 * @returns {false | JSONObject} JSONに変換できるならメッセージが, 変換できないならfalseが返却される
 */
 function jsonParser(msg){
    try{
        parsedMsg = JSON.parse(msg);
    }catch(error){
        if(error instanceof SyntaxError){
            console.log("400 - bad request");
            return false;
        }
        return false;
    }
    console.log("valid json");
    return parsedMsg;
}

/**
 * パラメータが存在するかチェックし, 存在するならオブジェクトを返す
 * @param {JSONObject} msg JSON message
 * @param {ws.sock} errSock 
 * @returns {JSONObject | false} メッセージにパラメータが含まれていない->false, else -> パラメータのJSONデータ
 */
 function paramParser(msg){
    if(msg.hasOwnProperty("params") == false){
        return false;
    }
    
    return msg.params;
}

/**
 * 呼び出し関数名を返却する.
 * @param {JSONObject} msg JSONデータ
 * @returns {boolean | string} 存在しない->false, 存在する->メソッド名を返却する
 */
 function getMethodName(msg){
    console.log(msg);
    if(msg.hasOwnProperty("method") == false){
        return false;
    }

    return msg.method;
}

/**
 * メッセージのIDを返却する.
 * @param {JSONObject} msg message 
 * @returns {int | string} メッセージのID, 無ければ-1が返却される
 */
function getMsgID(msg){
    if(msg.hasOwnProperty("id") == false){
        return -1;
    }

    return msg.id;
}


/**
 * エラーが発生した場合にクライアントにエラー情報を返却
 * @param {ws.sock} sock socket
 * @param {string} reason エラーメッセージ
 * @param {string | int} id メッセージのID
 */
 function errorSender(sock, reason, id){
    let errMsg = {
        "jsonrpc": "2.0",
        "id": id,
        "result": {
            "status": "error",
            "reason": reason
        }
    }
    sock.send(JSON.stringify(errMsg));
}

/**
 * クライアントに警告を送信する.
 * @param {ws.sock} sock socket
 * @param {string} reason エラーメッセージ
 * @param {string | int} id メッセージのID
 */
function warnSender(sock, reason, id){
    let warnMsg = {
        "jsonrpc": "2.0",
        "id": id,
        "result": {
            "status": "warn",
            "reason": reason
        }
    }

    sock.send(JSON.stringify(warnMsg));
}

/**
 * クライアントに実行結果を返却する
 * @param {ws.sock} sock socket
 * @param {JSONObject} result 実行結果
 * @param {string | int} msgId メッセージのID
 */
function resultSender(sock, result, msgId){
    let msg = {
        "jsonrpc": "2.0",
        "id": msgId,
        "result": result
    }

    sock.send(JSON.stringify(msg));
}

/**
 * SQLインジェクションの可能性のある文字列を検出する.
 * @param {string} param SQL文を組み立てる際に使用する各パラメータ
 * @returns {boolean} false->SQLインジェクションの可能性がある, true->正当な文字列
 */
function isNotSQLInjection(param){
    let checkStrs = ["=", "<", ">", ";", "'", "*", "?", "|"];

    //if input = false = number, return true;
    if(isNaN(param) == false){
        return true;
    }
    
    for(let i = 0; i < checkStrs.length; i++){
        if(param.indexOf(checkStrs[i]) != -1){
            return false;
        }
    }
    console.log("param has no problem");
    return true;
}

/**
 * オブジェクトが空かどうか判定する
 * @param {Object} obj 判定したいオブジェクト
 * @returns {boolean} true->空, false->空でない
 */
function isObjectEmpty(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}