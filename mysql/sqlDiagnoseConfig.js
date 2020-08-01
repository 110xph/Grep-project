/**
 * Created by luoyuyu on 2017/12/17.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    host :'localhost',
    user :'sunji',
    database:'tpcc',
    password:'sunji',
    dateStrings: 'date'  //避免node-mysql 将mysql的date类型转成js-objects.date();
});
module.exports=pool;
