exports.isValidJSON = isValidJSON;
exports.errorSender = errorSender;
exports.resultSender = resultSender;
exports.getMethodName = getMethodName;
exports.methodExecuter = methodExecuter;
exports.getMsgID = getMsgID;

exports.registerUser;
exports.registerRestaurant;
exports.registerAdmin;

exports.login;
exports.logout;

exports.getInfoUserBasic;
exports.getInfoUserReservations;
exports.getInfoUserEvaluations;
exports.getInfoRestaurantBasic;
exports.getInfoRestaurantSeats;
exports.getInfoRestaurantEvaluations;
exports.getInfoRestaurants;
exports.getInfoAdminBasic;

exports.updateInfoUserBasic;
exports.updateInfoRestaurantBasic;
exports.updateInfoRestaurantSeat;
exports.updateInfoRestaurantSeatAvailability;
exports.updateInfoRestaurantHolidays;
exports.updateInfoAdminBasic;

exports.resign;
exports.resignForced;

exports.paramParser = paramParser;

function registerUser(params){

}

/**
 * パラメータが存在するかチェックし, 存在するならオブジェクトを返す
 * @param {JSONObject} msg JSON message
 * @param {ws.sock} errSock 
 * @returns {JSONObject | false} メッセージにパラメータが含まれていない->false, else -> パラメータのJSONデータ
 */
function paramParser(msg, errSock){
    if(msg.hasOwnProperty("params") == false){
        return false;
    }
    
    return msg.params;
}

/**
 * 受信したメッセージが正しくJSONに変換できるか
 * @param {string} msg 受信したメッセージ
 * @returns {false | JSONObject} JSONに変換できるならメッセージが, 変換できないならfalseが返却される
 */
 function isValidJSON(msg){
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
 * エラーが発生した場合にクライアントにエラー情報を返却
 * @param {ws.sock} sock socket
 * @param {string} reason エラーメッセージ
 */
function errorSender(sock, reason){
    let errMsg = {
        "jsonrpc": "2.0",
        "result": {
            "status": "error",
            "reason": reason
        }
    }
    sock.send(JSON.stringify(errMsg));
}

/**
 * クライアントに実行結果を返却する
 * @param {ws.sock} sock socket
 * @param {JSONObject} result 実行結果
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
 * メソッドが存在し, 実行が成功すれば結果を返却する. 実行に失敗した場合は
 * クライアントにエラー情報を返却し, 関数自体はfalseを返却する.
 * @param {ws.sock} sock socket
 * @param {JSONObject} msg JSONデータ 
 * @returns {JSONObject | false} メソッドが存在し, 実行が成功すれば結果を返却する, エラーの場合はfalse.
 */
 function methodExecuter(sock, msg){
    methodName = getMethodName(msg);
    if(methodName == false){
        console.log("404 - not found");
        errorSender(sock, "404");
        return false;
    }else{
        console.log("methodName: " + methodName);
        let sucResult = {
           "status": "success",
           "msg": "you specified valid method"
        }

        if(methodName == "register/user"){

        }else if(methodName == "register/admin"){

        }else if(methodName == "login"){

        }else if(methodName == "logout"){

        }else if(methodName == "getInfo/user/basic"){

        }else if(methodName == "getInfo/user/reservations"){

        }else if(methodName == "getInfo/user/evaluations"){

        }else if(methodName == "getInfo/restaurant/basic"){

        }else if(methodName == "getInfo/restaurant/seats"){

        }else if(methodName == "getInfo/restaurant/evaluations"){

        }else if(methodName == "getInfo/restaurants"){

        }else if(methodName == "getInfo/admin/basic"){

        }else if(methodName == "updateInfo/user/basic"){

        }else if(methodName == "updateInfo/restaurant/basic"){

        }else if(methodName == "updateInfo/restaurant/seat"){

        }else if(methodName == "updateInfo/restaurant/seatAvailability"){

        }else if(methodName == "updateInfo/restaurant/holidays"){

        }else if(methodName == "updateInfo/admin/basic"){

        }else if(methodName == "updateInfo/reservation"){

        }else if(methodName == "updateInfo/evaluation"){

        }else if(methodName == "resign"){

        }else if(methodName == "resign/forced"){

        }else{
            // no valid method found
            errorSender(sock, "404");
            return false;
        }

        return sucResult;
    }
}