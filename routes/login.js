let express = require('express');
let router = express.Router();
//实现和mysql交互
let mysql = require('mysql');
let config = require('../config/dbconfig');
let crypto = require('crypto');

//使用连接池，提升性能
let pool = mysql.createPool(config.mysql);
/* GET users listing. */
//登陆界面渲染
router.get('/', function (req, res, next) {
    res.render('page/login');
});

router.post('/login', function (req, res, next) {
    let username = req.body.username;//获取前台请求的参数
    let password = req.body.password;
    // let md5 = crypto.createHash("md5");
    // let newPas = md5.update(password).digest("hex");

    let type = req.body.peopleType;
    pool.getConnection(function (err, connection) {
        //先判断该账号是否存在
        let $sql = "select * from users where user_id=? ";

        // let sql = `select * from admin where user_id=?`;
        // let sql = "select * from users where user_id=? ";

        // if (type == 'student') {
        //     x = $sql
        //     // login_type='普通用户'

        // } else if (type == 'manage') {
        //     x = sql
        // }
        // console.log(x);
        connection.query($sql, [username], function (err, result) {
            let resultJson = result;
            // console.log(resultJson.length);
            if (resultJson.length === 0) {
                result = {
                    code: 300,
                    msg: '该账号不存在'
                };
                res.json(result);
                connection.release();
            } else {  //账号存在，可以登录，进行密码判断
                req.session['username'] = result[0].username;
                console.log(result[0])
                if (type == 'student') {
                    login_type='普通用户'

                } else if (type == 'manage') {
                    login_type='管理员'
                }
                let $sql1 = "select * from users where user_id=?";
                let sql1 = `select * from users where user_id=? and customer_type='${login_type}'`;
                // let sql1 = `select * from admin where user_id=?`;
                if (result[0].customer_type == '管理员') {
                    a = $sql1
                } else if (result[0].customer_type == '普通用户') {
                    a = sql1
                }
                connection.query(a, [username], function (err, result) {
                    let resultJson = result;
                    if (resultJson.length === 0) {
                        result = {
                            code: 300,
                            msg: '该账号不存在'
                        };
                        res.json(result);
                        connection.release();
                    } else {
                        let temp = result[0].password;  //取得数据库查询字段值
                        if (temp == password) {
                            req.session['password'] = result[0].password;
                            req.session['type'] = result[0].type;
                            req.session['major_in'] = result[0].major_in;
                            req.session['user_id'] = result[0].user_id;
                            req.session['supervisor'] = result[0].supervisor;
                            req.session['customer_type'] = result[0].customer_type;
                            result = {
                                code: 200,
                                msg: '密码正确'
                            };
                        } else {
                            result = {
                                code: 400,
                                msg: '密码错误'
                            };
                        }
                        res.json(result); // 以json形式，把操作结果返回给前台页面
                        connection.release();// 释放连接
                    }


                });
            }
        });
    });
});



//登出功能
router.post('/logout', function (req, res, next) {
    req.session.username = null; // 删除session
    res.send()
});

//session设置
router.post('/session', function (req, res, next) {
    let user_info = {};
    user_info['username'] = req.session.username;
    user_info['password'] = req.session.password;
    user_info['type'] = req.session.type;
    user_info['major_in'] = req.session.major_in;
    user_info['user_id'] = req.session.user_id;
    user_info['supervisor'] = req.session.supervisor;
    user_info['customer_type'] = req.session.customer_type;
    // console.log(user_info)
    res.send(user_info);
});


//session失效判断
router.post('/consolidate', function (req, res, next) {
    if (req.session.username == undefined) {
        return res.json({ ret_code: -1, ret_msg: '登陆信息失效，请您重新登陆' })
    } else {
        return res.json({ ret_code: 1, ret_msg: '不需要重新登陆' })
    }
});

module.exports = router;

