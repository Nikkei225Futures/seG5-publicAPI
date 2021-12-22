/**
 * @file DBにクエリを実行させるモジュール.
 */

"use strict;"

const mysql = require('mysql2/promise');

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "Rubbish-123",
    database: "testdb"
}

/**
 * 同期的にSQL文を実行して結果を返却する
 * @param {Object} query 実行するSQL文
 * @returns {string} 実行結果
 */
exports.queryExecuter = async function queryExecuter(query){
    console.log("query: " + query);
    const pool = await mysql.createPool(dbConfig);
    let result;
    try{
        //console.log(connection);
        console.log("connect");
        result = await pool.execute(query);

    }catch(err){
        console.log("error on queryExecuter: " + err);
        result = false;
    }finally{
        await pool.end();
    }
    return result;
}