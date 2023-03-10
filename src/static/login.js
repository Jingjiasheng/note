const validateEmail = (email) => {
    // 使用正则表达式检查邮箱格式
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const showError = (type, error_message) =>{
    if (type === "password") {
        // 将密码的placeholder设置为错误信息
        $('#password').css('color', 'red');
        $("#password").attr("placeholder", error_message);
        $("#password").val('');
        setTimeout(() => {
            $("#password").attr("placeholder", "Password");
            $('#password').css('color', '#333333');
        }, 5000)
    }else {
        // 将邮箱的placeholder设置为错误信息
        $('#email').css('color', 'red');
        $("#email").attr("placeholder", error_message);
        $("#email").val('');
        setTimeout(() => {
            $("#email").attr("placeholder", "Email");
            $('#password').css('color', '#333333');
        }, 5000)
    }
}


$(document).ready(() => {

    $('html').css('background-image', `url('http://source.unsplash.com/random/${$(window).width()}x${$(window).height()}?notebook')`);



    $('#login').click(function(){
        const email = $("#email").val();
        const password = $("#password").val();

        if (!validateEmail(email)) {
            showError("password", "您输入的邮箱有误！")
        }
        else if (!password) {
            showError("password", "密码不能为空！")
        }
        else{
            $.ajax({
                url: "/login",
                method: "POST",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({ email, password }),
                success: (res) => {
                    console.log(res);
                    switch (res.code) {
                        case 400100:{
                            showError("password", "用户不存在!")
                            break
                        }
                        case 400101:{
                            showError("password", "您的账户已经被禁用(密码错误次数过多或者账户未被启用)！")
                            break;
                        }
                        case 400102:{
                            showError("password", "您的密码有误，请重新输入(3次尝试机会)！")
                            break;
                        }
                        case 200100:{
                            showError("password", "登录成功!")
                            localStorage.setItem("token", res.token)
                            //重定向到主页上
                            window.location.href = "../index.html";
                            break;
                        }
                        default: {
                            showError("password", "系统返回奇怪的错误，请联系管理员!")
                        }
                    }
                },
                error: (xhr, status, error) => {
                    showError("password", error.message)
                }
            });
        }

    })

    // 为回车键绑定登录事件
    $(document).keyup(function(event) {
        if (event.keyCode === 13) {
            $('#login').click();
        }
    });


    $('#signup').click(() =>{
        const email = $("#email").val();
        const password = $("#password").val();

        if (!validateEmail(email)) {
            showError("password", "您输入的邮箱有误！")
        }
        else if (!password) {
            showError("password", "密码不能为空！")
        }
        else {
            $.ajax({
                url: "/signup",
                method: "POST",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({email, password}),
                success: (res) => {
                    switch (res.code) {
                        case 400100:{
                            showError("password", "用户已经存在!")
                            break
                        }
                        case 200100:{
                            showError("password", "注册成功，等待管理员启用账号！")
                            break;
                        }
                        default: {
                            showError("password", "系统返回奇怪的错误，请联系管理员!")
                        }
                    }
                },
                error: (xhr, status, error) => {
                    showError("password", error.message)
                }
            });
        }
    })
})

