/**
 * @file 公開APIの各メソッド(呼び出し関数).
 *     メソッド内でエラーが発生した場合, 各メソッドはクライアントへエラーメッセージを送信する.
 *     その後, falseを返却する.
 */

exports.registerUser = registerUser;
exports.registerRestaurant = registerRestaurant;

const api = require("./api.js");
const db = require("./db.js");


/**
 * 利用者アカウント登録APIを実行する. パラメータ不足などのエラーがあればクライアントに
 * エラーメッセージを送信し, 関数はfalseを返却する. 
 * @param {JSONObject} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | JSONObject} 実行が成功 -> JSONObject, else -> false
 */
 async function registerUser(params, errSock, msgId){
    if(params.hasOwnProperty("user_name") == false){
        api.errorSender(errSock, "params.user_name is not included", msgId);
        return false;
    }
    if(params.hasOwnProperty("password") == false){
        api.errorSender(errSock, "params.password is not included", msgId);
        return false;
    }

    //get usernames from db;
    query_getUserNames = "select * from user;";
    console.log("getName qry: " + query_getUserNames);
    res = await db.queryExecuter(query_getUserNames);
    if(res == false){
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading user", msgId);
        return false;
    }else{
        res = res[0];
    }

    let userName = params.user_name;
    let password = params.password;
    let maxId = 0;
    //search name duplication
    for(let i = 0; i < res.length; i++){
        if(res[i].user_name == userName){
            console.log("username dupulicated: " + userName);
            api.errorSender(errSock, "user_name has already taken by other user", msgId);
            return false;
        }
        if(maxId < res[i].user_id){
            maxId = res[i].user_id;
        }
    }

    query_insertUser = `insert into user(user_id, user_name, birthday, gender, email_addr, address, password, num_vicious_cancels) values (${maxId+1}, '${userName}', '1900/01/01', 'no gender set', 'no email_addr set', 'no address set', '${password}', 0)`;
    console.log("insert qry: " + query_insertUser);
    res = await db.queryExecuter(query_insertUser);

    if(res == false){
        console.error("error while inserting data");
        api.errorSender(errSock, "error while inserting data", msgId);
        return false;
    }

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
async function registerRestaurant(params, errSock, msgId){
    if(params.hasOwnProperty("restaurant_name") == false){
        api.errorSender(errSock, "params.restaurant_name is not included", msgId);
        return false;
    }
    if(params.hasOwnProperty("password") == false){
        api.errorSender(errSock, "params.password is not included", msgId);
        return false;
    }

    //get restaurantNames from db;
    query_getRestaurantNames = "select * from restaurant;";
    console.log("getName qry: " + query_getRestaurantNames);
    res = await db.queryExecuter(query_getRestaurantNames);
    if(res == false){
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading restaurant", msgId);
        return false;
    }else{
        res = res[0];
    }

    let restaurantName = params.restaurant_name;
    let password = params.password;
    let maxId = 0;
    //search name duplication
    for(let i = 0; i < res.length; i++){
        if(res[i].restaurant_name == restaurantName){
            console.log("restaurant_name dupulicated: " + restaurantName);
            api.errorSender(errSock, "restaurant_name has already taken by other user", msgId);
            return false;
        }
        if(maxId < res[i].restaurant_id){
            maxId = res[i].restaurant_id;
        }
    }

    query_insertRestaurant = `insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_json, features) \
    values (${maxId+1}, '${restaurantName}', '${password}', 'no email_addr set', 'no address set', '00:00', '00:00', '{[]}', 'no features set')`;
    
    console.log("insert qry: " + query_insertRestaurant);
    res = await db.queryExecuter(query_insertRestaurant);

    if(res == false){
        console.error("error while inserting data");
        api.errorSender(errSock, "error while inserting data", msgId);
        return false;
    }

    let result = {
        "status": "success",
    }
    return result;
}