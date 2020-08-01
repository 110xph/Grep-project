var express = require('express');
var router = express.Router();
var pool = require('../mysql/dbConfig');
var myFunction = require('../routes/my-function');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
//
// router.get('/setting', function(req, res, next) {
//     res.render('setting', { title: 'DeepEye' });
// });
//
// router.get('/signup', function(req, res, next) {
//     res.render('signup', { title: 'DeepEye' });
// });
//
// router.get('/login', function(req, res, next) {
//     res.render('login', { title: 'DeepEye' });
// });
//
// router.get('/signout', function(req, res, next) {
//
// });

// 注册操作
router.get('/req_signup',function (req,res,next) {
    "use strict";
    let ip = myFunction.getUserIP(req);
    let time = new Date().toLocaleString();
    myFunction.WriteUserIP(time, ip, req.query.username,'user sign up');
    console.log(time, ip);

    console.log("sign up information:",req.query.info);
    let username =req.query.username;
    let password =req.query.password;
    let email = req.query.email;
    getUserNumByName(username,function (err,results) {
        if (results != null && results[0]['num'] > 0) {
            err = 'The username has already exited! Please try another username!';
            res.json(['fail',err]);
        }else {
            new Promise((resolve, reject) => {
                pool.getConnection(function(err, connection) {
                if (err) reject(err);
                else {
                    connection.query("INSERT INTO `userInfo`" + " (`userName`,`userPassword`,`userEmail`) VALUES ('" +username+"', '"+password+"', '"+email+ "')", function(err, result) {
                        if (err) throw err;
                        else {
                            resolve(result);
                        }
                        connection.release();
                    })
                }
            })
        }).then(res.json(['success','Sign up successfully!Now,we will go to sign in page'])).catch((err) => console.log(err)); //返回给前端浏览器的信息
        }
    })
});

//根据用户名得到用户数量
function getUserNumByName(username,callback) {
    "use strict";
    let getUserNumByName_Sql = "SELECT COUNT(*) AS num FROM userInfo WHERE username = ?";
    pool.getConnection(function(err, connection){
        connection.query(getUserNumByName_Sql, [username], function (err, result) {
            if (err) {
                console.log("getUserNumByName Error: " + err.message);
                return;
            }
            connection.release();
            console.log("username: ",username);
            callback(err,result);
        });
    })
}

// 登陆操作
router.get('/req_signin',function (req,res,next) {
    "use strict";
    let ip = myFunction.getUserIP(req);
    let time = new Date().toLocaleString();
    myFunction.WriteUserIP(time, ip, req.query.username, 'user sign in');
    console.log(time, ip);

    console.log("sign in information:",req.query.info);
    let username = req.query.username;
    let password = req.query.password;
    getUserByUserName(username,function (err,results) {
        if(results == '')
        {
            res.json(['fail',"The username doesn't exits!"]);
            return;
        }
        else if(results[0].userName != username || results[0].userPassword != password)
        {
            res.json(['fail',"The username or password is wrong,Please check it and try again!"]);
            return;
        }
        else
        {
            // update sign in `session`;
            res.locals.username = username;
            req.session.user = res.locals.username;

            // new Promise((resolve, reject) => {
            //     pool.getConnection(function(err, connection) {
            //         if (err) reject(err);
            //         else {
            //             connection.query("INSERT INTO `session`" + " (`sessionID`,`userID`) VALUES ('" +req.session.user+"', '"+username+"')", function(err, result) {
            //                 if (err) throw err;
            //                 else {
            //                     resolve(result);
            //                 }
            //                 connection.release();
            //             })
            //         }
            //     })
            // }).then(res.json(['success','Sign in successfully!',username])).catch((err) => console.log(err)); //返回给前端浏览器的信息

            res.json(['success','Sign in successfully!',username])
        }
    })
});


router.get('/req_username',function (req,res,next) {
    console.log("req_username infomation:",req.query.info);
    console.log("res info:",req.session.user);
    if (req.session.user)  res.json(['success','get username successfully!',req.session.user]);
    else res.json(['failed','Fail to get username!']);
});


//根据用户名得到用户信息
function getUserByUserName(username, callback) {
    "use strict";
    let getUserByUserName_Sql = "SELECT * FROM userInfo WHERE username = ?";
    pool.getConnection(function(err, connection){
        connection.query(getUserByUserName_Sql, [username], function (err, result) {
            if (err) {
                console.log("getUserByUserName Error: " + err.message);
                return;
            }
            console.log(result);
            connection.release();
            callback(err,result);
        });
    })
}

// 退出登陆操作
router.get('/req_signout',function (req,res,next) {
    req.session.destroy();
    res.json(['success','Sign out successfully!']);
    // new Promise((resolve, reject) => {
    //     pool.getConnection(function(err, connection) {
    //         if (err) reject(err);
    //         else {//DELETE FROM `DeepEye`.`session` WHERE `sessionID`='3';
    //             connection.query("DELETE FROM `session` WHERE `sessionID`= ?" [req.session.user], function(err, result) {
    //                 if (err) throw err;
    //                 else {
    //                     resolve(result);
    //                 }
    //                 connection.release();
    //             })
    //         }
    //     })
    // }).then(
    //     req.session.destroy(),
    //     res.json(['success','Sign out successfully!'])
    // ).catch((err) => console.log(err)); //返回给前端浏览器的信息
});

module.exports = router;
