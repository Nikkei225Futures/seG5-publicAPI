"use strict;"

const mysql = require('mysql2/promise');

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "Rubbish-123",
    database: "testdb"
}

exports.queryExecuter = async function queryExecuter(query){
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
