//登出功能
function zx() {
        $.ajax({
            type:'post',
            url:'/logout',
            success:function (data) {
                window.location.href='/login'
            }
        })
}
