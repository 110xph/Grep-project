/**
 * Created by luoyuyu on 2017/8/17.
 */
var pool = require('../mysql/dbConfig');
var fs = require('fs');
var csv = require('fast-csv');
var path = require('path');
var csvWriter = require('csv-write-stream')


module.exports.getUserIP = function(req){
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    ip = ip.match(/\d+.\d+.\d+.\d+/);
    ip = ip ? ip.join('.') : null;
    return ip
};

module.exports.WriteUserIP = function(time, ip, username, operation){
    //write
    var writer = csvWriter({sendHeaders: false}); //Instantiate var
    var csvFilename = "./logs.csv";

    // If CSV file does not exist, create it and add the headers
    if (!fs.existsSync(csvFilename)) {
      writer = csvWriter({sendHeaders: false});
      writer.pipe(fs.createWriteStream(csvFilename));
      writer.write({
        header1: 'TIME',
        header2: 'IP',
        header3: 'User',
        header4: 'Operation'
      });
      writer.end();
    }

    // Append some data to CSV the file
    writer = csvWriter({sendHeaders: false});
    writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
    writer.write({
      header1: time,
      header2: ip,
      header3: username,
      header4: operation
    });
    writer.end();
};

module.exports.getColumnValues = async function (tableID, columnID) {
    let data = {};
    let columnType = '';
    try {
        await new Promise((resolve, reject) => {
            pool.getConnection(function (err,connection) {
                if (err) reject(err);
                else {
                    connection.query('DESCRIBE '+"`"+tableID+"`",function (err,result) {
                        if (err) reject(err);
                        else {
                            //code here
                            for (let i = 0; i < result.length; i++){
                                if (columnID == result[i].Field)
                                {
                                    columnType = result[i].Type;
                                }
                            }
                            if (columnType.toLowerCase().indexOf('varchar') != -1)
                            {
                                data['type'] = 'category';
                            }
                            if (columnType.toLowerCase().indexOf('int') != -1 ||
                                columnType.toLowerCase().indexOf('float') != -1 ||
                                columnType.toLowerCase().indexOf('double') != -1)
                            {
                                data['type'] = 'numerical';
                            }
                            if (columnType.toLowerCase().indexOf('date') != -1 || columnType.toLowerCase().indexOf('year') != -1)
                            {
                                data['type'] = 'date';
                            }
                            resolve(columnType);
                        }
                        connection.release();
                    })
                }
            })

        })
    }catch (err){
        console.log(err);
    }
    return new Promise((resolve, reject) => {
        if (data['type'] == 'numerical'){
            pool.getConnection(function (err,connection) {
                if (err) reject(err);
                else {//SELECT MIN(id), MAX(id) FROM tabla
                    connection.query("select min( `"+columnID+"` ), max( `"+columnID+"` ) from "+"`"+tableID+"`",function (err,result) {
                        if (err) reject(err);
                        else {
                            data['value'] = [];
                            for (var key in result[0]) {
                                // console.log(key); // key1 and etc...
                                // console.log(result[0][key]); // val1 and etc...
                                data['value'].push(result[0][key])
                            }
                            resolve(data);
                        }
                        connection.release();
                    })
                }
            })
        }else {
            pool.getConnection(function (err,connection) {
                if (err) reject(err);
                else {
                    connection.query("select distinct( `"+columnID+"` ) from "+"`"+tableID+"`",function (err,result) {
                        if (err) reject(err);
                        else {
                            data['value'] = [];
                            for (let i = 0; i < result.length; i++){
                                data['value'].push(result[i][columnID]);
                            }
                            resolve(data);
                        }
                        connection.release();
                    })
                }
            })
        }
    })
};

module.exports.getTableColumnNameType = async function (tableID) {
    "use strict";
    let data = {};
    let columnName = [];
    let columnType = [];
    try {
        await new Promise((resolve, reject) => {
            pool.getConnection(function (err,connection) {
                if (err) reject(err);
                else {
                    connection.query('SELECT COUNT(*) FROM ' +"`"+tableID+"`",function (err,result) {
                        if (err) reject(err);
                        else {
                            // console.log("result = ",result[0]['COUNT(*)'])
                            data['rows'] = result[0]['COUNT(*)'];
                            resolve(columnType);
                        }
                        connection.release();
                    })
                }
            })

        })
    }catch (err){
        console.log(err);
    }
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err,connection) {
            if (err) reject(err);
            else {
                connection.query('DESCRIBE '+"`"+tableID+"`",function (err,result) {
                    if (err) reject(err);
                    else {
                        // console.log("1.describe table");
                        //code here
                        for (let i = 0; i < result.length; i++){
                            if (result[i].Type.toLowerCase().indexOf('varchar') != -1)
                            {
                                columnType.push('category');
                            }
                            if (result[i].Type.toLowerCase().indexOf('int') != -1 ||
                                result[i].Type.toLowerCase().indexOf('float') != -1 ||
                                result[i].Type.toLowerCase().indexOf('double') != -1)
                            {
                                columnType.push('numerical');
                            }
                            if (result[i].Type.toLowerCase().indexOf('date') != -1 || result[i].Type.toLowerCase().indexOf('year') != -1)
                            {
                                columnType.push('date');
                            }
                            columnName.push(result[i].Field);
                        }
                        data['type'] = columnType;
                        data['name'] = columnName;
                        data['columns'] = result.length;
                        console.log("data = ",data)
                        resolve(data);
                    }
                    connection.release();
                })
            }
        })
    })
};


module.exports.getUploadedTables = function () {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err,connection) {
            if (err) reject(err);
            else {
                connection.query("select * from tableInfo where userId = 'YUYU' OR userId = 'undefined'",function (err,result) {
                    if (err) reject(err);
                    else {
                        resolve(result);
                    }
                    connection.release();
                })
            }
        })
    })
};

module.exports.getUserUploadedTables = function (username) {
    let sql = "select * from `tableInfo` where userId = " + "'" + username + "'";
    console.log('sql = ',sql);
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err,connection) {
            if (err) reject(err);
            else {
                connection.query(sql, function (err,result) {
                    if (err) reject(err);
                    else {
                        resolve(result);
                    }
                    connection.release();
                })
            }
        })
    })
};

module.exports.getTableByIDServerSidePagination = async function (tableID, limit, offset) {
    let rows = [];
    await new Promise((resolve, reject) => {
        pool.getConnection(function (err,connection) {
            if (err) reject(err);
            else {
                connection.query("select * from "+"`"+tableID+"` limit "+offset+","+limit,function (err,result) {
                    if (err) reject(err);
                    else {
                        // console.log(result)
                        rows = result;
                        resolve(result);
                    }
                    connection.release();
                })
            }
        })
    });
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err,connection) {
            if (err) reject(err);
            else {
                connection.query("select count(*) from "+"`"+tableID+"`",function (err,result) {
                    if (err) reject(err);
                    else {
                        let data = [];
                        data['rows'] = rows;
                        data['total'] = result[0]['count(*)'];
                        console.log('Read from MySQL')
                        console.log(data)
                        resolve(data);
                    }
                    connection.release();
                })
            }
        })
    })
};

module.exports.insertTableNLP = async function (tableID, colName) {
    let insertSQL = 'insert into tableNLP (id, columns, explanation, remark) values ( ' + '"' + tableID + '", "';
    for (let i = 0; i < colName.length; i++){
        insertSQL += colName[i];
        if ( i + colName.length-1)
            insertSQL += '##';
    }
    insertSQL += '", "';
    for (let i = 0; i < colName.length; i++){
        insertSQL += colName[i];
        if ( i + colName.length-1)
            insertSQL += '##';
    }
    insertSQL += '" , "")';
    console.log('INSERT INTO tableNLP --> SQL = ', insertSQL);
    pool.getConnection(function (err,connection) {
        if (err) reject(err);
        else {
            connection.query(insertSQL, function (err,result) {
                if (err) console.log('Fail to INSERT INTO tableNLP');
                else {
                    console.log('INSERT INTO tableNLP successfully.')
                }
                connection.release();
            })
        }
    })
};

//module.exports.importFiles = function (userID,tableID, callback) {
module.exports.importFiles =async function (userID,tableID,colName,colType,separator,callback) {
    "use strict";
    let csvPath = path.join(__dirname,'../','uploadFiles/',tableID+'.csv');
    pool.getConnection(function (err,connection) {
        if (err){
            //callback(err);
            return;
        }else {
            let createSQL = "CREATE TABLE IF NOT EXISTS "+'`'+tableID+'` (';
            for (let i=0;i<colName.length;i++){
                createSQL+='`'+colName[i]+'`';
                createSQL+=' ';
                createSQL+= colType[i];
                if (i!=colName.length-1){
                    createSQL+=', ';
                }
            }
            createSQL+=') character set = utf8;';
            console.log("createSQL : " + createSQL);
            try {
                connection.query(createSQL, function (err,result,res) {  //加转义字符 ` `，可以让特殊符号插入mysql
                    if(err){
                        console.log("CREATE TABLE-something WRONG");
                        // throw err;
                        //callback(err);
                        return;
                    }else {
                        // load data local infile '/root/dataset/FlyDelay_NewYork.csv'
                        // into table `FlyDelay_NewYork2017` fields terminated by ','
                        // LINES TERMINATED BY '\r\n' IGNORE 1 LINES
                        console.log('construct loadSQL');
                        console.log('csvPath = ',csvPath);
                        console.log('tableID = ',tableID);
                        let loadSQL = 'load data local infile "' + csvPath + '" into table ' + '`' + tableID + '`'
                            + ' fields terminated by "," ' + ' LINES TERMINATED BY ';
                        // separator = {
                        //     1 : '\n',
                        //     2 : '\r',
                        //     3 : '\n\r',
                        //     4 : '\r\n'
                        // }
                        switch (separator){
                            case '1':
                                loadSQL += '"\n" IGNORE 1 LINES';
                                break;
                            case '2':
                                loadSQL += '"\r" IGNORE 1 LINES';
                                break;
                            case '3':
                                loadSQL += '"\n\r" IGNORE 1 LINES';
                                break;
                            case '4':
                                loadSQL += '"\r\n" IGNORE 1 LINES';
                                break;
                        }
                        console.log('loadSQL = ',loadSQL);
                        connection.query(loadSQL, function (err,result){
                            if(err) {
                                console.log("LOAD DATA ERROR");
                                return;
                            }else {
                                console.log('LOAD DATA SUCCESSFULLY');
                                return;
                            }
                        })
                    }
                });
            } catch (err) {
                //callback(err);
                return;
            }
            connection.release();
        }
    });
};


// function checkExistedTable(userID,tableID) {
//     let sql = "SELECT COUNT(*) AS num FROM tableInfo WHERE userID = ? AND tableID = ?";
//         pool.getConnection(function(err, connection){
//             connection.query(sql, [userID], [tableID], function (err, result) {
//                 if (err) {
//                     console.log("getTableNumByName Error: " + err.message);
//                     return;
//                 }
//                 connection.release();
//                 console.log("get table if exist.");
//                 callback(err,result);
//             });
//         });
//         console.log("connection close.");
// }

// function dropIfExistedTable(userID,tableID) {
//     console.log("dropIfExistedTable")
//     return new Promise((resolve) =>{
//         "use strict";
//         pool.getConnection(function(err, connection) {  // 只能删除一次 //在往mysql插入表格之前，要先检查是否存在同名的表格，如果存在则删除，再创建新表
//             if (err) throw err;
//             else {
//                 connection.query("DROP TABLE IF EXISTS "+'`'+userID+"@"+tableID+'`', function(err, result) {
//                     if (err) throw err;
//                     else {
//                         console.log("check if have repeated table");
//                         resolve();
//                     }
//                     connection.release(); // 释放连接
//                 })
//             }
//         })
//     })
// }
// function createTable(userID,tableID,colName) {
//     console.log("colName ==> "+colName)
//     console.log("createTable")
//     let createSQL = "CREATE TABLE IF NOT EXISTS "+'`'+userID+"@"+tableID+'` (';
//     for (let i=0;i<colName.length;i++){
//         createSQL+='`'+colName[i]+'`';
//         createSQL+=' ';
//         createSQL+= 'VARCHAR(100)';
//         if (i!=colName.length-1){
//             createSQL+=', ';
//         }
//     }
//     createSQL+=') character set = utf8;';
//     console.log("createSQL : " + createSQL);
//     return new Promise((resolve) => {
//         pool.getConnection(function(err, connection) {
//             if (err) reject(err);
//             else {
//                 connection.query(createSQL, function(err, result) {
//                     if (err) throw err;
//                     else {
//                         resolve(result);
//                     }
//                     connection.release();
//                 })
//             }
//         })
//     });
// }
//
// function insertData(userID,tableID,colName,row) {
//     //row is an array.
//     // console.log("insertData"); // (`sessionID`, `userID`) VALUES ('1', '22')
//     let insertSQL= "INSERT INTO "+'`'+userID+"@"+tableID+'` (';
//     for (let i = 0; i< colName.length; i++){
//         insertSQL += '`'+colName[i]+'`';
//         if (i!=colName.length-1){
//             insertSQL+=', ';
//         }
//     }
//     insertSQL += ') VALUES (';
//     for (let i = 0; i< row.length; i++){
//         insertSQL += row[i];
//         if (i!=row.length-1){
//             insertSQL+=', ';
//         }
//     }
//     insertSQL += ');'
//     // console.log("insertSQL ==> ",insertSQL);
//     try{
//         pool.getConnection(function(err, connection) {
//             if (err) throw err;
//             else {
//                 connection.query(insertSQL, function(err) {
//                     if (err) throw err;
//                     else {
//                         console.log("insert successfully.")
//                         return true;
//                     }
//                 })
//             }
//         })
//     }catch (err) {
//         throw err;
//         return;
//     }
//
// }
//
// async function csv2mysql (userID,tableID){
//     // 如果存在相同的表格，则删除
//     await dropIfExistedTable(userID,tableID);
//
//     let csvPath = path.join(__dirname,'../','uploadFiles/',tableID);
//     //去除 .csv 后缀
//
//     let line = 1;
//     let colName;
//
//     // pool.getConnection(function (err,connection) {
//     //     fs.createReadStream(csvPath)
//     //         .pipe(csv())
//     //         .on("data", function(data){
//     //             "use strict";
//     //             if (line === 1 ){ // 创建表
//     //                 colName = data;
//     //                 createTable(userID,tableID,colName).then(console.log("create successfully!")).catch((err) => console.log(err));
//     //             }
//     //             if (line !== 1){ // 插入表
//     //                 insertData(userID,tableID,colName,data);
//     //             }
//     //             line++;
//     //         })
//     //         .on("end", function(){
//     //             console.log("done");
//     //         });
//     // })
//
//     var stream = fs.createReadStream(csvPath);
//
//     csv
//         .fromStream(stream)
//         .transform(function(data, next){
//             "use strict";
//             if (line === 1 ){ // 创建表
//                 colName = data;
//                 createTable(userID,tableID,colName).then(next()).catch((err) => console.log(err));
//             }
//             if (line !== 1){ // 插入表
//                 if (insertData(userID,tableID,colName,data) === true) next();
//             }
//             line++;
//         })
//         .on("data", function(data){
//             console.log(data);
//         })
//         .on("end", function(){
//             console.log("done");
//         });
//
//     console.log(csvPath)
// }


