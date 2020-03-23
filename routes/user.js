let express = require('express');
let router = express.Router();
//实现和mysql交互
let mysql = require('mysql');
let config = require('../config/dbconfig');
let pool = mysql.createPool(config.mysql);
let fs = require("fs");
let path = require('path');
var upload = require('../config/fileupload')

//文件上传服务
// router.post('/upload/img', upload.array('image',3), function (req, res, next) {
//     console.log(req.files)
// });


router.post('/upload/file', upload.array('file', 6), function (req, res, next) {
    let order_number = req.body.id
    let files = req.files
    var final_array = [];//存储数组，用于批量导入数据库
    for (var j = 0; j < files.length; j++) {
        var array = [files[j].originalname, files[j].destination, files[j].filename, files[j].path, files[j].size, order_number];
        final_array.push(array)
    }
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO info_files(originalname,destination,filename,path,size,order_number) VALUES ?`;//批量入库，把数据转换成[[],[]]的形式
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


//PDF下载
router.get('/downPDF', function (req, res, next) {
    let filename = req.query.filename;
    console.log(filename)
    var filepath = path.join(__dirname, `../public/uploads/file/${filename}`);
    console.log(filepath)
    var f = fs.createReadStream(filepath);
    // 设置编码格式，下载文件名包含中文的文件。
    filename = encodeURI(filename, "GBK")
    filename = filename.toString('iso8859-1')
    res.writeHead(200, {
        'Content-Type': 'application/force-download',
        'Content-Disposition': `attachment; filename=${filename}`
    });
    f.pipe(res);
});

//SHP下载
router.get('/downSHP', function (req, res, next) {
    let type = req.query.aa;
    let landID = req.query.landID;
    console.log(type)
    console.log(landID)
    if (type == 1) {
        filename = 'shp';
    }
    var filepath = path.join(__dirname, `../public/upload/shp/${filename}.zip`);

    console.log(filepath);

    var f = fs.createReadStream(filepath);
    res.writeHead(200, {
        'Content-Type': 'application/force-download',
        'Content-Disposition': `attachment; filename=${filename}.zip`
    });
    f.pipe(res);
});


//读取exam
router.post('/exam', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        let sql = 'SELECT * from exam order by rand() limit 10';
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});

// 查询原密码
router.get('/getPassword', function (req, res, next) {
    let user_id = req.query.user_id
    pool.getConnection(function (err, connection) {
        let sql = `select * from users where user_id ='${user_id}'`
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});
// 修改密码
router.post('/updataPassword', function (req, res, next) {
    let endPass = req.body.endPass;
    let user_id = req.body.user_id;
    console.log(user_id, endPass)
    pool.getConnection(function (err, connection) {
        let sql = `UPDATE users SET password='${endPass}' where user_id='${user_id}'`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let data = {
                    code: 200,
                    msg: '修改成功'
                }
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});





//读取room_order
router.get('/room/order', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        let sql = `select * from exam`
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});

router.get('/order/room', function (req, res, next) {
    let room_type = req.query.room_type;
    pool.getConnection(function (err, connection) {
        let sql = `select FID,Rname from room where order_type='${room_type}' order by FID`
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});




//读取exam_result
router.get('/exam_result', function (req, res, next) {
    let name = req.query.name;
    pool.getConnection(function (err, connection) {
        let sql = `select * from exam_result where user_name='${name}'`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});
//device 设备预约记录插入
router.post('/device/add', function (req, res, next) {
    let value = req.body.device_value;
    let formatValue = JSON.parse(value);
    var Lists = [];
    for (let i in formatValue) {
        Lists.push(formatValue[i]);
    }
    var final_array = [];//存储数组，用于批量导入数据库
    for (var j = 0; j < Lists.length; j++) {
        var array = [Lists[j].device_ID, Lists[j].device_name, Lists[j].start_time, Lists[j].end_time, Lists[j].room_id, Lists[j].applicant, Lists[j].tradeNo];
        final_array.push(array)
    }
    // console.log(final_array)
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO device_order(device_ID,device_name,start_time,end_time,room_id,applicant,tradeNo) VALUES ?`;//批量入库，把数据转换成[[],[]]的形式
        connection.query($sql, [final_array], function (err, data) {
            console.log($sql, [final_array])
            if (err) {
                console.log(err);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});
//设备预约记录查询
router.get('/device/order', function (req, res, next) {
    let room_id = req.query.lab_number;
    let start_time = req.query.start_time;
    let end_time = req.query.end_time;
    // console.log(room_id)
    pool.getConnection(function (err, connection) {
        //要筛选出具有时间冲突的数据,还要进一步完善
        let $sql = `select * from device_order where room_id='${room_id}' and(start_time <= '${start_time}' AND end_time >= '${end_time}')`;

        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let fordata = [];
                for (i = 0; i < data.length; i++) {
                    fordata.push(data[i].device_ID)
                }
                res.send(fordata);
                connection.release();// 释放连接
            }
        })

    });
});
router.get('/get/device_order', function (req, res, next) {
    let Order_number = req.query.Order_number;
    pool.getConnection(function (err, connection) {
        //要筛选出具有时间冲突的数据,还要进一步完善
        let $sql = `select device_name from device_order where tradeNo='${Order_number}';`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                // let fordata = [];
                // for (i = 0; i < data.length; i++) {
                //     fordata.push(data[i].device_ID)
                // }
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});







router.get('/exam/result', function (req, res, next) {
    let user_id = req.query.user_id;
    let name = req.query.name;
    let score = req.query.score;
    let spend_time = req.query.spend_time;
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO exam_result(user_name,score,time,user_id) VALUES('${name}','${score}','${spend_time}','${user_id}')`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});

router.get('/room/count_building', function (req, res, next) {
    let building_id = req.query.building_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select sum(room_area) as totalArea,count(Rname) as totalRoom from room where building_id='${building_id}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});
router.get('/room/count_floor', function (req, res, next) {
    let floor_id = req.query.floor_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select sum(room_area) as totalArea, sum(room_gate) as totalGate,sum(room_window) as totalWindow, count(Rname) as totalRoom from room  where floor_id='${floor_id}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});


router.get('/room/lab_floor', function (req, res, next) {
    let building_id = req.query.building_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from building where building_id='${building_id}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});

router.get('/room/lab_room', function (req, res, next) {
    let floor_id = req.query.floor_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from room where floor_id='${floor_id}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});
router.get('/room/building', function (req, res, next) {
    let floor_id = req.query.floor_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from building where floor_id='${floor_id}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});
// router.get('/room/info',function (req,res,next) {
//     let room_id=req.query.room_id;
//     pool.getConnection(function (err,connection) {
//         let $sql=`select * from device where FID='${room_id}'`;
//         connection.query($sql,function (err,data) {
//             if(err){
//                 console.log(err.msg);
//             }else{
//                 req.session['room_id'] = data[0].FID;
//                 res.send(data);
//                 connection.release();// 释放连接
//             }
//         })
//     });
// });

//session设置,用于处理设备和实验室的关联预约问题
// router.post('/room/info_get', function (req, res, next) {
//     let room_info = {};
//     room_info['room_id'] = req.session.room_id;
//     console.log(room_info)
//     res.send(room_info)
// });


router.get('/room/lab', function (req, res, next) {
    let FID = req.query.room_id;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from room where FID='${FID}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
});

router.get('/get/expri_info', function (req, res, next) {
    let order_number = req.query.order_number;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from info_content where Order_number='${order_number}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})

router.get('/expri_info', function (req, res, next) {
    let order_number = req.query.order_number;
    let experiment_result = req.query.experiment_result;
    let experiment_content = req.query.experiment_content;
    let room_name = req.query.room_name;
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO info_content(FID,experiment_content,experiment_result,Order_number) VALUES('${room_name}','${experiment_content}','${experiment_result}','${order_number}')`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})
router.get('/expri_info_1', function (req, res, next) {
    let reagent_info = req.query.reagent_info;
    var final_data = [];
    for (i = 0; i < reagent_info.length; i++) {
        var data = [reagent_info[i].reagent_name, reagent_info[i].reagent_dose, reagent_info[i].reagent_from, reagent_info[i].order_number,]
        final_data.push(data)
    }
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO info_reagent(reagent_name,reagent_dose,reagent_from,Order_number) VALUES ?`;
        connection.query($sql, [final_data], function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})

router.get('/get/expri_info_1', function (req, res, next) {
    let order_number = req.query.order_number;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from info_reagent where Order_number='${order_number}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})
// 获取文件列表
router.get('/get/expri_info_files', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    let order_number = req.query.applicant;


    pool.getConnection(function (err, connection) {
        let $sql = `select * from info_files where Order_number='${order_number}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];

                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        id: form_data[i].ID,
                        originalname: form_data[i].originalname,
                        filename: form_data[i].filename,
                        path: form_data[i].path,
                        size: (form_data[i].size / 1014).toFixed(1) + 'kb',
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
                console.log(format_array)
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})



router.get('/expri_info_2', function (req, res, next) {
    let device_info = req.query.device_info;
    var final_data = [];
    for (i = 0; i < device_info.length; i++) {
        var data = [device_info[i].device_name, device_info[i].order_number,]
        final_data.push(data)
    }
    pool.getConnection(function (err, connection) {
        let $sql = `INSERT INTO info_device(device_name,Order_number) VALUES ?`;
        connection.query($sql, [final_data], function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})
router.get('/get/expri_info_2', function (req, res, next) {
    let order_number = req.query.order_number;
    pool.getConnection(function (err, connection) {
        let $sql = `select * from info_device where Order_number='${order_number}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})


router.get('/expri_info_3', function (req, res, next) {
    let entry_status = req.query.entry_status;
    let order_number = req.query.order_number;
    pool.getConnection(function (err, connection) {
        let $sql = `UPDATE room_order SET Entry_status='${entry_status}' where Order_number='${order_number}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})





router.get('/user/info', function (req, res, next) {
    let username = req.query.username;
    pool.getConnection(function (err, connection) {
        let $sql = ` select * from users where username ='${username}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    });
})


router.get('/user/score', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let applicant = req.query.applicant;

    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;

    pool.getConnection(function (err, connection) {
        let $sql = ` select * from exam_result where user_id ='${applicant}'`;
        connection.query($sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let form_data = data.slice(PageFirst, PageLast);
                let format_array = [];

                for (var i = 0; i < form_data.length; i++) {
                    var array = {
                        id: form_data[i].id,
                        user_id: form_data[i].user_id,
                        user_name: form_data[i].user_name,
                        score: form_data[i].score,
                        time: form_data[i].time,
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
    });
})

router.get('/get/appliacant_form', function (req, res, next) {
    let Order_number = req.query.Order_number;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `select * from lab_applicant_form where Order_number='${Order_number}' `
            connection.query($sql, function (err, result) {

                if (err) {
                    console.log(err)
                } else {
                    res.json(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                }
            });
        }
    })
});



// router.get('/appliacant_form/teacher', function (req, res, next) {
//     let Order_number = req.query.Order_number;
//     let teacher_idea = req.query.teacher_idea;
//     let teacher_sign = req.query.teacher_sign;
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             console.log(err.msg);
//         } else {
//             let $sql = `update lab_applicant_form set teacher_idea='${teacher_idea}', teacher_sign='${teacher_sign}' where Order_number = '${Order_number}'`;
//             console.log($sql)

//             connection.query($sql, function (err, result) {
//                 console.log(result);
//                 if (result) {
//                     result = {
//                         code: 200,
//                         msg: '信息已提交'
//                     };
//                 } else {
//                     result = {
//                         code: 400,
//                         msg: '提交失败'
//                     };
//                 }
//                 res.json(result); // 以json形式，把操作结果返回给前台页面
//                 connection.release();// 释放连接
//             });
//         }
//     })
// });

router.get('/appliacant_form/master', function (req, res, next) {
    let Order_number = req.query.Order_number;
    let master_idea = req.query.master_idea;
    let master_sign = req.query.master_sign;
    let master_time = req.query.master_time;
    let lab_idea = req.query.lab_idea;
    let lab_sign = req.query.lab_sign;
    let lab_time = req.query.lab_time;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `update lab_applicant_form set master_idea='${master_idea}', master_sign='${master_sign}',master_time='${master_time}', lab_idea='${lab_idea}',lab_sign='${lab_sign}',lab_time='${lab_time}' where Order_number = '${Order_number}'`;

            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '信息已提交'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '提交失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});




router.get('/appliacant_form/teacher', function (req, res, next) {
    let Order_number = req.query.Order_number;
    let teacher_idea = req.query.teacher_idea;
    let teacher_time = req.query.teacher_time;
    let teacher_sign = req.query.teacher_sign;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `INSERT INTO lab_applicant_form(Order_number,teacher_idea
                ,teacher_sign,teacher_time,master_idea,master_sign,master_time,lab_idea,lab_sign,lab_time) VALUES 
            ('${Order_number}','${teacher_idea}','${teacher_sign}','${teacher_time}','无','无','无','无','无','无')`;

            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '信息已提交'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '提交失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});

/*向room_order插入数据*/
router.get('/room/add', function (req, res, next) {
    let purpose = req.query.purpose;
    let start_time = req.query.start_time;
    let end_time = req.query.end_time;
    let lab_number = req.query.lab_number;
    let lab_name = req.query.lab_name;
    let applicant = req.query.applicant;
    let status_id = req.query.status_id;
    let tradeNo = req.query.tradeNo;
    let supervisor = req.query.supervisor;
    let user_type = req.query.user_type;
    let write_status = '0'
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `INSERT INTO room_order(purpose,start_time,end_time,FID,Rname,applicant,status_id,Order_number,Entry_status,supervisor,user_type,write_status) VALUES 
            ('${purpose}','${start_time}','${end_time}','${lab_number}','${lab_name}','${applicant}','${status_id}','${tradeNo}','0','${supervisor}','${user_type}','${write_status}')`;

            connection.query($sql, function (err, result) {
                console.log(result);
                if (result) {
                    result = {
                        code: 200,
                        msg: '预定信息已提交'
                    };
                } else {
                    result = {
                        code: 400,
                        msg: '提交失败'
                    };
                }
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});


router.get('/meeting_room/add', function (req, res, next) {
    let purpose = req.query.purpose;
    let start_time = req.query.start_time;
    let end_time = req.query.end_time;
    let lab_number = req.query.lab_number;
    let lab_name = req.query.lab_name;
    let applicant = req.query.applicant;
    let status_id = req.query.status_id;
    let tradeNo = req.query.tradeNo;
    let supervisor = req.query.supervisor;
    let user_type = req.query.user_type;
    let time_area = req.query.time_area;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `INSERT INTO meeting_room_order(purpose,start_time,end_time,FID,Rname,applicant,status_id,Order_number,Entry_status,supervisor,user_type,time_area) VALUES 
            ('${purpose}','${start_time}','${end_time}','${lab_number}','${lab_name}','${applicant}','${status_id}','${tradeNo}','0','${supervisor}','${user_type}','${time_area}')`;
            connection.query($sql, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    if (result) {
                        result = {
                            code: 200,
                            msg: '预定信息已提交'
                        };
                    } else {
                        result = {
                            code: 400,
                            msg: '提交失败'
                        };
                    }
                    res.json(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                }
            });
        }
    })
});


//用户预约device
router.get('/lab_device_add', function (req, res, next) {
    let id = req.query.id;
    let State_id = req.query.State_id;
    let applicant = req.query.applicant;
    console.log(applicant);
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `UPDATE device SET State_id='${State_id}', applicant ='${applicant}'where device_ID='${id}'`;
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
//用戶取消预约device
router.get('/device_delete', function (req, res, next) {
    let FID = req.query.FID;
    let State_id = req.query.State_id;
    let applicant = req.query.applicant;
    console.log(applicant + 'sss');
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `UPDATE device SET State_id='${State_id}', applicant =''where FID='${FID}' and applicant='${applicant}'`;
            console.log($sql);
            connection.query($sql, function (err, result) {
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

/*从room_order读取信息*/
router.get('/room_read', function (req, res, next) {
    let start_time = req.query.start_time;
    let FID = req.query.FID;
    // console.log(start_time);
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `select * from room_order WHERE Start_time='${start_time}' and FID='${FID}'`;
            connection.query($sql, function (err, result) {
                console.log(result);
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});
router.get('/get/room_order', function (req, res, next) {
    let Order_number = req.query.Order_number;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `select * from room_order WHERE Order_number='${Order_number}'`;
            connection.query($sql, function (err, result) {
                if(err){
                    console.log(err)
                }else{
                    res.send(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                }

            });
        }
    })
});


router.get('/room_order/update', function (req, res, next) {
    let Order_number = req.query.Order_number;
    let Status_id = req.query.Status_id;
    let write_status = req.query.write_status;
    pool.getConnection(function (err, connection) {
        let sql = `UPDATE room_order SET Status_id='${Status_id}',write_status='${write_status}' where Order_number='${Order_number}'`;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err.msg);
            } else {
                let data = {
                    code: 200,
                    msg: '修改成功'
                }
                res.send(data);
                connection.release();// 释放连接
            }
        })

    });
});





/*批量处理预约*/
router.post('/room_order/agree', function (req, res, next) {
    let id = req.body.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            let $sql = `update room_order set Status_id= '1' where id ='${id}'`
            connection.query($sql, function (err, data) {
                if (data) {
                    data = {
                        code: 200,
                        msg: '已同意'
                    }
                } else {
                    data = {
                        code: 400,
                        msg: '处理失败'
                    }
                }
                res.json(data);
                connection.release();
            });
        }
    })
});
router.post('/room_order/refuse', function (req, res, next) {
    let id = req.body.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            let $sql = `update room_order set Status_id= '-1' where id ='${id}'`
            connection.query($sql, function (err, data) {
                if (data) {
                    data = {
                        code: 200,
                        msg: '已拒绝'
                    }
                } else {
                    data = {
                        code: 400,
                        msg: '处理失败'
                    }
                }
                res.json(data);
                connection.release();
            });
        }
    })
});



/*从room表中删除数据*/
router.get('/room_delete', function (req, res, next) {
    let start_time = req.query.start_time;
    let FID = req.query.FID;
    // console.log(start_time);
    // console.log(FID);
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.msg);
        } else {
            let $sql = `delete  from room_order WHERE Start_time='${start_time}' and FID='${FID}'`;
            connection.query($sql, function (err, result) {
                console.log(result);
                res.json(result); // 以json形式，把操作结果返回给前台页面
                connection.release();// 释放连接
            });
        }
    })
});

//读取reagent(好像不能用reagent作为路由)
router.get('/room_reagent', function (req, res, next) {
    let page = req.query.page;//当前页码
    let limit = req.query.limit;//分页数
    let PageFirst = (page - 1) * limit;//控制页码显示情况
    let PageLast = page * limit;
    pool.getConnection(function (err, connection) {
        let sql = 'select * from reagent where FID=5111';
        connection.query(sql, function (err, data) {
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
                }
                console.log(data);
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});

//读取security_check
router.post('/Check', function (req, res, next) {
    // let lab_number=5111||req.query.lab_number;//当前页码
    let lab_number = req.body.lab_number;
    pool.getConnection(function (err, connection) {
        // let sql=`select * from room_order where FID=${lab_number}`;
        let sql = `select * from room_order`;
        if (lab_number) {
            sql += ` and FID = ${lab_number}`
        }
        sql = sql.replace("and", "where")
        connection.query(sql, function (err, data) {
            console.log(sql)
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});



router.post('/meeting_room/read', function (req, res, next) {
    let lab_number = req.body.lab_number;
    pool.getConnection(function (err, connection) {
        // let sql=`select * from room_order where FID=${lab_number}`;
        let sql = `select * from meeting_room_order`;
        if (lab_number) {
            sql += ` and FID = ${lab_number}`
        }
        sql = sql.replace("and", "where")
        connection.query(sql, function (err, data) {
            console.log(sql)
            if (err) {
                console.log(err.msg);
            } else {
                console.log(data)
                res.send(data);
                connection.release();// 释放连接
            }

        })
    })
});





//读取users
router.get('/user/img', function (req, res, next) {
    let username = req.query.username;
    // console.log(username+'ss')
    pool.getConnection(function (err, connection) {
        let sql = `select * from users where username='${username}'`;
        connection.query(sql, function (err, data) {
            console.log(sql)
            if (err) {
                console.log(err.msg);
            } else {
                res.send(data);
                connection.release();// 释放连接
            }
        })
    })
});







module.exports = router;
