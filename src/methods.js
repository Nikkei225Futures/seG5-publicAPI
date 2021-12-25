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
exports.getInfoRestaurantEvaluations = getInfoRestaurantEvaluations;
exports.getInfoRestaurants = getInfoRestaurants;
exports.getInfoAdminBasic = getInfoAdminBasic;
exports.updateInfoUserBasic = updateInfoUserBasic;
exports.updateInfoRestaurantBasic = updateInfoRestaurantBasic;
exports.updateInfoRestaurantSeat = updateInfoRestaurantSeat;
exports.updateInfoRestaurantSeatsAvailability = updateInfoRestaurantSeatsAvailability;

exports.pong = pong;

const api = require("./api.js");
const db = require("./db.js");
const sha256 = require("crypto-js/sha256");
const uuid4 = require('uuid4');
const { setServers } = require("dns");

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

    let query_insertRestaurant = `insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_array, features) \
    values (${maxId + 1}, '${restaurantName}', '${password}', 'no email_addr set', 'no address set', '00:00', '00:00', '[]', 'no features set')`;

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
        query_getRestaurant = `select * from restaurant where restaurant_name = '${params.restaurant_name}';`;
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
 * 店舗食べログ情報取得API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoRestaurantEvaluations(params, errSock, msgId){
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

    let query_getRestaurantEvaluations = `select * from restaurant_evaluation where restaurant_id = ${params.restaurant_id};`;
    let evaluations = await db.queryExecuter(query_getRestaurantEvaluations);
    evaluations = evaluations[0];
    
    let result = {
        "status": "success",
        "evaluations": evaluations
    }

    return result;
}

/**
 * 店舗情報検索API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function getInfoRestaurants(params, errSock, msgId){
    let requiredParams = ["keyword", "token"];
    if(checkParamsAreEnough(params,requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.keyword) == false) {
        api.errorSender(errSock, "params.restaurant_id contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let query_getRestaurants = `select * from restaurant where features like '%${params.keyword}%';`;
    let restaurants = await db.queryExecuter(query_getRestaurants);
    restaurants = restaurants[0];
    if(restaurants.length == 0){
        api.errorSender(errSock, "no restaurant matched", msgId);
        return false;
    }

    for(let i = 0; i < restaurants.length; i++){
        restaurants[i].holidays_array = JSON.parse(restaurants[i].holidays_array);
    }

    let result = {
        "status": "success",
        "restaurants": restaurants
    }

    return result;
}

/**
 * 管理者アカウント基本情報取得APIAPI
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function getInfoAdminBasic(params, errSock, msgId) {
    //check params
    if (params.hasOwnProperty("searchBy") == false) {
        api.errorSender(errSock, "params.searchBy is not included", msgId);
        return false;
    }
    if (params.searchBy == "admin_id") {
        if (params.hasOwnProperty("admin_id") == false) {
            api.errorSender(errSock, "params.admin_id is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.admin_id) == false) {
            api.errorSender(errSock, "params.admin_id contains suspicious character, you can not register such name", msgId);
            return false;
        }
    } else if (params.searchBy == "admin_name") {
        if (params.hasOwnProperty("admin_name") == false) {
            api.errorSender(errSock, "params.admin_name is not included", msgId);
            return false;
        }
        if (api.isNotSQLInjection(params.admin_name) == false) {
            api.errorSender(errSock, "params.admin_name contains suspicious character, you can not register such name", msgId);
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

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let query_getAdmin;
    if (params.searchBy == "admin_id") {
        query_getAdmin = `select * from administrator where admin_id = ${params.admin_id};`;
    } else if (params.searchBy == "admin_name") {
        query_getAdmin = `select * from administrator where admin_name = '${params.admin_name}';`;
    }

    let adminInfo = false;
    adminInfo = await db.queryExecuter(query_getAdmin);
    if (adminInfo == false) {
        console.error("error on query executer");
        api.errorSender(errSock, "error while reading table", msgId);
        return false;
    } else {
        adminInfo = adminInfo[0][0];
        if (api.isObjectEmpty(adminInfo)) {
            api.errorSender(errSock, "no admin matched", msgId);
            return false;
        }
    }    

    if(tokenInfo.token_permission != "admin"){
        api.errorSender(errSock, "you don't have permission to see the admin information", msgId);
        return false;
    }

    if(tokenInfo.token_issuer_id != adminInfo.admin_id){
        api.errorSender(errSock, "you don't have permission to see the admin information", msgId);
        return false;
    }

    let result = {
        "jsonrpc": "2.0",
        "id": msgId,
        "result": {
           "status": "success",      
           "admin_id": adminInfo.admin_id,
           "admin_name": adminInfo.admin_name,
           "birthday": adminInfo.birthday,
           "gender": adminInfo.gender,
           "email_addr": adminInfo.email_addr,
           "address": adminInfo.adress
        }
    }

    console.log("adminInfo");
    console.log(result);

    return result;
}


/**
 * 利用者アカウント基本情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function updateInfoUserBasic(params, errSock, msgId){
    let requiredParams = ["token", "user_name", "birthday", "gender", "email_addr", "address"];
    if(checkParamsAreEnough(params,requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.user_name) == false) {
        api.errorSender(errSock, "params.user_name contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.birthday) == false) {
        api.errorSender(errSock, "params.birthday contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.gender) == false) {
        api.errorSender(errSock, "params.gender contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.email_addr) == false) {
        api.errorSender(errSock, "params.email_addr contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.address) == false) {
        api.errorSender(errSock, "params.address contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    if(checkBirthdaySyntax(params.birthday, errSock, msgId) == false){
        return false;
    }
    
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "user"){
        api.errorSender(errSock, "you are not user", msgId);
        return false;
    }

    let query_updateUserInfo = `update user set \
    user_name='${params.user_name}', birthday='${params.birthday}', gender='${params.gender}', email_addr='${params.email_addr}', address='${params.address}'\
    where user_id = ${tokenInfo.token_issuer_id};`

    let insertRes = await db.queryExecuter(query_updateUserInfo);
    console.log(insertRes);
    
    let result = {
        "status": "success",
    }

    return result;
}

/**
 * 店舗アカウント基本情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function updateInfoRestaurantBasic(params, errSock, msgId){
    let requiredParams = ["token", "restaurant_name", "email_addr", "address", "time_open", "time_close", "features"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.restaurant_name) == false) {
        api.errorSender(errSock, "params.restaurant_name contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.email_addr) == false) {
        api.errorSender(errSock, "params.email_addr contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.address) == false) {
        api.errorSender(errSock, "params.address contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.time_open) == false) {
        api.errorSender(errSock, "params.time_open contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.time_close) == false) {
        api.errorSender(errSock, "params.time_close contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.features) == false) {
        api.errorSender(errSock, "params.features contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    if(checkTimeSyntax(params.time_open, errSock, msgId) == false){
        return false;
    }
    if(checkTimeSyntax(params.time_close, errSock, msgId) == false){
        return false;
    }
    
    
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "restaurant"){
        api.errorSender(errSock, "you are not restaurant", msgId);
        return false;
    }

    let query_updateRestaurantInfo = `update restaurant set \
    restaurant_name='${params.restaurant_name}', email_addr='${params.email_addr}', address='${params.address}', time_open='${params.time_open}', time_close='${params.time_close}', features = '${params.features}'\
    where restaurant_id = ${tokenInfo.token_issuer_id};`

    let insertRes = await db.queryExecuter(query_updateRestaurantInfo);
    console.log(insertRes);
    
    let result = {
        "status": "success",
    }

    return result;
}

/**
 * 店舗座席情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function updateInfoRestaurantSeat(params, errSock, msgId){
    let requiredParams = ["token", "type"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let result;
    if(params.type == "new"){
        result = await createSeatInfo(params, errSock, msgId);
    }else if(params.type == "change"){
        result = await updateSeatInfo(params, errSock, msgId);
    }else if(params.type == "delete"){
        result = await deleteSeatInfo(params, errSock, msgId);
    }else {
        api.errorSender(errSock, "params.type is invalid", msgId);
        return false
    }

    return result;
}

/**
 * 店舗座席情報更新API-new
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function createSeatInfo(params, errSock, msgId){
    if(checkParamsAreEnough(params, ["seatInfo"], errSock, msgId) == false){
        return false;
    }

    let seatInfo = params.seatInfo;
    let requiredParams = ["seat_name", "capacity", "feature"];
    if(checkParamsAreEnough(seatInfo, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.seat_name) == false) {
        api.errorSender(errSock, "params.seatInfo.seat_name contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.capacity) == false) {
        api.errorSender(errSock, "params.seatInfo.capacity contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.feature) == false) {
        api.errorSender(errSock, "params.seatInfo.feature contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    // if capacity is string
    if(isNaN(params.seatInfo.capacity)){
        api.errorSender(errSock, "params.seatInfo.capacity should be int", msgId);
        return false;
    }

    let query_getSeatInfo = "select * from seat";
    let wholeSeatInfo = await db.queryExecuter(query_getSeatInfo);
    wholeSeatInfo = wholeSeatInfo[0];
    let maxId = 0;
    for(let i = 0; i < wholeSeatInfo.length; i++){
        if(maxId < wholeSeatInfo[i].seat_id){
            maxId = wholeSeatInfo[i].seat_id;
        }
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "restaurant"){
        api.errorSender(errSock, "you are not restaurant", msgId);
        return false;
    }

    let query_insertSeatInfo = `insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_array, avg_stay_time, feature)\
    values (${maxId+1}, '${params.seatInfo.seat_name}', ${tokenInfo.token_issuer_id}, ${params.seatInfo.capacity}, 0, 0, '[]', '00:00:00', '${params.seatInfo.feature}')`;

    let insertRes = await db.queryExecuter(query_insertSeatInfo);
    console.log(insertRes[0]);

    let result = {
        "status": "success",
        "seat_id": maxId+1
    }
    return result;
}

/**
 * 店舗座席情報更新API-change
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function updateSeatInfo(params, errSock, msgId){
    if(checkParamsAreEnough(params, ["seatInfo"], errSock, msgId) == false){
        return false;
    }

    let seatInfo = params.seatInfo;
    let requiredParams = ["seat_id", "seat_name", "capacity", "feature"];
    if(checkParamsAreEnough(seatInfo, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.seat_id) == false) {
        api.errorSender(errSock, "params.seatInfo.seat_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.seat_name) == false) {
        api.errorSender(errSock, "params.seatInfo.seat_name contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.capacity) == false) {
        api.errorSender(errSock, "params.seatInfo.capacity contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.seatInfo.feature) == false) {
        api.errorSender(errSock, "params.seatInfo.feature contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    // if capacity is string
    if(isNaN(params.seatInfo.capacity)){
        api.errorSender(errSock, "params.seatInfo.capacity should be int", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "restaurant"){
        api.errorSender(errSock, "you are not restaurant", msgId);
        return false;
    }

    let query_getSeatInfo = `select * from seat where seat_id = ${params.seatInfo.seat_id}`;
    let registeredSeatInfo = await db.queryExecuter(query_getSeatInfo);
    console.log(registeredSeatInfo[0]);
    if(registeredSeatInfo[0].length == 0){
        api.errorSender(errSock, "the seat you want to change is not exist", msgId);
        return false;
    }

    registeredSeatInfo = registeredSeatInfo[0][0];

    if(registeredSeatInfo.restaurant_id != tokenInfo.token_issuer_id){
        api.errorSender(errSock, "the seat you want to change is not yours", msgId);
        return false;
    }

    let query_updateSeatInfo = `update seat set\
    seat_name = '${params.seatInfo.seat_name}', capacity = '${params.seatInfo.capacity}', feature = '${params.seatInfo.feature}'\
    where seat_id = ${params.seatInfo.seat_id};`;

    let updateRes = await db.queryExecuter(query_updateSeatInfo);

    let result = {
        "status": "success",
        "seat_id": params.seatInfo.seat_id
    }
    return result;
}

/**
 * 店舗座席情報更新API-delete
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
 async function deleteSeatInfo(params, errSock, msgId){
    let requiredParams = ["seat_id"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.seat_id) == false) {
        api.errorSender(errSock, "params.seat_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "restaurant"){
        api.errorSender(errSock, "you are not restaurant", msgId);
        return false;
    }

    let query_getSeatInfo = `select * from seat where seat_id = ${params.seat_id}`;
    let registeredSeatInfo = await db.queryExecuter(query_getSeatInfo);
    if(registeredSeatInfo[0].length == 0){
        api.errorSender(errSock, "the seat you want to delete is not exist", msgId);
        return false;
    }

    registeredSeatInfo = registeredSeatInfo[0][0];

    if(registeredSeatInfo.restaurant_id != tokenInfo.token_issuer_id){
        api.errorSender(errSock, "the seat you want to delete is not yours", msgId);
        return false;
    }

    let query_updateSeatInfo = `delete from seat where seat_id = ${params.seat_id}`;

    let updateRes = await db.queryExecuter(query_updateSeatInfo);

    let result = {
        "status": "success"
    }
    return result;
}

/**
 * 店舗座席利用状況更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function updateInfoRestaurantSeatsAvailability(params, errSock, msgId){
    let requiredParams = ["token", "seats"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "restaurant"){
        api.errorSender(errSock, "you are not restaurant", msgId);
        return false;
    }

    let query_getCurrentSeat = `select * from seat where restaurant_id = ${tokenInfo.token_issuer_id}`;
    let currentSeats = await db.queryExecuter(query_getCurrentSeat);
    currentSeats = currentSeats[0];

    requiredParams = ["seat_id", "is_filled"];
    //check params
    for(let i = 0; i < params.seats.length; i++){
        if(checkParamsAreEnough(params.seats[i], requiredParams, errSock, msgId) == false){
            return false;
        }
    }

    //convert tinyint->boolean
    for(let i = 0; i < currentSeats.length; i++){
        if(currentSeats[i].is_filled == 0){
            currentSeats[i].is_filled = false;
        }else{
            currentSeats[i].is_filled = true;
        }
    }

    for(let i = 0; i < params.seats.length; i++){
            
        for(let j = 0; j < currentSeats.length; j++){
            console.log(`searching ${i} - ${j}`);
            if(params.seats[i].seat_id == currentSeats[j].seat_id){
                console.log(`matched`);

                // if is_filled changed, update is_filled
                if(params.seats[i].is_filled != currentSeats[j].is_filled){
                    currentSeats[j].is_filled = params.seats[i].is_filled;
                    
                    //if customer leave the seat(= is_filled <- false),
                    // update staying_times_array, avg_stay_time
                    if(params.seats[i].is_filled == false){
                        //staedSec = currentTime - start_time
                        let stayedSec = Math.round((new Date()).getTime() / 1000) - currentSeats[j].time_start;
                        let newStayingTime = convertSecToHHMMSS(stayedSec);

                        //parse
                        currentSeats[j].staying_times_array = JSON.parse(currentSeats[j].staying_times_array);
                        currentSeats[j].staying_times_array.push(newStayingTime);

                        let secSum = 0;
                        for(let k = 0; k < currentSeats[j].staying_times_array.length; k++){
                            console.log(`convertHHMMSSToSec(currentSeats[${j}].staying_times_array[${k}])`);
                            console.log(convertHHMMSSToSec(currentSeats[j].staying_times_array[k]));
                            secSum += convertHHMMSSToSec(currentSeats[j].staying_times_array[k]);
                        }

                        console.log("secSum: " + secSum);
                        console.log("currentSeats[j].staying_times_array.length: " + currentSeats[j].staying_times_array.length);

                        currentSeats[j].avg_stay_time = convertSecToHHMMSS(secSum/currentSeats[j].staying_times_array.length);

                        console.log(currentSeats[j]);
                        currentSeats[j].staying_times_array = JSON.stringify(currentSeats[j].staying_times_array);
                        //stringify

                        currentSeats[j].time_start = 0;
                        currentSeats[j].is_filled = 0;

                        let query_updateSeat = `update seat set\
                        is_filled=${currentSeats[j].is_filled}, time_start=${currentSeats[j].time_start},\
                        staying_times_array='${currentSeats[j].staying_times_array}', avg_stay_time='${currentSeats[j].avg_stay_time}'\
                        where seat_id = ${currentSeats[j].seat_id}`;

                        let resUpdateSeat = await db.queryExecuter(query_updateSeat);

                    }else{
                        let currentTime = Math.round((new Date()).getTime() / 1000);
                        let query_updateSeat = `update seat set\
                        is_filled=1, time_start=${currentTime} where seat_id = ${currentSeats[j].seat_id}`;
                        let resUpdateSeat = await db.queryExecuter(query_updateSeat);
                    }

                }
                break;
            }

            //if index reached to last(= params.seats[i] is not owned by request sender)
            if(j == currentSeats.length-1){
                api.errorSender(errSock, "the seats that is not yours are included in the request", msgId);
                return false;
            }
        }
    }

    let result = {
        "status": "success"
    }

    return result;
}

/**
 * 秒をHH:MM:SS形式に変換する
 * @param {int} sec 変換したい秒
 * @returns {string} HH:MM:SS形式
 */
function convertSecToHHMMSS(sec){
    let hh = Math.floor(sec / 3600);
    let mm = Math.floor(sec % 3600 / 60);
    let ss = Math.floor(sec % 60);
    if(hh < 10){
        hh = `0${hh}`;
    }
    if(mm < 10){
        mm = `0${mm}`;
    }
    if(ss < 10){
        ss = `0${ss}`;
    }

    return `${hh}:${mm}:${ss}`;
}

/**
 * HH:MM:SS形式の文字列を秒数に変換する.
 * @param {string} hhmmss HH:MM:SS形式
 * @returns {int} 秒
 */
function convertHHMMSSToSec(hhmmss){
    let splitedHHMMSS = hhmmss.split(':');
    console.log(splitedHHMMSS);
    let hh = splitedHHMMSS[0];
    let mm = splitedHHMMSS[1];
    let ss = splitedHHMMSS[2];
    return hh*3600 + mm*60 + ss*1;
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
 * 時間(HH:MM)の形式が正しいか判断する. 正しくなければクライアントにエラーを送信する.
 * @param {string} time パラメータの時間
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {boolean} 正しい->true, 正しくない->false
 */
function checkTimeSyntax(time, errSock, msgId){
    let splitTime = time.split(':');
    if(splitTime.length != 2){
        api.errorSender(errSock, "invalid time syntax", msgId);
        return false;
    }
    for(let i = 0; i < splitTime.length; i++){
        if(splitTime[i].length != 2){
            api.errorSender(errSock, "invalid time syntax", msgId);
            return false;
        }
    }
    if(splitTime[0] >= 24 || splitTime[0] < 0){
        api.errorSender(errSock, "invalid time syntax(hour is out of range)", msgId);
        return false;
    }
    if(splitTime[1] >= 60 || splitTime[0] < 0){
        api.errorSender(errSock, "invalid time syntax(minute is out of range)", msgId);
        return false;
    }
    return true;
}

/**
 * 誕生日の形式が正しいか判断する. 正しくなければクライアントにエラーを送信する
 * @param {string} birthday パラメータの誕生日
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {string | int} msgId メッセージに含まれていたID
 * @returns {boolean} 正しい->true, 正しくない->false
 */
function checkBirthdaySyntax(birthday, errSock, msgId){
    let splitBirthday = birthday.split('/');
    for(let i = 0; i < splitBirthday.length; i++){
        console.log(i + ": " + splitBirthday[i]);
    }
    if(splitBirthday.length != 3){
        api.errorSender(errSock, "param.birthday is invalid", msgId);
        return false;
    }
    if(splitBirthday[0].length != 4 || splitBirthday[1].length != 2 || splitBirthday[2].length != 2){
        api.errorSender(errSock, "param.birthday is invalid", msgId);
        return false;
    }

    //year
    if(splitBirthday[0] < 1900){
        api.errorSender(errSock, "param.birthday is invalid(year is too old)", msgId);
        return false;
    }
    //month
    if(splitBirthday[1] > 12 || splitBirthday[1] < 1){
        api.errorSender(errSock, "param.birthday is invalid(month is out of range)", msgId);
        return false;
    }
    //day
    if(splitBirthday[2] > 31 || splitBirthday[2] < 1){
        api.errorSender(errSock, "param.birthday is invalid(day is out of range)", msgId);
        return false;
    }

    return true;
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
            api.errorSender(errSock, `param ${checkParamNames[i]} is not included`, msgId);
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