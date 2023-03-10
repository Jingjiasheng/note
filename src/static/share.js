
const initData = (data) => {
    $('.modal').fadeIn();
    // 隐藏之后需要把模态框的所有的内容全部都清除掉
    $('section .section-id').val(data.id)
    $('section .section-title').val(data.title)
    $('section .section-bg').val(data.bg)
    $('section .section-desc').text(data.desc)
    $('section .section-detail').text(data.detail)
}
const getAndInitData = () => {
    $.ajax({
        url: `/share?id=${new URLSearchParams(window.location.search).get('id')}`,
        method: "GET",
        success: (res) => {
            switch (res.code) {
                case 400103:{
                    alert("该分享便签已经失效，请重新分享!");
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


    // 如果用户状态正常的话就使用token对用户的数据进行请求(并顺便对 token 的状态进行检查)
    getAndInitData();

})
