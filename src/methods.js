/**
 * @file 公開APIの各メソッド(呼び出し関数).
 */

exports.registerUser = registerUser;
exports.registerRestaurant = registerRestaurant;

// if error exists, method has duty to send error message to clients.
// then return false;

/**
 * 利用者アカウント登録APIを実行する. パラメータ不足などのエラーがあればクライアントに
 * エラーメッセージを送信し, 関数はfalseを返却する. 
 * @param {JSONObject} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | JSONObject} 実行が成功 -> JSONObject, else -> false
 */
 function registerUser(params, errSock, msgId){
    if(params.hasOwnProperty("user_name") == false){
        errorSender(errSock, "params.user_name is not included", msgId);
        return false;
    }
    if(params.hasOwnProperty("password") == false){
        errorSender(errSock, "params.password is not included", msgId);
        return false;
    }

    let userName = params.user_name;
    let password = params.password;

    let result = {
        "status": "success",
    }

    return result;
}

/**
 * 店舗アカウント登録APIを実行する. パラメータ不足などのエラーがあればクライアントに
 * エラーメッセージを送信し, 関数はfalseを返却する.
 * @param {JSONObject} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | JSONObject} 実行が成功 -> JSONObject, else -> false
 */
function registerRestaurant(params, errSock, msgId){
    if(params.hasOwnProperty("restaurant_name") == false){
        errorSender(errSock, "params.restaurant_name is not included", msgId);
        return false;
    }
    if(params.hasOwnProperty("password") == false){
        errorSender(errSock, "params.password is not included", msgId);
        return false;
    }

    let restaurantName = params.restaurant_name;
    let password = params.password;

    let result = {
        "status": "success"
    }

    return result;
}