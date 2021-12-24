/**
 * @file 公開APIの各メソッド(呼び出し関数).
 *     メソッド内でエラーが発生した場合, 各メソッドはクライアントへエラーメッセージを送信する.
 *     その後, falseを返却する.
 */

exports.registerUser = registerUser;
exports.registerRestaurant = registerRestaurant;
exports.registerAdmin = registerAdmin;
exports.login = login;
exports.logout = logout;
exports.getInfoUserBasic = getInfoUserBasic;
exports.getInfoUserReservations = getInfoUserReservations;
exports.getInfoUserEvaluations = getInfoUserEvaluations;
exports.getInfoRestaurantBasic = getInfoRestaurantBasic;
exports.getInfoRestaurantSeats = getInfoRestaurantSeats;

exports.pong = pong;

const api = require("./api.js");
const db = require("./db.js");
const sha256 = require("crypto-js/sha256");
const uuid4 = require('uuid4');

/**
 * 利用者アカウント登録APIを実行する. パラメータ不足などのエラーがあればクライアントに
 * エラーメッセージを送信し, 関数はfalseを返却する. 
 * @param {JSONObject} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | JSONObject} 実行が成功 -> JSONObject, else -> false
 */
async function registerUser(params, errSock, msgId) {
    let requiredParams = ["user_name", "password"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (api.isNotSQLInjection(params.user_name) == false) {
        api.errorSender(errSock, "params.user_name contains suspicious character, you can not register such name", msgId);
        return false;
    }


    //get usernames from db;
    let query_getUserNames = "select * from user;";
    console.log("getName qry: " + query_getUserNames);
    let res = await db.queryExecuter(query_getUserNames);
    if (res == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading user", msgId);
        return false;
    } else {
        res = res[0];
    }

    let userName = params.user_name;
    let password = sha256(params.password);
    console.log("password: " + password);
    let maxId = 0;
    //search name duplication
    for (let i = 0; i < res.length; i++) {
        if (res[i].user_name == userName) {
            console.log("username dupulicated: " + userName);
            api.errorSender(errSock, "user_name has already taken by other user", msgId);
            return false;
        }
        if (maxId < res[i].user_id) {
            maxId = res[i].user_id;
        }
    }

    query_insertUser = `insert into user(user_id, user_name, birthday, gender, email_addr, address, password, num_vicious_cancels) values (${maxId + 1}, '${userName}', '1900/01/01', 'no gender set', 'no email_addr set', 'no address set', '${password}', 0)`;
    console.log("insert qry: " + query_insertUser);
    res = await db.queryExecuter(query_insertUser);

    if (res == false) {
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
async function registerRestaurant(params, errSock, msgId) {
    let requiredParams = ["restaurant_name", "password"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (api.isNotSQLInjection(params.restaurant_name) == false) {
        api.errorSender(errSock, "params.restaurant_name contains suspicious character, you can not register such name", msgId);
        return false;
    }

    //get restaurantNames from db;
    let query_getRestaurantNames = "select * from restaurant;";
    console.log("getName qry: " + query_getRestaurantNames);
    res = await db.queryExecuter(query_getRestaurantNames);
    if (res == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading restaurant", msgId);
        return false;
    } else {
        res = res[0];
    }

    let restaurantName = params.restaurant_name;
    let password = sha256(params.password);
    let maxId = 0;
    //search name duplication
    for (let i = 0; i < res.length; i++) {
        if (res[i].restaurant_name == restaurantName) {
            console.log("restaurant_name dupulicated: " + restaurantName);
            api.errorSender(errSock, "restaurant_name has already taken by other user", msgId);
            return false;
        }
        if (maxId < res[i].restaurant_id) {
            maxId = res[i].restaurant_id;
        }
    }

    let query_insertRestaurant = `insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_json, features) \
    values (${maxId + 1}, '${restaurantName}', '${password}', 'no email_addr set', 'no address set', '00:00', '00:00', '{[]}', 'no features set')`;

    console.log("insert qry: " + query_insertRestaurant);
    res = await db.queryExecuter(query_insertRestaurant);

    if (res == false) {
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
 * 管理者アカウント登録APIを実行する. パラメータ不足などのエラーがあればクライアントに
 * エラーメッセージを送信し, 関数はfalseを返却する.
 * @param {JSONObject} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | JSONObject} 実行が成功 -> JSONObject, else -> false
 */
async function registerAdmin(params, errSock, msgId) {
    let requiredParams = ["admin_name", "password", "admin_password"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (sha256(params.admin_password) != "b397288f3f5368c343157d541f4d1f096fcbc4c7a3152f1092bb34b36f631461") {
        api.errorSender(errSock, "You don't have permission to create admin account. admin_password is wrong.", msgId);
        return false;
    }

    if (api.isNotSQLInjection(params.admin_name) == false) {
        api.errorSender(errSock, "params.admin_name contains suspicious character, you can not register such name", msgId);
        return false;
    }

    //get admin names from db;
    let query_getAdminNames = "select * from administrator;";
    console.log("getName qry: " + query_getAdminNames);
    let res = await db.queryExecuter(query_getAdminNames);
    if (res == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading admin", msgId);
        return false;
    } else {
        res = res[0];
    }

    let adminName = params.admin_name;
    let password = sha256(params.password);
    let maxId = 0;

    //search name duplication
    for (let i = 0; i < res.length; i++) {
        if (res[i].admin_name == adminName) {
            console.log("admin_name dupulicated: " + adminName);
            api.errorSender(errSock, "admin_name has already taken by other user", msgId);
            return false;
        }
        if (maxId < res[i].admin_id) {
            maxId = res[i].admin_id;
        }
    }

    let query_insertAdmin = `insert into administrator(admin_id, admin_name, birthday, password, gender, address, email_addr) \
    values ('${maxId + 1}', '${adminName}', '1900/01/01', '${password}', 'no gender set', 'no address set', 'no email_addr set')`;

    console.log("insert qry: " + query_insertAdmin);
    res = await db.queryExecuter(query_insertAdmin);

    if (res == false) {
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
 * ログインAPI
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {Object | false} 実行に失敗した場合はfalseを返却する. 成功した場合はObjectを返却する.
 */
async function login(params, errSock, msgId) {
    let requiredParams = ["user_name", "password", "role"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    //check sql injection
    if (api.isNotSQLInjection(params.user_name) == false) {
        api.errorSender(errSock, "params.user_name contains suspicious character, you can not specify such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.role) == false) {
        api.errorSender(errSock, "params.user_name contains suspicious character, you can not specify such role", msgId);
        return false;
    }

    //get user info from db;
    let tableName = 0;
    if (params.role == "user") {
        tableName = "user";
    } else if (params.role == "restaurant") {
        tableName = "restaurant";
    } else if (params.role == "admin") {
        tableName = "administrator";
    } else {
        api.errorSender(errSock, "invalid parameter(params.role at login request)", msgId);
        return false;
    }

    // get user information from user table;
    let query_getUserInfo = `select * from ${tableName} where ${params.role}_name = '${params.user_name}';`;
    let userInfo = await db.queryExecuter(query_getUserInfo);
    if (userInfo == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading table", msgId);
        return false;
    } else {
        userInfo = userInfo[0][0];
        if (api.isObjectEmpty(userInfo)) {
            api.errorSender(errSock, "no such user exists", msgId);
            return false;
        }
    }

    //verify password
    if (sha256(params.password) != userInfo.password) {
        console.log("DB: " + userInfo.password);
        console.log("pm: " + sha256(params.password));
        api.errorSender(errSock, "wrong password", msgId);
        return false;
    }

    // determine id;
    let issuer_id = "no id";
    if (params.role == "user") {
        issuer_id = userInfo.user_id;
    } else if (params.role == "restaurant") {
        issuer_id = userInfo.restaurant_id;
    } else if (params.role == "admin") {
        issuer_id = userInfo.admin_id;
    }

    if (issuer_id == "no id") {
        api.errorSender(errSock, "systen could not get user id", msgId);
        return false;
    }

    let token = uuid4();
    const DAYSEC = 86400;
    let expriry = Math.round((new Date()).getTime() / 1000) + DAYSEC;

    let query_addToken = `insert into auth_token(token_id, token_issuer_id, token_permission, expiry) \
    values ('${token}', ${issuer_id}, '${params.role}', ${expriry});`;
    console.log("query: " + query_addToken);
    let addTokenResult = await db.queryExecuter(query_addToken);
    if (addTokenResult == false) {
        api.errorSender(errSock, "error while inserting token", msgId);
        return false;
    }

    let result = {
        "status": "success",
        "token": token,
        "issuer_role": params.role,
        "expire": expriry
    }

    return result;
}

/**
 * ログアウトAPI
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {Object | false} 実行失敗時にfalseを返却する.
 */
async function logout(params, errSock, msgId) {
    let requiredParams = ["token"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let query_deleteToken = `delete from auth_token where token_id = '${params.token}';`;
    let deleteResult = await db.queryExecuter(query_deleteToken);
    deleteResult = deleteResult[0];

    if (deleteResult.affectedRows == 0) {
        api.errorSender(errSock, "invalid token", msgId);
        return false;
    }

    let result = {
        "status": "success"
    }

    return result;

}

/**
 * 利用者アカウント基本情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->error, Object->success
 */
async function getInfoUserBasic(params, errSock, msgId) {
    //check params
    if (params.hasOwnProperty("searchBy") == false) {
        api.errorSender(errSock, "params.searchBy is not included", msgId);
        return false;
    }
    if (params.searchBy == "user_id") {
        if (params.hasOwnProperty("user_id") == false) {
            api.errorSender(errSock, "params.user_id is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.user_id) == false) {
            api.errorSender(errSock, "params.user_id contains suspicious character, you can not register such name", msgId);
            return false;
        }
    } else if (params.searchBy == "user_name") {
        if (params.hasOwnProperty("user_name") == false) {
            api.errorSender(errSock, "params.user_name is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.user_name) == false) {
            api.errorSender(errSock, "params.user_name contains suspicious character, you can not register such name", msgId);
            return false;
        }
    } else {
        api.errorSender(errSock, "params.searchBy is invalid.", msgId);
    }

    if (params.hasOwnProperty("token") == false) {
        api.errorSender(errSock, "params.token is not included", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }

    let userInfo = -1;
    let query_getUser;
    if (params.searchBy == "user_id") {
        query_getUser = `select * from user where user_id = ${params.user_id};`;
    } else if (params.searchBy == "user_name") {
        query_getUser = `select * from user where user_name = '${params.user_name}';`;
    }

    userInfo = await db.queryExecuter(query_getUser);
    if (userInfo == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading table", msgId);
        return false;
    } else {
        userInfo = userInfo[0][0];
        if (api.isObjectEmpty(userInfo)) {
            api.errorSender(errSock, "no such user exists", msgId);
            return false;
        }
    }

    let query_getTokenInfo = `select * from auth_token where token_id = '${params.token}'`;
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let result = {
        "status": "success",
        "user_id": userInfo.user_id,
        "user_name": userInfo.user_name,
        "birthday": userInfo.birthday,
        "gender": userInfo.gender,
        "email_addr": userInfo.email_addr,
        "address": userInfo.address,
        "num_vicious_cancels": userInfo.num_vicious_cancels
    };

    if (tokenInfo.token_permission == "user") {
        if (tokenInfo.token_issuer_id != userInfo.user_id) {
            console.log("token: " + tokenInfo.token_issuer_id);
            console.log("userr: " + userInfo.user_id);
            api.errorSender(errSock, "you don't have permission to see the user information", msgId);
            return false;
        }
    } else if (tokenInfo.token_permission == "restaurant") {
        delete result.email_addr;
        delete result.address;
    }

    return result;
}

/**
 * 利用者予約情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoUserReservations(params, errSock, msgId) {
    let requiredParams = ["user_id", "token"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (api.isNotSQLInjection(params.user_id) == false) {
        api.errorSender(errSock, "params.user_id contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    //get user reservations(only active)
    let query_getUserReservation = `select * from reservation where user_id = ${params.user_id} and is_expired = 0`;
    let userReservations = await db.queryExecuter(query_getUserReservation);
    userReservations = userReservations[0];

    //translate tinyint -> boolean
    for(let i = 0; i < userReservations.length; i++){
        if(userReservations[i].is_expired == 0){
            userReservations[i].is_expired = false;
        }else{
            userReservations[i].is_expired = true;
        }
    }

    console.log("userReservations");
    console.log(userReservations);

    //check token
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    //if request if not from themselves and request from user
    if(tokenInfo.token_permission == "user" && params.user_id != tokenInfo.token_issuer_id){
        api.errorSender(errSock, "you don't have permission to see the user information", msgId);
        return false;
    }else if(tokenInfo.token_permission == "restaurant"){
        api.errorSender(errSock, "you don't have permission to see the user information", msgId);
        return false;
    }

    let result = {
        "status": "success",
        "reservations": userReservations
    }

    return result;
}

/**
 * 利用者食べログ情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoUserEvaluations(params, errSock, msgId) {
    let requiredParams = ["user_id", "token"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.user_id) == false) {
        api.errorSender(errSock, "params.user_id contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }

    //get user evaluations
    let query_getUserEvaluations = `select * from restaurant_evaluation where user_id = ${params.user_id};`;
    let userEvaluations = await db.queryExecuter(query_getUserEvaluations);
    userEvaluations = userEvaluations[0];

    //check token
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if (tokenInfo == false) {
        return false;
    }

    //if request if not from themselves and request from user
    if (tokenInfo.token_permission == "user" && params.user_id != tokenInfo.token_issuer_id) {
        api.errorSender(errSock, "you don't have permission to see the user information", msgId);
        return false;
    } else if (tokenInfo.token_permission == "restaurant") {
        api.errorSender(errSock, "you don't have permission to see the user information", msgId);
        return false;
    }

    let result = {
        "status": "success",
        "evaluations": userEvaluations
    }

    return result;

}

/**
 * 店舗基本情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoRestaurantBasic(params, errSock, msgId) {
    //check params
    if (params.hasOwnProperty("searchBy") == false) {
        api.errorSender(errSock, "params.searchBy is not included", msgId);
        return false;
    }
    if (params.searchBy == "restaurant_id") {
        if (params.hasOwnProperty("restaurant_id") == false) {
            api.errorSender(errSock, "params.restaurant_id is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.restaurant_id) == false) {
            api.errorSender(errSock, "params.restaurant_id contains suspicious character, you can not register such name", msgId);
            return false;
        }
    } else if (params.searchBy == "restaurant_name") {
        if (params.hasOwnProperty("restaurant_name") == false) {
            api.errorSender(errSock, "params.restaurant_name is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.restaurant_name) == false) {
            api.errorSender(errSock, "params.restaurant_name contains suspicious character, you can not register such name", msgId);
            return false;
        }
    } else {
        api.errorSender(errSock, "params.searchBy is invalid.", msgId);
    }

    if (params.hasOwnProperty("token") == false) {
        api.errorSender(errSock, "params.token is not included", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let query_getRestaurant;
    if (params.searchBy == "restaurant_id") {
        query_getRestaurant = `select * from restaurant where restaurant_id = ${params.restaurant_id};`;
    } else if (params.searchBy == "restaurant_name") {
        query_getRestaurant = `select * from user where restaurant_name = '${params.restaurant_name}';`;
    }

    let restaurantInfo = -1;
    restaurantInfo = await db.queryExecuter(query_getRestaurant);
    if (restaurantInfo == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading table", msgId);
        return false;
    } else {
        restaurantInfo = restaurantInfo[0][0];
        if (api.isObjectEmpty(restaurantInfo)) {
            api.errorSender(errSock, "no such restaurant exists", msgId);
            return false;
        }
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    console.log("holidays");
    console.log(JSON.parse(restaurantInfo.holidays_array));
    

    let result = {
        "jsonrpc": "2.0",
        "id": msgId,
        "result": {
           "status": "success",
           "restaurant_id": restaurantInfo.restaurant_id,
           "restaurant_name": restaurantInfo.restaurant_name,
           "email_addr": restaurantInfo.email_addr,
           "address": restaurantInfo.address,
           "time_open": restaurantInfo.time_open,
           "time_close": restaurantInfo.time_close,
           "features": restaurantInfo.features,
           "holidays": JSON.parse(restaurantInfo.holidays_array)
        }
     }

    return result;
}


/**
 * 店舗座席情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoRestaurantSeats(params, errSock, msgId){
    let requiredParams = ["restaurant_id", "token"];
    if(checkParamsAreEnough(params,requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.restaurant_id) == false) {
        api.errorSender(errSock, "params.restaurant_id contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }    
    
    //check token
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let query_getRestaurantSeats = `select * from seat where restaurant_id = ${params.restaurant_id}`;
    let seats = await db.queryExecuter(query_getRestaurantSeats);
    seats = seats[0];

    // get reservation data
    let seatReservations = [];
    let reservationInfo = [];
    for(let i = 0; i < seats.length; i++){
        query_getSeatReservation = `select * from reservation where seat_id = ${seats[i].seat_id} and is_expired = 0`;
        reservationInfo[i] = await db.queryExecuter(query_getSeatReservation);
        seatReservations.push(reservationInfo[i][0]);
    }

    //see each seat info
    for(let i = 0; i < seats.length; i++){   
        //cast tinyint -> boolean
        if(seats[i].is_filled == 0){
            seats[i].is_filled = false;
        }else{
            seats[i].is_filled = true;
        }
        seats[i].staying_times_array = JSON.parse(seats[i].staying_times_array);

        seats[i].reservations = [];
        console.log("seat_id: " + seats[i].seat_id);

        for(let j = 0; j < seatReservations.length; j++){
            let reservationData = seatReservations[j];

            if(reservationData.length > 0){
                if(seats[i].seat_id == reservationData[0].seat_id){
                    for(let k = 0; k < reservationData.length; k++){
                        seats[i].reservations.push(reservationData[k]);
                    }
                }
            }

        }
    }

    result = {
        "status": "success",
        "seats": seats
    }

    return result;

}





/**
 * pingに対してメッセージを返却するAPI
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {Object} 常にObjectが返却される.
 */
async function pong(params, errSock, msgId){
    return result = {
        "status": "success",
        "pong": "pong"
    }
}


/**
 * パラメータが十分かチェックする
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {string[]} checkParamNames チェックするパラメータの配列
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {boolean} true->パラメータが全て含まれている. false->パラメータが足りない
 */
function checkParamsAreEnough(params, checkParamNames, errSock, msgId){
    let numErr = 0;
    for(let i = 0; i < checkParamNames.length; i++){
        if(params.hasOwnProperty(checkParamNames[i]) == false){
            api.errorSender(errSock, `params.${checkParamNames[i]} is not included`, msgId);
            numErr++;
        }
    }
    
    if(numErr != 0){
        return false;
    }
    return true;
}



/**
 * トークン情報をチェックする.
 * @param {string} token トークンの文字列(UUID)
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, object->成功
 */
async function checkToken(token, errSock, msgId){
    let query_getTokenInfo = `select * from auth_token where token_id = '${token}'`;
    let tokenInfo = await db.queryExecuter(query_getTokenInfo);
    tokenInfo = tokenInfo[0][0];
    if(api.isObjectEmpty(tokenInfo)){
        api.errorSender(errSock, "401", msgId);
        return false;
    }
    console.log(tokenInfo);
    return tokenInfo;
}