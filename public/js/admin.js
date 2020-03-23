$(function () {
    $('.layuiadmin-span-color i').on({
        mouseenter:function () {
            let position=$(this).attr('id');
            tips=layer.tips('点我查看详情', '#'+position,{tips:[1,"black"]});
        },
        mouseout:function () {
            layer.close(tips)
        },
    });

    function tips_Events(){

        $('.layui-nav-tree li>a').on({
            // setTimeout:function
            mouseenter:function () {
                let test=$(this).attr('name');
                let position=$(this).attr('id')
                tips=layer.tips(test, '#'+position,{tips:[2,"black"]});
            },
            mouseout:function () {
                layer.close(tips)
            },
            click:function () {
                $('#LAY_app').removeClass('layadmin-side-shrink')
                $('.layui-nav-tree li>a').off('mouseenter');//解绑鼠标划入事件
            }
        });
    }

    //侧边栏伸缩
    $('#LAY_app_flexible').on('click', function () {
        let a = $('#LAY_app').attr('class');
        if (a == undefined || a == '') {
            tips_Events();
            $('#LAY_app').addClass('layadmin-side-shrink')
            $('#LAY_app_flexible').addClass('layui-icon-spread-left')
        } else {
            $('.layui-nav-tree li>a').off('mouseenter');//解绑鼠标划入事件
            $('#LAY_app').removeClass('layadmin-side-shrink')
            $('#LAY_app_flexible').removeClass('layui-icon-spread-left')
        }
    })

    //    页面刷新按钮
    $('.layui-icon-refresh-3').click(function () {
        window.location.reload()
    })

})
