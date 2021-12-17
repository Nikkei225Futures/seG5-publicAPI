const server = require('ws').Server;
const ws = new server({port: 8889});
let uuid4 = require('uuid4');

ws.on('connection', sock => {

    sock.id = uuid4();

    sock.on("message", msg => {
        console.log("=============================");
        console.log("msg from: " + sock.id);

        msg = isValidJSON(msg);
        console.log("msg: " + msg);
        //if msg can not parse, return errorMsg(400 bad req)
        if(msg == false){
            errorSender(sock, "400");
        }else{
            result = methodExecuter(sock, msg);
            if(result != false){
                resultSender(sock, result);
            }
        }

    });

    sock.on("close", msg => {
        sock.send("byebye");
    });
});

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
function resultSender(sock, result){
    let msg = {
        "jsonrpc": "2.0",
        "result": result
    }

    sock.send(JSON.stringify(msg));
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
        console.log("invalid method");
        errorSender(sock, "404");
        return false;
    }else{
        console.log("methodName: " + methodName);
        let result = {
           "status": "success",
           "msg": "you specified valid method"
        }
        return result;
    }
}

/**
 * メソッドが存在するかどうかを返却する
 * @param {JSONObject} msg JSONデータ
 * @returns {boolean | string} 存在しない->false, 存在する->メソッド名を返却する
 */
function getMethodName(msg){
    console.log(msg);
    if(msg.hasOwnProperty("method") == false){
        return false;
    }

    let method = msg.method;
    
    let methodList = ["register/user", "register/restaurant", "register/admin", 
        "login", "logout",
        "getInfo/user/basic", "getInfo/user/reservations", "getInfo/user/evaluations", 
        "getInfo/restaurant/basic", "getInfo/restaurant/seats", "getInfo/restaurant/evaluations", "getInfo/restaurants", "getInfo/admin/basic", 
        "updateInfo/user/basic", "updateInfo/restaurant/basic", "updateInfo/restaurant/seat", "updateInfo/restaurant/seatAvailability", "updateInfo/restaurant/holidays", "updateInfo/admin/basic", 
        "updateInfo/reservation", "updateInfo/evaluation", "resign", "resign/forced"
    ];

    let isMethodFound = false;
    for(let i = 0; i < methodList.length; i++){
        console.log(method + "  :  " + methodList[i]);
        if(method == methodList[i]){
            console.log("valid method");
            return method;
        }
    }

    return false;
}