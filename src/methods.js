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
exports.updateInfoRestaurantHolidays = updateInfoRestaurantHolidays;
exports.updateInfoAdminBasic = updateInfoAdminBasic;
exports.updateInfoReservation = updateInfoReservation;
exports.updateInfoEvaluation = updateInfoEvaluation;
exports.resign = resign;
exports.resignForced = resignForced;

exports.pong = pong;

const api = require("./api.js");
const db = require("./db.js");
const sha256 = require("crypto-js/sha256");
const uuid4 = require('uuid4');
const { appendFile } = require("fs");
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

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if (tokenInfo == false){
        api.errorSender(errSock, "invalid token", msgId);
    }

    let query_deleteToken = `delete from auth_token where token_issuer_id = '${tokenInfo.token_issuer_id}';`;
    let deleteResult = await db.queryExecuter(query_deleteToken);
    deleteResult = deleteResult[0];

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
        return false;
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
        return false;
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

    //check token
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
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
        return false;
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
    } else {
        api.errorSender(errSock, "searchBy should admin_id or admin_name", msgId);
        return false;
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
        "status": "success",      
        "admin_id": adminInfo.admin_id,
        "admin_name": adminInfo.admin_name,
        "birthday": adminInfo.birthday,
        "gender": adminInfo.gender,
        "email_addr": adminInfo.email_addr,
        "address": adminInfo.address
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

    if(checkYYYYMMDDSyntax(params.birthday, errSock, msgId) == false){
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

    let query_getAllNames = `select * from user`;
    let allNames = await db.queryExecuter(query_getAllNames);
    if(allNames == false){
        return false;
    }
    if(allNames[0].length != 0){
        allNames = allNames[0];
        for(let i = 0; i < allNames.length; i++){
            console.log(`${allNames[i].user_name} == ${params.user_name}`)
            if(allNames[i].user_name == params.user_name && allNames[i].user_id != tokenInfo.token_issuer_id){
                api.errorSender(errSock, "params.user_name has already taken by other user", msgId);
                return false;
            }
        }
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

    let query_getAllNames = `select * from restaurant`;
    let allNames = await db.queryExecuter(query_getAllNames);
    if(allNames == false){
        return false;
    }
    if(allNames[0].length != 0){
        allNames = allNames[0];
        for(let i = 0; i < allNames.length; i++){
            console.log(`${allNames[i].user_name} == ${params.restaurant_name}`)
            if(allNames[i].user_name == params.restaurant_name && allNames[i].restaurant_id != tokenInfo.token_issuer_id){
                api.errorSender(errSock, "params.restaurant_name has already taken by other restaurant", msgId);
                return false;
            }
        }
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
                api.warnSender(errSock, `seat_id: ${params.seats[i].seat_id} is not yours. this request will be ignored. but process will be continued.`, msgId);
            }
        }
    }

    let result = {
        "status": "success"
    }

    return result;
}

/**
 * 店舗休日情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function updateInfoRestaurantHolidays(params, errSock, msgId){
    let requiredParams = ["token", "type", "holidays"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }
    for(let i = 0; i < params.holidays.length; i++){
        if(checkYYYYMMDDSyntax(params.holidays[i], errSock, msgId) == false){
            return false;
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

    let query_getRestaurantInfo = `select * from restaurant where restaurant_id = ${tokenInfo.token_issuer_id}`;
    let currentRestaurantInfo = await db.queryExecuter(query_getRestaurantInfo);
    currentRestaurantInfo = currentRestaurantInfo[0][0];

    console.log("currentRestaurantInfo");
    console.log(currentRestaurantInfo);

    let currentHolidays = JSON.parse(currentRestaurantInfo.holidays_array);
    console.log("currentHolidays");
    console.log(currentHolidays);

    if(params.type == "new"){
        for(let i = 0; i < params.holidays.length; i++){
            for(let j = 0; j < currentHolidays.length; j++){
                if(params.holidays[i] == currentHolidays[j]){
                    break;
                }
                // if not matched
                if(j == currentHolidays.length-1){
                    currentHolidays.push(params.holidays[i]);
                }
            }
        }

    }else if(params.type == "delete"){
        
        for(let i = 0; i < params.holidays.length; i++){
            for(let j = 0; j < currentHolidays.length; j++){
                if(params.holidays[i] == currentHolidays[j]){
                    currentHolidays.splice(j, 1);
                    break;
                }
                // if not matched
                if(j == currentHolidays.length-1){
                    api.warnSender(errSock, `the delete request(${params.holidays[i]}) is not found on current holidays`, msgId);
                }
            }
        }
        
    }else{
        api.errorSender(errSock, "params.type is invalid", msgId);
        return false;
    }

    console.log(`changed holidays_array: ${currentHolidays}`);

    let query_updateHoliday = `update restaurant set holidays_array = '${JSON.stringify(currentHolidays)}' where restaurant_id = ${tokenInfo.token_issuer_id};`;

    let updateRes = await db.queryExecuter(query_updateHoliday);

    return result = {
        "status": "success"
    };

}

/**
 * 管理者アカウント基本情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function updateInfoAdminBasic(params, errSock, msgId){
    let requiredParams = ["token", "admin_name", "birthday", "gender", "email_addr", "address"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }

    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not register such name", msgId);
        return false;
    }
    if (api.isNotSQLInjection(params.admin_name) == false) {
        api.errorSender(errSock, "params.admin_name contains suspicious character, you can not specify such string", msgId);
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

    if(checkYYYYMMDDSyntax(params.birthday, errSock, msgId) == false){
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "admin"){
        api.errorSender(errSock, "you are not admin", msgId);
        return false;
    }

    let query_getAllNames = `select * from administrator`;
    let allNames = await db.queryExecuter(query_getAllNames);
    if(allNames == false){
        return false;
    }
    if(allNames[0].length != 0){
        allNames = allNames[0];
        for(let i = 0; i < allNames.length; i++){
            console.log(`${allNames[i].user_name} == ${params.admin_name}`)
            if(allNames[i].user_name == params.admin_name && allNames[i].admin_id != tokenInfo.token_issuer_id){
                api.errorSender(errSock, "params.admin_name has already taken by other admin", msgId);
                return false;
            }
        }
    }

    let query_updateAdminInfo = `update administrator set\
    admin_name='${params.admin_name}', birthday='${params.birthday}', gender='${params.gender}', email_addr='${params.email_addr}', address='${params.address}'\
    where admin_id = ${tokenInfo.token_issuer_id};`;

    let updateRes = await db.queryExecuter(query_updateAdminInfo);
    console.log(updateRes);

    return result = {
        "status": "success"
    }

}

/**
 * 予約情報更新API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function updateInfoReservation(params, errSock, msgId){
    let requiredParams = ["token", "type"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.token) == false){
        api.errorSender(errSock, "params.coken concains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let result = false;
    console.log(params.type);
    if(params.type == "new"){
        result = await registerReservation(params, errSock, msgId);
    }else if(params.type == "delete"){
        result = await deleteReservation(params, errSock, msgId);
    }else{
        api.errorSender(errSock, "params.type is invalid", msgId);
        return false;
    }

    return result;
}

/**
 * 予約情報更新API-new
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function registerReservation(params, errSock, msgId){
    if(checkParamsAreEnough(params, ["reservationData"], errSock, msgId) == false){
        return false;
    }
    let requiredReservationData = ["restaurant_id", "seat_id", "time_start", "time_end", "num_people"];
    if(checkParamsAreEnough(params.reservationData, requiredReservationData, errSock, msgId) == false){
        return false;
    }

    if(api.isNotSQLInjection(params.reservationData.restaurant_id) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.reservationData.seat_id) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.reservationData.time_start) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.reservationData.time_end) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.reservationData.num_people) == false){
        return false;
    }

    if(typeof params.reservationData.time_start === 'string' || params.reservationData.time_start instanceof String){
        api.errorSender(errSock, "params.reservationData.time_start should be int", msgId);
        return false;
    }
    if(typeof params.reservationData.time_end === 'string' || params.reservationData.time_end instanceof String){
        api.errorSender(errSock, "params.reservationData.time_end should be int", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "user"){
        api.errorSender(errSock, "only user can register a reservation", msgId);
        return false;
    }

    let currentTime = Math.round((new Date()).getTime() / 1000);
    
    if(params.reservationData.time_start < currentTime){
        api.errorSender(errSock, "you can not register reservation that time_start is earlier than current time", msgId);
        return false;
    }
    if(params.reservationData.time_start > params.reservationData.time_end){
        api.errorSender(errSock, "time_end should be bigger than time_start", msgId);
        return false;
    }
    let DAYSEC = 86400;
    if(params.reservationData.time_end - params.reservationData.time_start > DAYSEC){
        api.errorSender(errSock, "the time length should shorter than 24Hours", msgId)
        return false;
    }

    let query_restaurantInfo = `select * from restaurant where restaurant_id = ${params.reservationData.restaurant_id};`;
    let restaurantInfo = await db.queryExecuter(query_restaurantInfo);
    if(restaurantInfo[0].length == 0){
        api.errorSender(errSock, "no such restaurant exists", msgId);
        return false;
    }
    restaurantInfo = restaurantInfo[0][0];
    console.log(restaurantInfo);

    let diffJSTSec = 32400;

    let timeStart = new Date((params.reservationData.time_start + diffJSTSec) * 1000);
    let timeEnd = new Date((params.reservationData.time_end + diffJSTSec) * 1000);

    console.log(`timeStart: ${timeStart}`)
    console.log(`timeEnd: ${timeEnd}`)

    let ymdhmStart = [timeStart.getFullYear(), timeStart.getMonth()+1, timeStart.getDate(), timeStart.getHours(), timeStart.getMinutes()];
    let ymdhmEnd = [timeEnd.getFullYear(), timeEnd.getMonth()+1, timeEnd.getDate(), timeEnd.getHours(), timeEnd.getMinutes()];

    //adjust format
    console.log(ymdhmStart);
    console.log(ymdhmEnd);
    for(let i = 0; i < ymdhmStart.length; i++){
        ymdhmStart[i] = `${ymdhmStart[i]}`;
        ymdhmEnd[i] = `${ymdhmEnd[i]}`;
        if(ymdhmStart[i] < 10){
            ymdhmStart[i] = `0${ymdhmStart[i]}`;
        }
        if(ymdhmEnd[i] < 10){
            ymdhmEnd[i] = `0${ymdhmEnd[i]}`;
        }
    }

    let startYD = `${ymdhmStart[0]}/${ymdhmStart[1]}/${ymdhmStart[2]}`;
    let endYD = `${ymdhmEnd[0]}/${ymdhmEnd[1]}/${ymdhmEnd[2]}`;

    restaurantInfo.holidays_array = JSON.parse(restaurantInfo.holidays_array);
    for(let i = 0; i < restaurantInfo.holidays_array.length; i++){
        if(startYD == restaurantInfo.holidays_array[i] || endYD == restaurantInfo.holidays_array[i]){
            api.errorSender(errSock, "time of reservation is holiday", msgId);
            return false;
        }
    }

    
    let separatedBusinessHoursOpen = restaurantInfo.time_open.split(':');
    let separatedBusinessHoursClose = restaurantInfo.time_close.split(':');
    let businessHoursOpen = separatedBusinessHoursOpen[0] + separatedBusinessHoursOpen[1];
    let businessHoursClose = separatedBusinessHoursClose[0] + separatedBusinessHoursClose[1];

    console.log(separatedBusinessHoursOpen);
    console.log(separatedBusinessHoursClose);
    
    console.log("businessHoursOpen");
    console.log("businessHoursClose");
    console.log(businessHoursOpen);
    console.log(businessHoursClose);

    let reqStart = ymdhmStart[3] + ymdhmStart[4];
    let reqEnd = ymdhmEnd[3] + ymdhmEnd[4];

    
    //check valid time or not
    console.log("reqStart: " + reqStart);
    console.log("reqEnd: " + reqEnd);
    if(reqStart < businessHoursOpen){
        api.errorSender(errSock, `time_start is too early. restaurant open_time is ${separatedBusinessHoursOpen[0]}:${separatedBusinessHoursOpen[1]}`, msgId);
        return false;
    }else if(reqStart > businessHoursClose){
        api.errorSender(errSock, `time_start is too late. restaurant close_time is ${separatedBusinessHoursClose[0]}:${separatedBusinessHoursClose[1]}`, msgId);
        return false;
    }
    
    if(businessHoursClose - businessHoursOpen < 0 ){   
        if(reqEnd-reqStart < 0 && reqEnd > businessHoursClose){
            console.log("1");
            console.log("reqStart: " + reqStart);
            console.log("reqEnd: " + reqEnd);
            api.errorSender(errSock, `time_end is too late. restaurant close_time is ${separatedBusinessHoursClose[0]}:${separatedBusinessHoursClose[1]}`, msgId);
            return false;
        }
    }else{
        if(businessHoursClose < reqEnd){
            console.log("2");
            console.log("reqStart: " + reqStart);
            console.log("reqEnd: " + reqEnd);
            api.errorSender(errSock, `time_end is too late. restaurant close_time is ${separatedBusinessHoursClose[0]}:${separatedBusinessHoursClose[1]}`, msgId);
            return false;
        }
    }

    let query_getRestaurantSeat = `select * from seat where seat_id = ${params.reservationData.seat_id}`;
    let specifiedSeat = await db.queryExecuter(query_getRestaurantSeat);
    if(specifiedSeat == false){
        return false;
    }
    specifiedSeat = specifiedSeat[0];
    if(specifiedSeat.length == 0){
        api.errorSender(errSock, "no such seat exists", msgId);
        return false;
    }
    specifiedSeat = specifiedSeat[0];
    if(specifiedSeat.restaurant_id != params.reservationData.restaurant_id){
        api.errorSender(errSock, "the restaurant does not own the seat that you specified", msgId);
        return false;
    }
    
    
    let query_getCurrentSeatReservations = `select * from reservation where seat_id = ${params.reservationData.seat_id} and restaurant_id = ${params.reservationData.restaurant_id};`;
    let currentSeatReservations = await db.queryExecuter(query_getCurrentSeatReservations);
    currentSeatReservations = currentSeatReservations[0];
    console.log(currentSeatReservations);


    // duplication check
    for(let i = 0; i < currentSeatReservations.length; i++){
        //if time_start is inside of current reservations
        if(params.reservationData.time_start >= currentSeatReservations[i].time_start && params.reservationData.time_start <= currentSeatReservations[i].time_end){
            api.errorSender(errSock, "your reservation request is duplicating with other. the request was dismissed");
            console.log("curResStart " + "reqStart " + "curResEnd");
            console.log(currentSeatReservations[i].time_start + " " + params.reservationData.time_start + " " + currentSeatReservations[i].time_end);
            return false;
        }

        //if time_end is inside of current resrvations
        if(params.reservationData.time_end >= currentSeatReservations[i].time_start && params.reservationData.time_end <= currentSeatReservations[i].time_end){
            api.errorSender(errSock, "your reservation request is duplicating with other. the request was dismissed");
            console.log("curResStart " + "reqEnd " + "curResEnd");
            console.log(currentSeatReservations[i].time_start + " " + params.reservationData.time_end + " " + currentSeatReservations[i].time_end);
            
            return false;
        }

        //if time_start-time_end includes other reservations
        if(params.reservationData.time_start <= currentSeatReservations[i].time_start && params.reservationData.time_end >= currentSeatReservations[i].time_end){
            api.errorSender(errSock, "your reservation request is duplicating with other. the request was dismissed");
            console.log("reqStart -- curStart -- curEnd -- reqEnd");
            console.log(`${params.reservationData.time_start} -- ${currentSeatReservations[i].time_start} -- ${currentSeatReservations[i].time_end} -- ${params.reservationData.time_end}`);
            return false;
        }
    }

    let query_getSeatInfo = `select * from seat where seat_id = ${params.reservationData.seat_id};`;
    let seatInfo = await db.queryExecuter(query_getSeatInfo);
    seatInfo = seatInfo[0][0];

    if(params.reservationData.num_people > seatInfo.capacity){
        api.errorSender(errSock, "num_people is too much", msgId);
        return false;
    }

    let query_getAllReservationIds = `select reservation_id from reservation`;
    let allReservationId = await db.queryExecuter(query_getAllReservationIds);
    
    allReservationId = allReservationId[0];
    console.log(allReservationId);
    console.log(allReservationId.length);

    let maxId = 0;
    for(let i = 0; i < allReservationId.length; i++){
        if(allReservationId[i].reservation_id > maxId){
            maxId = allReservationId[i].reservation_id;
        }
    }

    let query_insertReservation = `insert into\
    reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired)\
    values (${maxId+1}, ${params.reservationData.restaurant_id}, ${tokenInfo.token_issuer_id}, ${params.reservationData.seat_id},\
    ${params.reservationData.time_start}, ${params.reservationData.time_end}, ${params.reservationData.num_people}, 0)`;

    let resInsert = await db.queryExecuter(query_insertReservation);
    if(resInsert == false){
        return false;
    }

    return result = {
        "status": "success",
        "reservation_id": maxId+1
    }

}

/**
 * 予約情報更新API-delete
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function deleteReservation(params, errSock, msgId){
    let requiredParams = ["reservation_id"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.reservation_id) == false){
        api.errorSender(errSock, "params.reservation_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(isNaN(params.reservation_id)){
        api.errorSender(errSock, "reservation_id should be number", msgId);
        return false;
    }

    
    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let query_getReservation = `select * from reservation where reservation_id = ${params.reservation_id}`;
    let reservationData = await db.queryExecuter(query_getReservation);

    reservationData = reservationData[0];
    if(reservationData.length == 0){
        api.errorSender(errSock, "the reservation_id that you wanted to delete was not found", msgId);
        return false;
    }
    reservationData = reservationData[0];

    let currentTime = Math.round((new Date()).getTime() / 1000);

    if(tokenInfo.token_permission == "user"){
        if(tokenInfo.token_issuer_id != reservationData.user_id){
            api.errorSender(errSock, "this reservation is not yours", msgId);
            return false;
        }
        //if reservation dismissed when reserve starts within 10min
        if(reservationData.time_start - currentTime < 600 && reservationData.time_start-currentTime >= 0){
            let query_getViciousCancels = `select num_vicious_cancels from user where user_id =${tokenInfo.token_issuer_id};`;
            let viciousCancels = await db.queryExecuter(query_getViciousCancels);
            viciousCancels = viciousCancels[0][0];
            viciousCancels = viciousCancels.num_vicious_cancels;
            viciousCancels++;
            let query_addViciousCancels = `update user set num_vicious_cancels=${viciousCancels} where user_id = ${tokenInfo.token_issuer_id};`;
            let resAddViciousCancels = await db.queryExecuter(query_addViciousCancels);
            api.warnSender(errSock, "DO NOT CANCEL RESERVE WHEN RESERVE STARTS WITHIN 10MIN.", msgId); 
        }

    }else if(tokenInfo.token_permission == "restaurant"){
        if(tokenInfo.tokken_issuer_id != reservationData.restaurant_id){
            api.errorSender(errSock, "you can not delete this request. this request is not for your restaurant", msgId);
            return false;
        }
    }

    let query_deleteReservation = `delete from reservation where reservation_id = ${params.reservation_id}`;
    let resDeleteReservation = await db.queryExecuter(query_deleteReservation);

    return result = {
        "status": "success"
    }

}

/**
 * 食べログ情報変更API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function updateInfoEvaluation(params, errSock, msgId){
    let requiredParams = ["type", "token"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    
    if (api.isNotSQLInjection(params.token) == false) {
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let result = false;
    if(params.type == "new"){
        result = await registerEvaluation(params, errSock, msgId);
    }else if(params.type == "change"){
        result = await changeEvaluation(params, errSock, msgId);
    }else if(params.type == "delete"){
        result = await deleteEvaluation(params, errSock, msgId);
    }else{
        api.errorSender(errSock, "params.type is invalid", msgId);
        return false;
    }

    return result;

}

/**
 * 食べログ情報変更API-new
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function registerEvaluation(params, errSock, msgId){
    let requiredParams = ["evaluationData"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    requiredParams = ["restaurant_id", "evaluation_grade", "evaluation_comment"];
    if(checkParamsAreEnough(params.evaluationData, requiredParams, errSock, msgId) == false){
        return false;
    }

    if(api.isNotSQLInjection(params.evaluationData.restaurant_id) == false){
        api.errorSender(errSock, "params.evaluationData.restaurant_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.evaluationData.evaluation_grade) == false){
        api.errorSender(errSock, "params.evaluationData.evaluation_grade contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.evaluationData.evaluation_comment) == false){
        api.errorSender(errSock, "params.evaluationData.evaluation_comment contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "user"){
        api.errorSender(errSock, "only use can post the evaluation", msgId);
        return false;
    }

    let query_getRestaurant = `select * from restaurant where restaurant_id = ${params.evaluationData.restaurant_id}`;
    let restaurantInfo = await db.queryExecuter(query_getRestaurant);
    restaurantInfo = restaurantInfo[0];
    if(restaurantInfo.length == 0){
        api.errorSender(errSock, "no such restaurant exists", msgId);
        return false;
    }
    // if grade is not number
    if(isNaN(params.evaluationData.evaluation_grade)){
        api.errorSender(errSock, "evaluation grade should be number", msgId);
        return false;
    }
    if(params.evaluationData.evaluation_grade < 1 || params.evaluationData.evaluation_grade > 5){
        api.errorSender(errSock, "evaluation_grade should be 1-5", msgId);
        return false;
    }

    let query_getEvaluationId = `select evaluation_id from restaurant_evaluation`;
    let allEvaluationId = await db.queryExecuter(query_getEvaluationId);
    if(allEvaluationId == false){
        return false;
    }
    allEvaluationId = allEvaluationId[0];
    
    let maxId = 0;
    for(let i = 0; i < allEvaluationId.length; i++){
        if(allEvaluationId[i].evaluation_id > maxId){
            maxId = allEvaluationId[i].evaluation_id;
        }
    }

    let query_insertEvaluation = `insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment)\
    values(${maxId+1}, ${params.evaluationData.restaurant_id}, ${tokenInfo.token_issuer_id}, ${params.evaluationData.evaluation_grade}, '${params.evaluationData.evaluation_comment}')`;

    let insertRes = await db.queryExecuter(query_insertEvaluation);
    if(insertRes == false){
        return false;
    }

    return result = {
        "status": "success",
        "evaluation_id": maxId+1
    }

}

/**
 * 食べログ情報変更API-change
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function changeEvaluation(params, errSock, msgId){
    let requiredParams = ["evaluationData"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    requiredParams = ["evaluation_id", "evaluation_grade", "evaluation_comment"];
    if(checkParamsAreEnough(params.evaluationData, requiredParams, errSock, msgId) == false){
        return false;
    }

    if(api.isNotSQLInjection(params.evaluationData.evaluation_id) == false){
        api.errorSender(errSock, "params.evaluationData.evaluation_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.evaluationData.evaluation_grade) == false){
        api.errorSender(errSock, "params.evaluationData.evaluation_grade contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.evaluationData.evaluation_comment) == false){
        api.errorSender(errSock, "params.evaluationData.evaluation_comment contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "user"){
        api.errorSender(errSock, "only use can post the evaluation", msgId);
        return false;
    }

    if(params.evaluationData.evaluation_grade < 1 || params.evaluationData.evaluation_grade > 5){
        api.errorSender(errSock, "evaluation_grade should be 1-5", msgId);
        return false;
    }

    let query_getEvaluation = `select * from restaurant_evaluation where evaluation_id = ${params.evaluationData.evaluation_id}`;
    let evaluationData = await db.queryExecuter(query_getEvaluation);
    evaluationData = evaluationData[0];
    if(evaluationData.length == 0){
        api.errorSender(errSock, "no such evaluation exists", msgId);
        return false;
    }
    evaluationData = evaluationData[0];
    if(evaluationData.user_id != tokenInfo.token_issuer_id){
        api.errorSender(errSock, "specified evaluation is not yours", msgId);
        return false;
    }

    let query_updateEvaluation = `update restaurant_evaluation set\
    evaluation_grade = ${params.evaluationData.evaluation_grade}, evaluation_comment = '${params.evaluationData.evaluation_comment}'\
    where evaluation_id = ${params.evaluationData.evaluation_id}`;

    let updateRes = await db.queryExecuter(query_updateEvaluation);
    if(updateRes == false){
        return false;
    }

    return result = {
        "status": "success",
        "evaluation_id": params.evaluationData.evaluation_id
    }

}

/**
 * 食べログ情報変更API-delete
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function deleteEvaluation(params, errSock, msgId){
    let requiredParams = ["evaluation_id"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.evaluation_id) == false){
        api.errorSender(errSock, "params.evaluation_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let query_getEvaluation = `select * from restaurant_evaluation where evaluation_id = ${params.evaluation_id}`;
    let evaluationData = await db.queryExecuter(query_getEvaluation);
    evaluationData = evaluationData[0];
    if(evaluationData.length == 0){
        api.errorSender(errSock, "no such evaluation exists", msgId);
        return false;
    }
    evaluationData = evaluationData[0];

    //only person who post or restaurant who posted can delete
    if(tokenInfo.token_permission == "user"){
        if(evaluationData.user_id != tokenInfo.token_issuer_id){
            api.errorSender(errSock, "specified evaluation is not yours", msgId);
            return false;
        }
    }else if(tokenInfo.token_permission == "restaurant"){
        if(evaluationData.restaurant_id != tokenInfo.token_issuer_id){
            api.errorSender(errSock, "specified evaluation is not yours", msgId);
            return false;
        }
    }

    let query_deleteEvaluation = `delete from restaurant_evaluation where evaluation_id = ${params.evaluation_id}`;
    let deleteRes = await db.queryExecuter(query_deleteEvaluation);
    if(deleteRes == false){
        return false;
    }

    return result = {
        "status": "success"
    }

}

/**
 * アカウント退会API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function resign(params, errSock, msgId){
    let requiredParams = ["token", "password"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.token) == false){
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }

    let query_getClientInfo;
    if(tokenInfo.token_permission == "user"){
        query_getClientInfo = `select * from user where user_id = ${tokenInfo.token_issuer_id}`;
    }else if(tokenInfo.token_permission == "restaurant"){
        query_getClientInfo = `select * from restaurant where restaurant_id = ${tokenInfo.token_issuer_id}`;
    }else if(tokenInfo.token_permission == "admin"){
        query_getClientInfo = `select * from administrator where admin_id = ${tokenInfo.token_issuer_id}`;
    }else{
        api.errorSender(errSock, "500", msgId);
        return false;
    }

    let clientInfo = await db.queryExecuter(query_getClientInfo);
    clientInfo = clientInfo[0];
    if(clientInfo.length == 0){
        api.errorSender(errSock, "no such client exist", msgId);
        return false;
    }
    clientInfo = clientInfo[0];

    // verify password
    if(clientInfo.password != sha256(params.password)){
        api.errorSender(errSock, "password is wrong", msgId);
        return false;
    }

    let queries;
    if(tokenInfo.token_permission == "user"){
        let query_deleteUserReservation = `delete from reservation where user_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteUserEvaluation = `delete from restaurant_evaluation where user_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteUserInfo = `delete from user where user_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteUserToken = `delete from auth_token where token_issuer_id = ${tokenInfo.token_issuer_id}`;
        queries = [query_deleteUserReservation, query_deleteUserEvaluation, query_deleteUserInfo, query_deleteUserToken];

    }else if(tokenInfo.token_permission == "restaurant"){
        let query_deleteRestaurantReservation = `delete from reservation where restaurant_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteRestaurantEvaluation = `delete from restaurant_evaluation where restaurant_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteRestaurantSeat = `delete from seat where restaurant_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteRestaurantInfo = `delete from restaurant where restaurant_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteRestaurantToken = `delete from auth_token where token_issuer_id = ${tokenInfo.token_issuer_id}`;
        queries = [query_deleteRestaurantReservation, query_deleteRestaurantEvaluation, query_deleteRestaurantSeat, query_deleteRestaurantInfo, query_deleteRestaurantToken];

    }else if(tokenInfo.token_permission == "admin"){
        let query_deleteAdminInfo = `delete from administrator where admin_id = ${tokenInfo.token_issuer_id}`;
        let query_deleteAdminToken = `delete from auth_token where token_issuer_id = ${tokenInfo.token_issuer_id}`;
        queries = [query_deleteAdminInfo, query_deleteAdminToken];
    }

    for(let i = 0; i < queries.length; i++){
        let deleteRes = await db.queryExecuter(queries[i]);
    }

    return result = {
        "status": "success"
    }

}

/**
 * アカウント強制退会API
 * @param {Object} params メッセージに含まれていたパラメータ
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Object} false->エラー, Object->成功
 */
async function resignForced(params, errSock, msgId){
    let requiredParams = ["token", "account_role", "account_id"];
    if(checkParamsAreEnough(params, requiredParams, errSock, msgId) == false){
        return false;
    }
    if(api.isNotSQLInjection(params.token) == false){
        api.errorSender(errSock, "params.token contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.account_role) == false){
        api.errorSender(errSock, "params.account_role contains suspicious character, you can not specify such string", msgId);
        return false;
    }
    if(api.isNotSQLInjection(params.account_id) == false){
        api.errorSender(errSock, "params.account_id contains suspicious character, you can not specify such string", msgId);
        return false;
    }

    let tokenInfo = await checkToken(params.token, errSock, msgId);
    if(tokenInfo == false){
        return false;
    }
    if(tokenInfo.token_permission != "admin"){
        api.errorSender(errSock, "403", msgId);
        return false;
    }

    let queries;
    if(params.account_role == "user"){
        let query_getUser = `select * from user where user_id = ${params.account_id}`;
        let userInfo = await db.queryExecuter(query_getUser);

        console.log(userInfo[0]);

        if(userInfo[0].length == 0){
            api.errorSender(errSock, "there is no such account", msgId);
            return false;
        }

        let query_deleteUserReservation = `delete from reservation where user_id = ${params.account_id}`;
        let query_deleteUserEvaluation = `delete from restaurant_evaluation where user_id = ${params.account_id}`;
        let query_deleteUserInfo = `delete from user where user_id = ${params.account_id}`;
        let query_deleteUserToken = `delete from auth_token where token_issuer_id = ${params.account_id}`;
        queries = [query_deleteUserReservation, query_deleteUserEvaluation, query_deleteUserInfo, query_deleteUserToken];

    }else if(params.account_role == "restaurant"){
        let query_getRestaurant = `select * from restaurant where restaurant_id = ${params.account_id}`;
        let restaurantInfo = await db.queryExecuter(query_getRestaurant);
        if(restaurantInfo[0].length == 0){
            api.errorSender(errSock, "there is no such account", msgId);
            return false;
        }

        let query_deleteRestaurantReservation = `delete from reservation where restaurant_id = ${params.account_id}`;
        let query_deleteRestaurantEvaluation = `delete from restaurant_evaluation where restaurant_id = ${params.account_id}`;
        let query_deleteRestaurantSeat = `delete from seat where restaurant_id = ${params.account_id}`;
        let query_deleteRestaurantInfo = `delete from restaurant where restaurant_id = ${params.account_id}`;
        let query_deleteRestaurantToken = `delete from auth_token where token_issuer_id = ${params.account_id}`;
        queries = [query_deleteRestaurantReservation, query_deleteRestaurantEvaluation, query_deleteRestaurantSeat, query_deleteRestaurantInfo, query_deleteRestaurantToken];

    }else if(params.account_role == "administrator" || params.account_role == "admin"){
        api.errorSender(errSock, "can not delete admin", msgId);
        return false;
    }

    for(let i = 0; i < queries.length; i++){
        let deleteRes = await db.queryExecuter(queries[i]);
    }

    return result = {
        "status": "success"
    }

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
 * YYYY/MM/DDの形式が正しいか判断する. 正しくなければエラーを送信する.
 * @param {string} yyyymmdd YYYY/MM/DD
 * @param {ws.sock} errSock エラー時に使用するソケット
 * @param {int | string} msgId メッセージに含まれていたID
 * @returns {false | Array} 正しい->splitedArgument(array), 正しくない->false
 */
function checkYYYYMMDDSyntax(yyyymmdd, errSock, msgId){
    let splitYYYYMMDD = yyyymmdd.split('/');
    if(splitYYYYMMDD.length != 3){
        api.errorSender(errSock, "invalid format of YYYY/MM/DD", msgId);
        return false;
    }
    if(splitYYYYMMDD[0].length != 4 || splitYYYYMMDD[1].length != 2 || splitYYYYMMDD[2].length != 2){
        api.errorSender(errSock, "invalid format of YYYY/MM/DD", msgId);
        return false;
    }

    //if not number
    if (isNaN(splitYYYYMMDD[0]) || isNaN(splitYYYYMMDD[1]) || isNaN(splitYYYYMMDD[2])) {
        api.errorSender(errSock, "invalid format of YYYY/MM/DD", msgId);
        return false;
    }

    //year
    if (splitYYYYMMDD[0] < 1900) {
        api.errorSender(errSock, "invalid format of YYYY/MM/DD(year is too old)", msgId);
        return false;
    }
    //month
    if (splitYYYYMMDD[1] > 12 || splitYYYYMMDD[1] < 1) {
        api.errorSender(errSock, "invalid format of YYYY/MM/DD(month is out of range)", msgId);
        return false;
    }
    //day
    if (splitYYYYMMDD[2] > 31 || splitYYYYMMDD[2] < 1) {
        api.errorSender(errSock, "invalid format of YYYY/MM/DD(day is out of range)", msgId);
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