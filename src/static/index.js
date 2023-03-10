
// 全局数据存储
const d =  new Map();
// 全局右键id存储
let contextmenu_id;

const initData = (data) => {

    // 需要将内部的子元素全部移除
    $(".data-item").removeClass(".data-item").remove();

    for (let i = 0; i < data.length; i++) {
        d.set(data[i].id, data[i])
        let id = data[i].id;
        let title = data[i].title;
        let desc = data[i].desc;
        let detail = data[i].detail;
        let bg = data[i].bg;
        let item = `
            <div class='item data-item' id='data-item${id}' style=\"background-image: url('${bg}');\">
                <label class='zhanwei' id='zhanwei${id}'> </label>  
                <div class='dibu'>
                    <h2 class='title'>${title}</h2> 
                    <p class='desc'>${desc ?? "暂时没有该便笺的介绍:)"}</p>
                </div>
                <p class='detail' id='${id}'>${detail ?? "该便笺尚未添加内容:)"} </p>
            </div>`
        $('.masonry').append(item)
        // 尝试在这个地方设置高度
        $('#zhanwei'+id).height(calculateHeight(detail, 14, $('.zhanwei').width() + 16))

    }
}

const getAndInitData = () => {
    $.ajax({
        url: "/data",
        method: "GET",
        // data: { token },
        headers: {"token":localStorage.getItem("token")},
        success: (res) => {
            switch (res.code) {
                case 400100:{
                    //重定向到主页上
                    window.location.href = "/login.html";
                    break
                }
                case 200100: {
                    initData(res.data)
                    break;
                }
                default: {
                    alert("获取用户数据异常！")
                }
            }
        },
        error: (xhr, status, error) => {
            alert(error.message)
        }
    });
}

$(document).ready(() => {
    // 根据客户端更新背景图
    $('html').css('background-image', `url('http://source.unsplash.com/random/${$(window).width()}x${$(window).height()}?paper')`);


    const token = localStorage.getItem("token");
    // 判断用户的 token 是否存在，如果不存在就重定向到登录的页面上
    if (!token) {
        //重定向到主页上
        window.location.href = "/login.html";
    }

    // 如果用户状态正常的话就使用token对用户的数据进行请求(并顺便对 token 的状态进行检查)
    getAndInitData();


    // 给编辑状态添加开关
    $('.section-title').on("dblclick", () => {
        $('.section-title').prop("readonly", !$('.section-title').prop("readonly"));
    });
    $('.section-bg').on("dblclick", () => {
        $('.section-bg').prop("readonly", !$('.section-bg').prop("readonly"));
    });
    $('.section-desc').on("dblclick", () => {
        $('.section-desc').prop("readonly", !$('.section-desc').prop("readonly"));
    });
    $('.section-detail').on("dblclick", () => {
        $('.section-detail').prop("readonly", !$('.section-detail').prop("readonly"));
    });
    // 绑定ESC关闭模态框
    $(document).keydown((event) => {
        if (event.keyCode === 27) {
            // 将修改后的数据保存到数据库
            // 如果标题存在内容就进行修改并保存
            $('section .section-title').val() &&
            $.ajax({
                url: '/data',
                method: "POST",
                headers: {"token":localStorage.getItem("token")},
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    id: $('.section-id').val(),
                    title: $('.section-title').val(),
                    bg: $('.section-bg').val(),
                    desc: $('.section-desc').val(),
                    detail: $('.section-detail').val(),
                }),
                success: (res) => {
                    // 如果id存在的话就不动，如果不存在的话就设置回去
                    $('.section-id').val() ?$('.section-id').val() : res.id
                }
            });


            $('.modal').hide();
            // 隐藏之后需要把模态框的所有的内容全部都清除掉
            $('section .section-id').val('')
            $('section .section-title').val('')
            $('section .section-bg').val('')
            $('section .section-desc').text('')
            $('section .section-detail').text('')
        }
        // 除了关闭模态框还需要重新获取数据
        getAndInitData();
    });
})


$(document).on('dblclick', '.detail', function() {
    const id = $(this).attr('id');
    $('.modal').fadeIn();
    // 给模态框的每一部分加上具体的数据
    id && (
        $('section .section-id').val(id),
        $('section .section-title').val(d.get(id).title),
        $('section .section-bg').val(d.get(id).bg),
        $('section .section-desc').text(d.get(id).desc),
        $('section .section-detail').text(d.get(id).detail)
    )



});

// 实现新建便笺功能
$('.add-item').dblclick(() => {
    $('.modal').fadeIn();
    $('.modal img').animate({
        width: "+=20%",
        height: "+=20%",
        show: true,
    }, 200);
    // 给模态框的每一部分加上具体的数据
    $('section .section-id').val(''),
    $('section .section-title').val('')
    $('section .section-bg').val('http://source.unsplash.com/random/400x600?tint')
    $('section .section-desc').text('')
    $('section .section-detail').text('')
})



function calculateHeight(text, fontSize, width) {
    // 创建一个临时元素来测量高度
    const tempEl = document.createElement('p');

    // 设置样式和文本内容
    tempEl.style.fontSize = `${fontSize}px`;
    tempEl.style.width = `${width}px`;
    tempEl.textContent = text;

    // 将元素插入到DOM中，以便可以读取其高度
    document.body.appendChild(tempEl);

    // 获取元素的高度（包括内边距和边框）
    const height = tempEl.offsetHeight;

    // 将元素从DOM中移除
    document.body.removeChild(tempEl);

    // 返回计算得到的高度
    return height;
}

// 捕获鼠标右击的操作
$(document).on('contextmenu', function(event) {

    contextmenu_id = $(event.target).attr('id');

    var contextMenu =$('.context-menu');

    event.preventDefault();

    // 获取鼠标位置
    var x = event.clientX;
    var y = event.clientY;

    $('#note-delete').prop("hidden", false);
    $('#note-edit').prop("hidden", false);
    $('#note-share').prop("hidden", false);
    $('#note-copy').prop("hidden", false);

    // 设置菜单位置
    !contextmenu_id && (
        $('#note-delete').prop("hidden", true),
        $('#note-edit').prop("hidden", true),
        $('#note-share').prop("hidden", true),
        $('#note-copy').prop("hidden", true)
    );
    contextMenu.css("display", "block")
    contextMenu.css("left", x + 'px')
    contextMenu.css("top", y + 'px')
});

document.addEventListener('click', function (event) {
    // $('.context-menu').style.display = 'none';
    $('.context-menu').css("display", "none")
    contextmenu_id = undefined;
});

// 给鼠标右键菜单绑定点击事件

// 删除便笺
$('#note-delete').click(() => {
    contextmenu_id && (
        $.ajax({
            url: '/data/delete',
            method: "POST",
            headers: {"token":localStorage.getItem("token")},
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: contextmenu_id,
            }),
            success: (res) => {
                // 处理响应数据
                console.log(res.code)
                console.log("保存成功")
                // 重新加载全局的数据
                getAndInitData();
            }
        })
    )
})


// 编辑此便笺
$('#note-edit').click(() => {
    $('#'+ contextmenu_id).trigger('dblclick');
})

// 分享此便笺
$('#note-share').click(() => {
    $.ajax({
        url: '/data/share',
        method: "POST",
        headers: {"token":localStorage.getItem("token")},
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            id: contextmenu_id,
        }),
        success: (res) => {
            if (res.code === 200100) {
                var currentPath = window.location.href;
                var parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                // 选择要复制的文本
                var textToCopy = parentPath + "/share.html?id=" + res.id;
                // 创建临时输入框
                var tempInput = $("<input>");
                // 将输入框添加到文档中
                $("body").append(tempInput);
                // 设置输入框的值为要复制的文本
                tempInput.val(textToCopy).select();
                // 复制文本到剪贴板
                document.execCommand("copy");
                // 删除临时输入框
                tempInput.remove();

                alert("分享链接已经复制到粘贴板!")
            }
            else{
                alert("分享链接时发生未知错误!")
            }
        }
    })
})

// 复制此便笺
$('#note-copy').click(() => {

    // 选择要复制的文本
    var textToCopy = d.get(contextmenu_id).detail;

    // 创建临时输入框
    var tempInput = $("<input>");

    // 将输入框添加到文档中
    $("body").append(tempInput);

    // 设置输入框的值为要复制的文本
    tempInput.val(textToCopy).select();

    // 复制文本到剪贴板
    document.execCommand("copy");

    // 删除临时输入框
    tempInput.remove();
})

// 退出登录
$('#logout').click(() => {
    localStorage.removeItem("token");
    getAndInitData();
})
