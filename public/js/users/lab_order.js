
$(function () {

    /*数组去重*/
    function unique(arr) {
        return Array.from(new Set(arr))
    }



    /*select 下拉框二级联动*/
    layui.use('form', function () {
        var form = layui.form;
        let height = window.screen.height;
        if (height > 1000) {
            $('.middle_box').css({
                'height': '590px'
            });
            // loadMap()
        }
        var extent = [88924.29172662047, 53457.67356711067,
            155087.49948652176, 67718.22717600768];
        var mapLayer = ['classroom:011_005_F01L'];
        loadMap(extent, mapLayer, 2);

        layui.use('element', function () {
            var element = layui.element;
        });
        //地图工具栏绑定事件
        $("#mapTools li:eq(0)").on('click', zoominMap);
        $("#mapTools li:eq(1)").on('click', zoomoutMap);
        $("#mapTools li:eq(2)").on('click', function () {
            var elem = document.getElementById("map");
            requestFullScreen(elem);
        });
        $("#mapTools li:eq(3)").on('click', moveToCenter);
        $("#mapTools li:eq(4)").on('click', print);
        // $("#mapTools li:eq(5)").on('click', back_berfore);


        function zoominMap() {

            // $("#mapTools li:eq(5)").css('display','block')
            let view = map.getView();
            let zoom = view.getZoom();
            view.setZoom(zoom + 1);
            if (zoom == 3) {
                layer.msg('放大至最大级别', { time: 800 });
            }
        }

        function zoomoutMap() {
            let view = map.getView();
            let zoom = view.getZoom();
            view.setZoom(zoom - 1);
            // console.log(zoom)
            if (zoom == 1) {
                layer.msg('缩放至最小级别', { time: 800 });
            }
        }


        function moveToCenter() {
            var mapExtent = map.getView().calculateExtent(map.getSize());
            // console.log(mapExtent)
            // var extent = ol.extent.boundingExtent(feature.getGeometry().getCoordinates()[0]); //获取一个坐标数组的边界，格式为[minx,miny,maxx,maxy]
            var center = ol.extent.getCenter(mapExtent);   //获取边界区域的中心位置
            var projection = map.getView().getProjection().getCode();
            // console.log(projection);
            // console.log(center)
            // map.getView().setCenter(center);  //设置当前地图的显示中心位置
            map.getView().setCenter(ol.proj.transform(center, 'EPSG:4326', 'EPSG:4547'));
        }


        function print() {
            map.once('postcompose', function (event) {
                let canvas = event.context.canvas;
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
                } else {
                    canvas.toBlob(function (blob) {
                        saveAs(blob, 'map.png');
                    });

                }
            });
            map.renderSync();
        }




        //地图全屏
        function requestFullScreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            //FireFox
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            //Chrome等
            else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            }
            //IE11
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };


        let iconOverlayers = [];
        let detailOverlayers = [];


        //创建地图icon图标
        function creatIconTip(id, type, Rname, cb) {
            console.log(type)

            let tip = document.createElement('div');
            $(tip).html($('#modelSimpleTip').html()).addClass('modelSimpleTip');
            if (type === '环境工程') {
                $(tip).find('img').attr('src', '/images/环境实验室.png').css({
                    'width': '17px',
                    'height': '17px'
                });
            } else if (type === '矿物加工') {
                $(tip).find('img').attr('src', '/images/矿加实验室.png').css({
                    'width': '17px',
                    'height': '17px'
                });
            }
            if (id) $(tip).attr('id', id);
            // 标签的关闭按钮
            $(tip).find('.close').click(function () {
                $(tip).hide();
            });
            $(tip).find('.center').click(function () {
                $(tip).hide();
            });
            cb(tip)
        }

        function loadIconTip(id, coordinate, type, Rname) {
            creatIconTip(id, type, Rname, function (tip) {
                $(tip).click(function () {
                    // let allAttrs = $(tip).attr('id').split('_');
                    let local = {};
                    loadDetailTip(local, coordinate, id, Rname);
                });
                let overlay = new ol.Overlay(({
                    element: tip,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250 //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度.
                    },
                }));
                iconOverlayers.push(overlay);
                overlay.setPosition(coordinate);
                map.addOverlay(overlay);
            })
        }

        var tipIndex = 100;
        var lastTip = null;

        // 设备信息加载
        function device_show(room_id, Rname) {
            $('#Fname').show()
            $('.layui-table-view').show()
            $('#Fname').html(room_id + '——' + Rname)
            layui.use('table', function () {
                var table = layui.table;
                table.render({
                    //默认为get请求
                    elem: '#deviceView'
                    , url: '/device_manage'
                    , cellMinWidth: 120 //全局定义常规单元格的最小宽度，layui 2.2.1 新增
                    , id: 'testReload'
                    , page: true
                    , limits: [5, 10, 15]
                    , limit: 5
                    , toolbar: '#toolbarDemo'
                    , cols: [[
                        { field: 'device_ID', title: '设备编号', sort: true }
                        , { field: 'device_name', title: '设备名称', sort: true }
                        , { field: 'device_number', title: '数量' }
                        , { field: 'device_singlePrice', title: '单价' }
                        // , { field: 'document_No', title: '单据号' }
                        // , { field: 'user', title: '使用者' }
                        , { field: 'device_model', title: '型号/品牌' }
                        // , { field: 'FID', title: '存放地' }
                        // , { field: 'batch_No', title: '批量编号' }
                        // , { field: 'use_unit', title: '使用单位' }
                    ]]
                    , where: {
                        lab_number: room_id
                    }
                });
                //监听头工具栏事件
                table.on('toolbar(test)', function (obj) {
                    console.log(id)
                    switch (obj.event) {
                        case 'view':
                            // layer.msg('添加');
                            layer.open({
                                content: '/device_info',
                                type: 2,
                                title: '设备详情',
                                area: ['80%', '60%'],
                                btn: ['退出'],    // 自定义设置多个按钮
                                success: function (layero, index) {
                                    var iframe = window['layui-layer-iframe' + index];
                                    let FID = id
                                    iframe.getFID(FID)   //父页面向子页面传值 getFID()为全局函数

                                },
                                btnAlign: 'c',// 设置按钮位置
                            });
                            break;
                    }
                });
            });
        }
        function device_hide() {
            $('#Fname').hide()
            $('.layui-table-view').hide()
        }



        // tab 信息展示
        function tab_show(room_id) {
            $('#tab_3').addClass('layui-this')
            $('#tab_2').removeClass('layui-this')
            $('#info_2').removeClass('layui-show')
            $('#info_3').addClass('layui-show')
            $.ajax({
                type: 'get',
                url: '/room/lab',
                data: {
                    room_id: room_id
                },
                success: function (data) {
                    $('#room_id').text(data[0].FID);
                    $('#room_area').text(data[0].room_area + 'm²');
                    $('#room_gate').text(data[0].room_gate + '扇');
                    $('#room_master').text(data[0].room_master);
                    $('#room_name').text(data[0].Rname);
                    $('#room_window').text(data[0].room_window + '扇');
                },
            });


        }





        function createDetailTip(local = {}, cb, id, Rname) {
            //    给出房间的id
            //    根据id得到信息
            //    建立新的div
            var tip = document.createElement('div');
            if ($(lastTip).parent().length > 0 && $(lastTip).attr('id') === 'tip_' + id) {
                lastTip.remove();
                tip = null;
                lastTip = null;
                return
            } else if (lastTip) {
                lastTip.remove();
            }
            lastTip = tip;
            // var tipInfo = null; // tip信息面板里的内容
            var modelTip = $('#modelTip').html();
            $(tip).html(modelTip).addClass('modelTip');
            $(tip).css('z-index', tipIndex);
            tipIndex++;
            if (id) $(tip).attr('id', 'tip_' + id);

            $(tip).find('.close').click(function () {
                $(tip).remove();
            });
            // 标签的跳转按钮
            $(tip).find('.openToNext').click(function () {
                // 点击icon 跳转到指定房间。
                $.ajax({
                    type: 'get',
                    url: '/room/lab',
                    data: {
                        room_id: id
                    },
                    success: function (data) {
                        $('#room_id').text(data[0].FID);
                        $('#room_area').text(data[0].room_area + 'm²');
                        $('#room_gate').text(data[0].room_gate + '扇');
                        $('#room_master').text(data[0].room_master);
                        $('#room_name').text(data[0].Rname);
                        $('#room_window').text(data[0].room_window + '扇');
                        item = JSON.parse(data[0].extent);
                        if (item != null) {
                            extent = [item.minX, item.minY, item.maxX, item.maxY];
                            mapLayer = [data[0].layer]
                            loadMap(extent, mapLayer, 1);
                        } else {
                            layer.msg('当前房间暂无平面图信息')

                        }
                    },
                });
                $('#back_before').show() //返回按钮
            });

            device_show(id, Rname)
            tab_show(id)


            let roomDev = {};
            var opt = {
                '试剂总数:': '0',
                '设备总数:': '',
                '实验室编号': id,
                '负责人:': '尹东',
            };
            opt = Object.assign(opt, roomDev);
            $(tip).find('label').html('实验室');
            $(tip).find('table').html(createTr(opt));
            $(tip).css('transform', ` translate(-95px,-165px)`);//偏移量
            if (cb) cb(tip)
        }


        function loadDetailTip(local = {}, coordinate, id, type, Rname) {
            createDetailTip(local, function (tip) {
                if (!tip) return;
                let overlay = new ol.Overlay( /** @type {olx.OverlayOptions} */({
                    element: tip,
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250 //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度.
                    }
                }));
                detailOverlayers.push(overlay);
                overlay.setPosition(coordinate);
                map.addOverlay(overlay);
            }, id, type, Rname)
        }

        //创建tip信息栏的表格内容
        function createTr(content = {}) {
            var tr = '';
            for (let att in content) {
                tr += `<tr><th title=${att} class="longrow">${att}</th><td title=${content[att]}>${content[att]}</td></tr>`
            }
            return tr;
        }

        //防止重复叠加icon图层
        function removeOverlays() {
            if (detailOverlayers.length !== 0) {
                detailOverlayers.forEach(layer => {
                    map.removeLayer(layer);
                })
            }
            detailOverlayers = [];
            // 注意使用removeOverlay，而不是removeLayer，否则不能成功移除图层
            if (iconOverlayers.length !== 0) {
                iconOverlayers.forEach(layer => {
                    map.removeOverlay(layer);
                })
            }
            iconOverlayers = [];
        }


        function loadMap(extent, mapLayer, zoom) {
            $('#map').empty();

            /**
             * 定义矢量图层
             * 其中style是矢量图层的显示样式
             */
            var style = new ol.style.Style({
                fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
                    color: 'rgba(255, 255, 255, 0.6)'
                }),
                stroke: new ol.style.Stroke({ //边界样式
                    color: '#319FD3',
                    width: 1
                }),
                text: new ol.style.Text({ //文本样式
                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 3
                    })
                })
            });
            var untiled = new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    ratio: 1,
                    crossOrigin: 'anonymous', //解决shp地图跨域问题
                    dataType: "jsonp",
                    // url: 'http://localhost:8080/geoserver/classroom/wms',
                    url: 'http://10.160.24.9:8080/geoserver/classroom/wms',
                    params: {
                        'VERSION': '1.1.3',
                        "LAYERS": mapLayer,
                    }
                }),
                style: function (feature, resolution) {
                    style.getText().setText(resolution < 50000 ? feature.get('name') : '');  //当放大到1:5000分辨率时，显示国家名字
                    return [style];
                }
            });
            var projection = new ol.proj.Projection({
                code: 'EPSG:4547',
                units: 'm',
                // axisOrientation: 'neu',
                global: false,
                extent: extent,
            });
            map = new ol.Map({
                target: 'map',
                layers: [
                    untiled,
                ],
                view: new ol.View({
                    center: ol.extent.getCenter(extent),
                    zoom: zoom,
                    //控制地图缩放级别
                    minZoom: 1,
                    maxZoom: 3,
                    projection: projection,
                })
            });



            // 监听singleclick事件
            map.on('singleclick', function (e) {
                // console.log(e.coordinate); //用于获取地图的中心点
                // alert(ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'));
                // // 通过getEventCoordinate方法获取地理位置，再转换为wgs84坐标，并弹出对话框显示
                // alert(map.getEventCoordinate(e.originalEvent));
                // alert(ol.proj.transform(map.getEventCoordinate(e.originalEvent), 'EPSG:3857', 'EPSG:4326'));

                // var lonlat = map.getCoordinateFromPixel(e.pixel);
                // alert(lonlat);
                // alert(ol.proj.transform(lonlat, "EPSG:3857", "EPSG:4326")); //由3857坐标系转为4326
            })
        }







        $('#back_before').on('click', function () {
            $('#tab_2').addClass('layui-this')
            $('#tab_1').removeClass('layui-this')
            $('#tab_3').removeClass('layui-this')
            $('#info_1').removeClass('layui-show')
            $('#info_2').addClass('layui-show')
            $('#info_3').removeClass('layui-show')
            device_hide()




            var options = $("#select_floor option:selected");
            var floor_id = options.val()
            if (floor_id == '0' || floor_id == '请选择楼层') {
                $('#back_before').hide()
            } else {
                $('#back_before').hide()

                // 放在加载icon之前，否则会把加载的icon 覆盖掉
                $.ajax({
                    type: 'get',
                    url: '/room/building',
                    data: {
                        floor_id: floor_id
                    },
                    success: function (data) {
                        item = JSON.parse(data[0].extent);
                        var zoom
                        if (data[0].building_id == '1001') {
                            zoom = 2
                        } else {
                            zoom = 1.2
                        }
                        extent = [item.minX, item.minY, item.maxX, item.maxY];
                        mapLayer = [data[0].layer]
                        loadMap(extent, mapLayer, zoom);
                    }
                })

                $.ajax({
                    type: 'get',
                    url: '/room/lab_room',
                    data: {
                        floor_id: floor_id
                    },
                    success: function (data) {
                        removeOverlays();
                        data.forEach(item => {
                            if (item.FID !== null && item.centerX !== null) {
                                loadIconTip(`${item.FID}`, [item.centerX, item.centerY], `${item.type}`, `${item.Rname}`);
                            }
                        });
                        $("#select_lab").html("");
                        document.getElementById('select_lab').options.add(new Option('请选择房间'));
                        $.each(data, function (key, val) {
                            var option1 = $("<option>").val(val.FID).text(val.FID += '(' + val.Rname + ')');
                            $("#select_lab").append(option1);
                            form.render('select');
                        });
                    },
                });
            }
        })



        //监听提交

        form.on('select(building_select)', function (data) {
            $('#back_before').hide()
            device_hide()

            $('#tab_1').addClass('layui-this')
            $('#tab_2').removeClass('layui-this')
            $('#tab_3').removeClass('layui-this')
            $('#info_1').addClass('layui-show')
            $('#info_2').removeClass('layui-show')
            $('#info_3').removeClass('layui-show')



            if (data.value === '0') {
                $("#select_floor").html("");
                $("#select_lab").html("");
                document.getElementById('select_floor').options.add(new Option('请选择楼层'));
                document.getElementById('select_lab').options.add(new Option('请选择房间'));
                form.render('select');
            }
            if (data.value === '1002') {
                var extent = [-38483.747238000054, 3179.4300682550383, 3516.2527981038515, 41179.430080560116];
                var mapLayer = ['classroom:J4_F02_LCM_Poly'];
                loadMap(extent, mapLayer, 1.2);
                $.ajax({
                    type: 'get',
                    url: '/room/count_building',
                    data: {
                        building_id: data.value
                    },
                    success: function (json) {
                        $('#building_id').text(data.value);
                        $('#building_name').text('教四楼');
                        $('#floor_number').text('2层');
                        $('#room_number').text(json[0].totalRoom + '间');
                        $('#room_total_area').text(json[0].totalArea + 'm²');
                        $('#floor_area').text(json[0].totalArea + 200 + 'm²');
                    },
                });
            } else if (data.value === '1001') {
                var extents = [88924.29172662047, 53457.67356711067,
                    155087.49948652176, 67718.22717600768];
                var mapLayers = ['classroom:011_005_F01L'];
                loadMap(extents, mapLayers, 2);
                $.ajax({
                    type: 'get',
                    url: '/room/count_building',
                    data: {
                        building_id: data.value
                    },
                    success: function (json) {
                        $('#building_id').text(data.value);
                        $('#building_name').text('教五楼');
                        $('#floor_number').text('5层');
                        $('#room_number').text(json[0].totalRoom + '间');
                        $('#room_total_area').text(json[0].totalArea + 'm²');
                        $('#floor_area').text(json[0].totalArea + 200 + 'm²');
                    },
                });
            }
            $.ajax({
                type: 'get',
                url: '/room/lab_floor',
                data: {
                    building_id: data.value
                },
                success: function (data) {
                    $("#select_floor").html("");
                    $("#select_lab").html("");
                    document.getElementById('select_floor').options.add(new Option('请选择楼层'));
                    document.getElementById('select_lab').options.add(new Option('请选择房间'));
                    $.each(data, function (key, val) {
                        var option1 = $("<option>").val(val.floor_id).text(val.floor_name);
                        $("#select_floor").append(option1);
                        form.render('select');
                    });
                },
            });
        });
        var extent = []
        var mapLayer = []

        form.on('select(floor_select)', function (data) {



            $('#back_before').hide()
            device_hide()
            select_text = data.elem[data.elem.selectedIndex].text
            //tab 切换
            // $('#tab_info li:eq(1)').addClass('layui_this')
            $('#tab_2').addClass('layui-this')
            $('#tab_1').removeClass('layui-this')
            $('#tab_3').removeClass('layui-this')
            $('#info_1').removeClass('layui-show')
            $('#info_2').addClass('layui-show')
            $('#info_3').removeClass('layui-show')

            // removeOverlays();
            // console.log(data.value)

            if (data.value === '请选择楼层') {
                $("#select_lab").html("");
                document.getElementById('select_lab').options.add(new Option('请选择房间'));
                // $('select').attr('disabled', 'disabled');
                form.render('select');
            }

            if (data.value !== '请选择楼层') {
                $.ajax({
                    type: 'get',
                    url: '/room/count_floor',
                    data: {
                        floor_id: data.value
                    },
                    success: function (json) {
                        $('#floor_id').text(select_text);
                        $('#room_total_number').text(json[0].totalRoom + '间');
                        $('#room_channel').text('2个');
                        $('#room_total_gate').text(json[0].totalGate + '扇');
                        $('#floor_total_area').text(json[0].totalArea + 'm²');
                        $('#floor_window').text(json[0].totalWindow + '扇');
                    },
                });

                // 放在加载icon之前，否则会把加载的icon 覆盖掉
                $.ajax({
                    type: 'get',
                    url: '/room/building',
                    data: {
                        floor_id: data.value
                    },
                    success: function (data) {
                        item = JSON.parse(data[0].extent);
                        var zoom
                        // console.log(data[0].building_id)
                        if (data[0].building_id == '1001') {
                            zoom = 2
                        } else {
                            zoom = 1.2
                        }
                        extent = [item.minX, item.minY, item.maxX, item.maxY];
                        mapLayer = [data[0].layer]
                        loadMap(extent, mapLayer, zoom);
                    }
                })

                $.ajax({
                    type: 'get',
                    url: '/room/lab_room',
                    data: {
                        floor_id: data.value
                    },
                    success: function (data) {


                        var select = 'dd[lay-value=' + 4102 + ']';
                        console.log(select)



                        removeOverlays();
                        data.forEach(item => {
                            if (item.FID !== null && item.centerX !== null) {
                                loadIconTip(`${item.FID}`, [item.centerX, item.centerY], `${item.type}`, `${item.Rname}`);

                            }
                        });
                        $("#select_lab").html("");
                        document.getElementById('select_lab').options.add(new Option('请选择房间'));
                        $.each(data, function (key, val) {
                            var option1 = $("<option>").val(val.FID).text(val.FID += '(' + val.Rname + ')');
                            $("#select_lab").append(option1);
                            form.render('select');
                        });
                    },
                });

            }
        });





        form.on('select(room_select)', function (data) {
            $('#tab_3').addClass('layui-this')
            $('#tab_2').removeClass('layui-this')
            $('#info_2').removeClass('layui-show')
            $('#info_3').addClass('layui-show')




            $('#back_before').show() //返回按钮
            $.ajax({
                type: 'get',
                url: '/room/lab',
                data: {
                    room_id: data.value
                },
                success: function (data) {
                    device_show(data[0].FID, data[0].Rname)
                    $('#room_id').text(data[0].FID);
                    $('#room_area').text(data[0].room_area + 'm²');
                    $('#room_gate').text(data[0].room_gate + '扇');
                    $('#room_master').text(data[0].room_master);
                    $('#room_name').text(data[0].Rname);
                    $('#room_window').text(data[0].room_window + '扇');
                    // $('#room_device').text('15台');
                    // $('#room_state').text(data[0].room_state);

                    if (data[0].extent == null) {
                        layer.msg('当前房间暂无平面图信息')
                    } else {
                        item = JSON.parse(data[0].extent);
                        extent = [item.minX, item.minY, item.maxX, item.maxY];
                        mapLayer = [data[0].layer]
                        loadMap(extent, mapLayer, 1);
                    }

                },
            });


        })
    });

})
