let express = require('express');
let router = express.Router();
//实现和mysql交互
let mysql = require('mysql');
var exec = require('child_process').exec; //创建线程，操作命令行
let config = require('../config/dbconfig');
let pool = mysql.createPool(config.mysql);
var upload_2 = require('../config/fileupload')


// device文件上传
router.post('/upload/device_file', upload_2.array('file', 1), function (req, res, next) {
    let device_ID = req.body.id
    let files = req.files
    var final_array = [];//存储数组，用于批量导入数据库
    for (var j = 0; j < files.length; j++) {
        var array = [files[j].originalname, files[j].destination, files[j].filename, files[j].path, files[j].size, device_ID];
        final_array.push(array)
    }
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO device_info_files(originalname,destination,filename,path,size,device_ID) VALUES ?`;//批量入库，把数据转换成[[],[]]的形式
        connection.query($sql, [final_array], function (err, data) {
            console.log($sql, [final_array])
            if (err) {
                console.log(err);
            } else {
                let data = {
                    "code": 0,
                    "msg": '上传成功',
                };
                res.json(data);
                connection.release();// 释放连接
            }
        })
    });
});



router.get('/device/info_files', function (req, res, next) {
    let device_ID = req.query.id;//当前页码
    pool.getConnection(function (err, connection) {
        let sql = `select path from device_info_files  where device_ID='${device_ID}'`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});








//device 数据与恢复
router.get('/device/backup', function (req, res, next) {
    let name = req.query.name;
    let nowTime = req.query.nowTime;
    let timestamp = new Date().getTime();

    function execute() {
        var cmd = ` cd ./public/backup && mysqldump -u root -p123456 backup > device_${timestamp}.sql`;
        exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
            else {
                let  filename=`device_${timestamp}.sql`
                // 成功之后把数据写入数据库
                pool.getConnection(function (err, connection) {
                    let sql =`insert into backup (time,filename,creator) values ('${nowTime}','${filename}','${name}');`;
                    connection.query(sql, function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            let data={
                                code:'200',
                                msg:'备份成功'
                            }
                            res.send(data);
                            connection.release();// 释放连接
                        }

                    })
                })
            }
        });
    }
    execute();
});
router.get('/device/recover', function (req, res, next) {
    let name = req.query.name;
    function execute() {
        var cmd = ` cd ./public/backup && mysql -u root  -p123456 backup < backdb.sql`;
        exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("成功");
            }
        });
    }
    execute();
});
//读取user
router.get('/device_backup/read', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from backup';
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                if (data.length > 0) {
                    data = {
                        "count": data.length,
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});




//读取user
router.get('/UserList', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from users';
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);

                if (data.length > 0) {
                    data = {
                        "count": data.length,
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                }
                // console.log(data)
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});

router.get('/getRoom', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        let sql = `select FID,Rname from room order by FID`
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
})


//读取room_order
router.get('/Order_room', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let room_id = req.query.room_id;
    let lab_name = req.query.lab_name;
    let start_time = req.query.start_time;
    let applicant = req.query.applicant;
    let Applicant = req.query.Applicant;
    let user_type = req.query.user_type;
    let supervisor = req.query.supervisor;
    let FID = req.query.FID;
    let Rname = req.query.Rname;
    let date = req.query.date;
    let Type = req.query.Type;  //历史记录
    let master_status = req.query.master_status;  //历史记录
    let order_type = req.query.order_type;
    let write_status = req.query.write_status; //负责人目标数据
    let weekNumber = req.query.weekNumber; //本周数据


    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from room_order';
        if (page && Type != 'history') {
            sql += " where Status_id   =  0 ";
        } else if (Type) {
            sql += " where Status_id   !=  0 ";
        }

        if (room_id) {
            sql += " and FID like '%" + room_id + "%' ";
        }
        if (lab_name) {
            sql += " and Rname like '%" + lab_name + "%' ";
        }
        if (start_time) {
            sql += " and Start_time like '%" + start_time + "%' ";
        }
        if (applicant) {
            sql += " and Applicant like '%" + applicant + "%' ";
        }
        if (Applicant) {
            sql += " and Applicant like '%" + Applicant + "%' ";
        }
        if (supervisor) {
            sql += `and supervisor = '${supervisor}'`
        }
        if (user_type) {
            sql += `and user_type = '${user_type}'`
        }
        if (write_status) {
            sql += `and write_status = '${write_status}'`
        }
        if (master_status) {
            sql += `and abs(write_status) = '${master_status}'`
        }

        if (FID) {
            sql += " and FID like '%" + FID + "%' ";
        }
        if (Rname) {
            sql += " and Rname like '%" + Rname + "%' ";
        }
        if (date) {
            sql += " and Start_time like '%" + date + "%' ";
        }
        if (weekNumber) {
            sql += "  WHERE YEARWEEK(date_format(start_time,'%Y-%m-%d')) = YEARWEEK(now()) ";
        }
        if (order_type == 'up') {
            sql += " order by Start_time"
        } else {
            sql += " order by Start_time desc"
        }
        // sql = sql.replace("and","");
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {

                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        id: form_data[i].id,
                        FID: form_data[i].FID,
                        Rname: form_data[i].Rname,
                        Start_time: form_data[i].Start_time.toLocaleDateString() + ' ' + form_data[i].Start_time.toLocaleTimeString(),
                        End_time: form_data[i].End_time.toLocaleDateString() + ' ' + form_data[i].End_time.toLocaleTimeString(),
                        Purpose: form_data[i].Purpose,
                        Order_number: form_data[i].Order_number,
                        Applicant: form_data[i].Applicant,
                        Status_id: form_data[i].Status_id,
                    };
                    format_array.push(array);
                }
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array,
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});


router.post('/general_info', function (req, res, next) {
    let FID = req.body.FID;
    let Fname = req.body.Fname;
    let Content = req.body.Content;
    console.log(FID)
    pool.getConnection(function (err, connection) {
        let $sql = `insert into general_info (FID,Fname,Content) values ('${FID}','${Fname}','${Content}');`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg)
            } else {
                res.send('信息已提交');
                connection.release()
            }
        })
    })
});
router.post('/danger_info', function (req, res, next) {
    let FID = req.body.FID;
    let Fname = req.body.Fname;
    let Type = req.body.Type;
    let Content = req.body.Content;
    console.log(FID)
    pool.getConnection(function (err, connection) {
        let $sql = `insert into danger_info (FID,Fname,danger_type,danger_content) values ('${FID}','${Fname}','${Type}','${Content}');`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg)
            } else {
                res.send('信息已提交');
                connection.release()
            }
        })
    })
});
router.post('/emergency_info', function (req, res, next) {
    let FID = req.body.FID;
    let Fname = req.body.Fname;
    let Type = req.body.Type;
    let Content = req.body.Content;
    console.log(FID)
    pool.getConnection(function (err, connection) {
        let $sql = `insert into emergency_info (FID,Fname,emergency_type,emergency_content) values ('${FID}','${Fname}','${Type}','${Content}');`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg)
            } else {
                res.send('信息已提交');
                connection.release()
            }
        })
    })
});



router.get('/history/room', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let room_id = req.query.room_id;
    let state_id = req.query.state_id;
    let time = req.query.time;
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from room_order';
        if (room_id) {
            sql += " and FID like '%" + room_id + "%' ";
        }
        if (state_id) {
            sql += " and Status_id " + '=' + " " + state_id + " ";
            console.log("ss")

        }
        if (time === '1') {
            sql += " and TO_DAYS(Start_time) = TO_DAYS(NOW())";
        }
        if (time === '7') {
            sql += " and DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(Start_time) ";
        }
        if (time === '30') {
            sql += " and DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(Start_time) ";
        }
        if (time === '365') {
            sql += " and YEAR(Start_time)=YEAR(NOW()) ";
        }
        if (time === 'all') {
            sql += " and TO_DAYS(Start_time) <= TO_DAYS(NOW())";
        }
        sql = sql.replace("and", "where");
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
                console.log(sql)
            } else {
                console.log(sql)
                console.log(time)

                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        id: form_data[i].id,
                        FID: form_data[i].FID,
                        Rname: form_data[i].Rname,
                        Start_time: form_data[i].Start_time.toLocaleDateString() + ' ' + form_data[i].Start_time.toLocaleTimeString(),
                        End_time: form_data[i].End_time.toLocaleDateString() + ' ' + form_data[i].End_time.toLocaleTimeString(),
                        Purpose: form_data[i].Purpose,
                        Applicant: form_data[i].Applicant,
                        Status_id: form_data[i].Status_id,
                    };
                    format_array.push(array);
                }
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array,
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});

router.get('/self/room', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let applicant = req.query.applicant;
    let supervisor = req.query.supervisor;
    let FID = req.query.FID;
    let Rname = req.query.Rname;
    let date = req.query.date;
    let Applicant = req.query.Applicant;
    let order_type = req.query.order_type;
    let info_status = req.query.info_status;

    console.log(info_status)


    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;

    pool.getConnection(function (err, connection) {
        let sql = 'select * from room_order ';
        if (applicant) {
            sql += " and Applicant like '%" + applicant + "%' ";
        }
        if (FID) {
            sql += " and FID like '%" + FID + "%' ";
        }
        if (Rname) {
            sql += " and Rname like '%" + Rname + "%' ";
        }
        if (Applicant) {
            sql += " and Applicant like '%" + Applicant + "%' ";
        }
        if (supervisor) {
            sql += " and supervisor like '%" + supervisor + "%' ";
        }
        if (date) {
            sql += " and Start_time like '%" + date + "%' ";
        }
        if (info_status == '0' || info_status == '1') {
            sql += `and Entry_status = '${info_status}'`;
        }

        if (order_type == 'up') {
            sql += " order by Start_time"
        } else {
            sql += " order by Start_time desc"
        }

        sql = sql.replace("and", "where");
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
                console.log(sql)
            } else {

                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        id: form_data[i].id,
                        FID: form_data[i].FID,
                        Rname: form_data[i].Rname,
                        Start_time: form_data[i].Start_time.toLocaleDateString() + ' ' + form_data[i].Start_time.toLocaleTimeString(),
                        End_time: form_data[i].End_time.toLocaleDateString() + ' ' + form_data[i].End_time.toLocaleTimeString(),
                        Purpose: form_data[i].Purpose,
                        Applicant: form_data[i].Applicant,
                        Status_id: form_data[i].Status_id,
                        Order_number: form_data[i].Order_number,
                        Entry_status: form_data[i].Entry_status,
                        write_status: form_data[i].write_status,
                    };
                    format_array.push(array);
                }
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array,
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                console.log(data)
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});
//试剂预约
router.get('/reagent_order', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        let sql = 'select * from reagent_reservation';
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": data
                    };
                }
                console.log(data);
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});


// 设备预约
router.get('/Device_order', function (req, res, next) {
    let Order_number = req.query.applicant;
    let weekNumber = req.query.weekNumber;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from device_order ';
        if (Order_number) {
            sql += `and tradeNo = '${Order_number}'`;
        }
        if (weekNumber) {
            sql += `and YEARWEEK(date_format(start_time,'%Y-%m-%d')) = YEARWEEK(now())`
        }
        sql = sql.replace("and", "where");
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": data
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                };

                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});


router.get('/Device_order/number', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    let beginTime = req.query.beginTime;
    let endTime = req.query.endTime;
    pool.getConnection(function (err, connection) {
        if (beginTime) {
            sql = `select start_time,total as'total_num' from( select date(start_time) as start_time, count(device_name) as total from device_order group by date(start_time) ) 
            as temp where start_time between '${beginTime}' and '${endTime}' order by start_time desc;`
        } else {
            // sql = `select start_time,total as'total_num' from( select date(start_time) as start_time, count(device_name) as total from device_order group by date(start_time) ) 
            // as temp order by start_time desc;`
            sql = `select start_time,total as'total_num' from( select date(start_time) as start_time, count(device_name) as total from device_order group by date(start_time) ) 
             as temp  WHERE YEARWEEK(date_format(start_time,'%Y-%m-%d')) = YEARWEEK(now()) order by start_time desc;`
        }
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        start_time: form_data[i].start_time.toLocaleDateString(),
                        total_num: form_data[i].total_num
                    };
                    format_array.push(array);
                }
                if (format_array.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                };
                res.send(data);
                connection.release();// 释放连接
            }
        })
    })
});
router.get('/expirement_info/number', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        let sql = ` select sum(Entry_status=1) as total from room_order  WHERE YEARWEEK(date_format(Start_time,'%Y-%m-%d')) = YEARWEEK(now())-1 ; `;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    })
})

router.get('/expirement/number', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    let beginTime = req.query.beginTime;
    let endTime = req.query.endTime;
    pool.getConnection(function (err, connection) {
        if (beginTime) {
            sql = `select Start_time, yes as 'yes_num',no as 'no_num',total as'total_num' from( select date(Start_time) as Start_time, sum(Entry_status=1) as yes,sum(Entry_status=0) 
            as no,count(Entry_status) as total from room_order group by date(Start_time) )  as temp where Start_time between '${beginTime}' and '${endTime}'  order by Start_time desc;`
        } else {
            sql = `select Start_time, yes as 'yes_num',no as 'no_num',total as'total_num' from( select date(Start_time) as Start_time, sum(Entry_status=1) as yes,sum(Entry_status=0) 
            as no,count(Entry_status) as total from room_order group by date(Start_time) )  as temp order by Start_time desc;`
        }
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        Start_time: form_data[i].Start_time.toLocaleDateString(),
                        yes_num: form_data[i].yes_num,
                        no_num: form_data[i].no_num,
                        total_num: form_data[i].total_num
                    };
                    format_array.push(array);
                }
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                };
                console.log(data)
                res.send(data);
                connection.release();// 释放连接
            }
        })
    })
});

router.get('/Room_order/number', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    let beginTime = req.query.beginTime;
    let endTime = req.query.endTime;
    pool.getConnection(function (err, connection) {
        if (beginTime) {
            sql = `select FID,Rname,count(id) as total_num from room_order where Start_time between '${beginTime}' and '${endTime}' 
            group by FID,Rname order by total_num desc;`
        } else {
            sql = `select FID,Rname,total as 'total_num' from( select FID,Rname as Rname,count(id) as total from room_order WHERE YEARWEEK(date_format(start_time,'%Y-%m-%d')) = YEARWEEK(now())  group by FID,Rname)
             as temple  order by total_num desc;`
        }
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                };
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});
router.get('/device_place/number', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        sql = `select device_ID,device_name,total as 'total_num' from( select device_ID,device_name as device_name,count(id) as total from device_order group by device_ID,device_name) as temple order by total_num desc;`

        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                };
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});





//读取reagent(好像不能用reagent作为路由)
router.get('/manage_reagent', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let FID = req.query.lab_number;
    let product_place = req.query.product_place;
    let reagent_name = req.query.reagent_name;
    let stock_state = req.query.stock_state;
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    // console.log(stock_state)
    pool.getConnection(function (err, connection) {
        let $sql = 'select * from reagent';
        if (product_place) {
            $sql += " and reagent_product like '%" + product_place + "%' ";
        }
        if (reagent_name) {
            $sql += " and reagent_name like '%" + reagent_name + "%' ";
        }
        if (FID) {
            $sql += " and FID like '%" + FID + "%' ";
        }
        if (stock_state === 'normal') {
            $sql += " and  reagent_stock between min_stock and max_stock ";
        }
        if (stock_state === 'under') {
            $sql += " and  reagent_stock < min_stock ";
        }
        if (stock_state === 'over') {
            $sql += " and  reagent_stock > max_stock ";
        }

        $sql = $sql.replace("and", "where");

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);//根据前台页码选择情况控制数据的输出条数
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                // console.log(data);
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});

router.get('/device_read', function (req, res, next) {
    let FID = req.query.lab_number;
    let supervisor = req.query.supervisor;
    let user_type = req.query.user_type;
    let user_name = req.query.user_name;
    pool.getConnection(function (err, connection) {
        let sql_t = `select * from device where FID='${FID}' and (device_purpose='公有设备' or device_owner='${user_name}')`
        let sql_s = `select * from device where FID='${FID}' and (device_purpose='公有设备' or device_owner='${supervisor}')`;
        if (user_type === '老师') {
            $sql = sql_t
        } else {
            $sql = sql_s
        }

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                res.send(data);
                connection.release()
            }
        })
    })
});


//读取device
router.get('/device_manage', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let device_name = req.query.device_name;
    let FID = req.query.lab_number;
    let danger_degree = req.query.danger_degree;
    let device_state = req.query.device_state;
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let $sql = "select * from device";
        if (device_name) {
            $sql += " and device_name like '%" + device_name + "%' ";
        }
        if (danger_degree) {
            $sql += " and danger_degree like '%" + danger_degree + "%' ";
        }
        if (FID) {
            $sql += " and FID like '%" + FID + "%' ";
        }
        if (device_state === 'duration') {
            // $sql += " and new Date(expiration_date) < new Date()";
            $sql += " and expiration_date <= NOW()";
        }
        if (device_state === 'normal') {
            $sql += " and expiration_date > NOW()";
        }

        $sql = $sql.replace("and", "where");

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];
                // console.log(form_data)

                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        device_ID: form_data[i].device_ID,
                        device_name: form_data[i].device_name,
                        device_number: form_data[i].device_number,
                        device_price: form_data[i].device_price,
                        device_singlePrice: form_data[i].device_singlePrice,
                        education_name: form_data[i].education_name,
                        education_number: form_data[i].education_number,
                        purchase_date: form_data[i].purchase_date,
                        document_No: form_data[i].document_No,
                        manufactor: form_data[i].manufactor,
                        user: form_data[i].user,
                        userNo: form_data[i].userNo,
                        device_specs: form_data[i].device_specs,
                        device_model: form_data[i].device_model,
                        FID: form_data[i].FID,
                        Remarks: form_data[i].Remarks,
                        batch_No: form_data[i].batch_No,
                        input_person: form_data[i].input_person,
                        input_personNo: form_data[i].input_personNo,
                        device_type: form_data[i].device_type,
                        input_date: form_data[i].input_date,
                        use_unit: form_data[i].use_unit,
                        use_unitNumber: form_data[i].use_unitNumber,
                        device_purpose: form_data[i].device_purpose,
                        experiment_item: form_data[i].experiment_item,
                        device_owner: form_data[i].device_owner,
                        device_manage: form_data[i].device_manage,
                        experiment_object: form_data[i].experiment_object,
                        device_master: form_data[i].device_master,
                        // product_date: form_data[i].product_date.toLocaleDateString(), //时间格式化
                        warranty_duration: form_data[i].warranty_duration,
                        // expiration_date:form_data[i].expiration_date.toLocaleDateString(),
                    };
                    format_array.push(array);
                }


                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": format_array
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                // console.log(data);
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});
//读取history(日志)
router.get('/history/logs', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let $sql = "select * from history_log";

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast)
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});



//读取cylinder
router.get('/cylinder_manage', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let cylinder_name = req.query.cylinder_name;
    let danger_property = req.query.danger_property;
    let cylinder_spec = req.query.cylinder_spec;
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let $sql = 'select * from cylinder';
        if (cylinder_name) {
            $sql += " and cylinder_name like '%" + cylinder_name + "%' ";
        }
        if (danger_property) {
            $sql += " and danger_property like '%" + danger_property + "%' ";
        }
        if (cylinder_spec) {
            $sql += " and cylinder_spec like '%" + cylinder_spec + "%' ";
        }

        $sql = $sql.replace("and", "where");

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                console.log(form_data)
                let format_array = [];
                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        cylinder_name: form_data[i].cylinder_name,
                        cylinder_number: form_data[i].cylinder_number,
                        cylinder_spec: form_data[i].cylinder_spec,
                        c_pressure: form_data[i].c_pressure,
                        danger_property: form_data[i].danger_property,
                        danger_degree: form_data[i].danger_degree,
                        danger_type: form_data[i].danger_type,
                    };
                    format_array.push(array);
                }
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度
                        "code": 0,
                        "msg": '成功',
                        "data": form_data,
                    };
                } else {
                    data = {
                        "count": 0,//显示数据长度
                        "code": 0,
                        "msg": '未查到相应数据',
                        "data": []
                    };
                }
                // console.log(data);
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});
//读取security_check
router.get('/Check_info', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        // let sql=`select * from security_check limit ${PageItem},${limit}`;
        let sql = `select * from security_check`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast)
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度,把表中所有数据统计出来
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});

router.get('/Check_info/2', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = `select * from security_check2`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast)
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度,把表中所有数据统计出来
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});
router.get('/Check_info/3', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = `select * from security_check3`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast)
                if (data.length > 0) {
                    data = {
                        "count": data.length,//显示数据长度,把表中所有数据统计出来
                        "code": 0,
                        "msg": '成功',
                        "data": form_data
                    };
                }
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});




/*删除操作*/
//用户管理——删除users表
router.post('/user/delete', function (req, res, next) {
    let id = req.body.id;

    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg)
        } else {
            let sql = `DELETE FROM users where id='${id}'`;
            connection.query(sql, function (err, data) {
                if (data) {
                    data = {
                        code: 200,
                        msg: '删除成功'
                    }
                } else {
                    data = {
                        code: 400,
                        msg: '删除失败'
                    }
                }
                res.json(data);
                connection.release();
            })
        }

    })

})
/*新增操作*/
router.get('/user/add', function (req, res, next) {
    let id = req.query.id;
    let username = req.query.username;
    let password = req.query.password;
    let xingming = req.query.xing_ming;

    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `INSERT INTO users(id,username,password,name) VALUES('${id}','${username}','${password}','${xingming}')`;
            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '新增成功'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '新增失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })

});
/*编辑修改操作*/
router.get('/user/edit', function (req, res, next) {
    let id = req.query.id;
    let username = req.query.username;
    let password = req.query.password;
    let user_id = req.query.user_id;
    let type = req.query.type;
    let major_in = req.query.major_in;
    console.log(type)
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `UPDATE users SET id='${id}',username='${username}',password='${password}',user_id='${user_id}',type='${type}',major_in='${major_in}' where id='${id}'`;
            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '修改成功'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '修改失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});
/*编辑修改操作*/
router.get('/cylinder/edit', function (req, res, next) {
    let cylinder_id = req.query.cylinder_id;
    let cylinder_name = req.query.cylinder_name;
    let cylinder_number = req.query.cylinder_number;
    let cylinder_spec = req.query.cylinder_spec;
    let c_pressure = req.query.c_pressure;
    let danger_property = req.query.danger_property;
    let danger_degree = req.query.danger_degree;
    let danger_type = req.query.danger_type;
    // console.log(type)
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `UPDATE cylinder SET cylinder_id='${cylinder_id}',cylinder_name='${cylinder_name}',cylinder_number='${cylinder_number}',
            cylinder_spec='${cylinder_spec}',c_pressure='${c_pressure}',danger_property='${danger_property}',danger_degree='${danger_degree}',danger_type='${danger_type}' where cylinder_id='${cylinder_id}'`;
            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '修改成功'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '修改失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});



/*编辑修改操作*/
router.post('/room_update', function (req, res, next) {
    let id = req.body.id;
    let FID = req.body.FID;
    let Rname = req.body.Rname;
    let Purpose = req.body.Purpose;
    let Start_time = req.body.Start_time;
    let End_time = req.body.End_time;
    let Applicant = req.body.Applicant;
    let Status_id = req.body.Status_id;

    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `UPDATE room_order SET id='${id}',FID='${FID}',Rname='${Rname}',Start_time='${Start_time}',Purpose='${Purpose}',End_time='${End_time}',Applicant='${Applicant}',Status_id='${Status_id}' where id='${id}'`;
            // console.log($sql)

            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '修改成功'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '修改失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});


module.exports = router;

