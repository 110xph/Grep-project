/**
 * Created by luoyuyu on 2017/9/25.
 */


$("#openSignInModal").click(function () {
    $('#signUpModal').modal({backdrop: 'static', keyboard: false}, 'show');
});

$("#signUpBtn").click(function () {
    $('#signUpModal').modal({backdrop: 'static', keyboard: false}, 'show');
});

$("#signup").click(function () {
    sign_up();
});
$("#signInBtn").click(function () {
    $('#signInModal').modal({backdrop: 'static', keyboard: false}, 'show');
});
$("#signin").click(function () {
    sign_in();
});



//一些其他和注册相关的函数，比如检查邮件地址是否正确等等
function validateEmail(email) {
    "use strict";
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function sign_up() {
    "use strict";
    //获取form中的注册信息
    let username = $("#signUp_username").val().toString();
    let password = $("#signUp_password").val().toString();
    let password1 = $("#password1").val().toString();
    let email = $("#email_address").val().toString();
    // 对form中的相关信息进行判断，发现问题后，返回给客户端
    if (username == ''){
        document.getElementById("signupDiv").style.display = "block";
        document.getElementById("signupDiv").innerHTML = `<strong>Please input your username!</strong>`;
        setTimeout(function () {
            document.getElementById("signupDiv").style.display = "none";
        }, 2000);
    }
    else if(password == '' || password1 ==''){
        document.getElementById("signupDiv").style.display = "block";
        document.getElementById("signupDiv").innerHTML = `<strong>Please input your password!</strong>`;
        setTimeout(function () {
            document.getElementById("signupDiv").style.display = "none";
        }, 2000);
    }
    else if (password!=password1){
        document.getElementById("signupDiv").style.display = "block";
        document.getElementById("signupDiv").innerHTML = `<strong>Please confirm that the two passwords are consistent!</strong>`;
        setTimeout(function () {
            document.getElementById("signupDiv").style.display = "none";
        }, 2000);
    }
    else if (!validateEmail(email)){
        document.getElementById("signupDiv").style.display = "block";
        document.getElementById("signupDiv").innerHTML = `<strong>Please check the email address if correct!</strong>`;
        setTimeout(function () {
            document.getElementById("signupDiv").style.display = "none";
        }, 2000);
    }
    else {  // 对form中的相关信息进行判断无误之后发送注册请求给服务器
        $.ajax({
            url: '/users/req_signup',
            type: 'GET',
            data: {
                info :"sign up",
                username:username,
                password:password,
                email :email
            },
            dataType: 'json',
            success: function(data){
                //返回注册成功信息。do something... ...
                if (data[0] == 'success'){
                    document.getElementById("signupDiv").className = "alert alert-success";
                    document.getElementById("signupDiv").style.display = "block";
                    document.getElementById("signupDiv").innerHTML = `<strong>${data[1]}</strong>`;
                    // location.href='/users/login';
                    setTimeout(function () {
                        $('#signUpModal').modal('hide');
                        setTimeout(function () {
                            $('#signInModal').modal({backdrop: 'static', keyboard: false}, 'show');
                        },500)
                    },1000)
                }
                else {
                    document.getElementById("signupDiv").style.display = "block";
                    document.getElementById("signupDiv").innerHTML = `<strong>${data[1]}</strong>`;
                    setTimeout(function () {
                        document.getElementById("signupDiv").style.display = "none";
                    }, 2000);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Something Wrong")
            }
        });
    }
}

function sign_in() {
    "use strict";
    //获取form中的注册信息
    let username = $("#signIn_username").val().toString();
    let password = $("#signIn_password").val().toString();
    // 对form中的相关信息进行判断，发现问题后，返回给客户端
    // alert("Please input the username!");
    // alert("Please input the password!");
    // console.log(username+password)
    if (username == ''){
        document.getElementById("signinDiv").className = "alert alert-danger";
        document.getElementById("signinDiv").style.display = "block";
        document.getElementById("signinDiv").innerHTML = `<strong>Please input your username!</strong>`;
        setTimeout(function () {
            document.getElementById("signinDiv").style.display = "none";
        }, 2000);
    }
    else if(password == '' ){
        document.getElementById("signinDiv").className = "alert alert-danger";
        document.getElementById("signinDiv").style.display = "block";
        document.getElementById("signinDiv").innerHTML = `<strong>Please input your password!</strong>`;
        setTimeout(function () {
            document.getElementById("signinDiv").style.display = "none";
        }, 2000);
    }
    else {  // 对form中的相关信息进行判断无误之后发送注册请求给服务器
        $.ajax({
            url: '/users/req_signin',
            type: 'GET',
            data: {
                info :"sign in",
                username:username,
                password:password,
            },
            dataType: 'json',
            success: function(data){
                //返回登陆成功信息。do something... ...
                // console.log("返回登陆成功信息。do something... ...");
                if (data[0] == 'success'){
                    document.getElementById("signinDiv").className = "alert alert-success";
                    document.getElementById("signinDiv").style.display = "block";
                    document.getElementById("signinDiv").innerHTML = `<strong>${data[1]}</strong>`;
                    username = data[2];
                    location.href='/'
                }
                else {
                    document.getElementById("signinDiv").className = "alert alert-danger";
                    document.getElementById("signinDiv").style.display = "block";
                    document.getElementById("signinDiv").innerHTML = `<strong>${data[1]}</strong>`;
                    setTimeout(function () {
                        document.getElementById("signinDiv").style.display = "none";
                    }, 2000);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("something wrong!")
            }
        });
    }
}

function sign_inByForm() {
    "use strict";
    //获取form中的注册信息
    let username = $("#username").val().toString();
    let password = $("#password").val().toString();
    // 对form中的相关信息进行判断，发现问题后，返回给客户端
    // alert("Please input the username!");
    // alert("Please input the password!");
    if (username == ''){
       alert("Please input your username!");
    }
    else if(password == '' ){
        alert("Please input your password!");
    }
    else {  // 对form中的相关信息进行判断无误之后发送注册请求给服务器
        $.ajax({
            url: '/users/req_signin',
            type: 'GET',
            data: {
                info :"sign in",
                username:username,
                password:password,
            },
            dataType: 'json',
            success: function(data){
                //返回登陆成功信息。do something... ...
                // console.log("返回登陆成功信息。do something... ...");
                if (data[0] == 'success'){
                    location.href='/data';
                }
                else {
                   alert(data[1]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("something wrong (network error)!")
            }
        });
    }
}

function req_username() {
    //获取form中的注册信息
    $.ajax({
        url: 'users/req_username',
        type: 'GET',
        data: {
            info: "req_username"
        },
        dataType: 'json',
        success: function (data) {
            //返回登陆成功信息。do something... ...
            // console.log("返回登陆成功信息。do something... ...");
            if (data[0] == 'success') {
                console.log("给User字段赋值，显示当前登陆的用户名：", data[2]);
                username = data[2];
                $("#username").html(`<span></span> ${data[2]}`);
            }
            else {
                // alert("Something Wrong",data[1],"error");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Something Wrong","Please check and try again!","error")
        }
    })
}
