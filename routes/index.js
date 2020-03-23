var express = require('express');
var router = express.Router();


//检查登录状态
// router.use((req, res, next)=>{
//   if(!req.session.username&& req.url!=='/login'&&req.url!=='/register'){ //没有登录
//     res.redirect('/login');
//   }else{
//     next();
//   }
// });

/* GET home page. */
router.get('/index',function (req,res,next) {
  res.render('page/index');
});
router.get('/login', function(req, res, next) {
  res.render('page/login', { title: 'Express' });
});
router.get('/register', function(req, res, next) {
  res.render('page/register', { title: 'Express' });
});

//后台界面渲染
router.get('/admin_history_room',function (req,res,next) {
  res.render('admin/admin_history_room');
});
router.get('/admin_index',function (req,res,next) {
  res.render('admin/admin_index');
});
router.get('/admin_user_manage',function (req,res,next) {
  res.render('admin/admin_user_manage');
});
router.get('/admin_lab_risk',function (req,res,next) {
  res.render('admin/admin_lab_risk');
});
router.get('/admin_room_order',function (req,res,next) {
  res.render('admin/admin_room_order');
});
router.get('/admin_reagent_order',function (req,res,next) {
  res.render('admin/admin_reagent_order');
});
router.get('/admin_device_manage',function (req,res,next) {
  res.render('admin/admin_device_manage');
});
router.get('/admin_cylinder_manage',function (req,res,next) {
  res.render('admin/admin_cylinder_manage');
});
router.get('/admin_info_manage',function (req,res,next) {
  res.render('admin/admin_info_manage');
});
router.get('/user_edit',function (req,res,next) {
  res.render('admin/edit/user_edit');
});
router.get('/cylinder_edit',function (req,res,next) {
  res.render('admin/edit/cylinder_edit');
});
router.get('/reagent_edit',function (req,res,next) {
  res.render('admin/edit/reagent_edit');
});

router.get('/device_edit',function (req,res,next) {
  res.render('admin/edit/device_edit');
});
router.get('/device_number',function (req,res,next) {
  res.render('admin/read/device_number');
});
router.get('/device_backup',function (req,res,next) {
  res.render('admin/read/device_backup');
});
router.get('/device_order_info',function (req,res,next) {
  res.render('admin/read/device_order_info');
});
router.get('/device_info',function (req,res,next) {
  res.render('admin/read/device_info');
});
router.get('/time_select',function (req,res,next) {
  res.render('admin/add/time_select');
});

router.get('/reagent_number',function (req,res,next) {
  res.render('admin/read/reagent_number');
});
router.get('/device_order_number',function (req,res,next) {
  res.render('admin/read/device_order_number');
});
router.get('/room_order_number',function (req,res,next) {
  res.render('admin/read/room_order_number');
});
router.get('/model_add',function (req,res,next) {
  res.render('admin/add/model_add');
});
router.get('/modify_password',function (req,res,next) {
  res.render('admin/add/modify_password');
});

router.get('/admin_security_check',function (req,res,next) {
  res.render('admin/admin_security_check');
});
router.get('/admin_security_check2',function (req,res,next) {
  res.render('admin/admin_security_check2');
});
router.get('/admin_security_check3',function (req,res,next) {
  res.render('admin/admin_security_check3');
});

router.get('/admin_reagent_manage',function (req,res,next) {
  res.render('admin/admin_reagent_manage');
});
router.get('/admin_lab_info',function (req,res,next) {
  res.render('admin/admin_lab_info');
});
router.get('/admin_lab_danger',function (req,res,next) {
  res.render('admin/admin_lab_danger');
});
router.get('/admin_lab_urgent',function (req,res,next) {
  res.render('admin/admin_lab_urgent');
});
router.get('/admin_journal',function (req,res,next) {
  res.render('admin/admin_journal');
});

//前台页面渲染
router.get('/user_index',function (req,res,next) {
  res.render('users/user_index')
});
router.get('/room_order_master',function (req,res,next) {
  res.render('users/room_order_master')
});
router.get('/my_info',function (req,res,next) {
  res.render('admin/read/my_info')
});
router.get('/progress_bar',function (req,res,next) {
  res.render('admin/read/progress_bar')
});

router.get('/my_score',function (req,res,next) {
  res.render('admin/read/my_score')
});

router.get('/labroom_add',function (req,res,next) {
  res.render('admin/add/labroom_add')
});

router.get('/device_illustration_file.html',function (req,res,next) {
  res.render('admin/add/device_illustration_file.html')
});

router.get('/applicantion_form',function (req,res,next) {
  res.render('admin/add/applicantion_form')
});

router.get('/meeting_room_add',function (req,res,next) {
  res.render('admin/add/meeting_room_add')
});
router.get('/labroom_state',function (req,res,next) {
  res.render('admin/read/labroom_state')
});

router.get('/device_order_add',function (req,res,next) {
  res.render('admin/add/device_order_add')
});
router.get('/expirement_record',function (req,res,next) {
  res.render('admin/add/expirement_record')
});
router.get('/expirement_info',function (req,res,next) {
  res.render('admin/add/expirement_info')
});



router.get('/reagent_order_add',function (req,res,next) {
  res.render('admin/add/reagent_order_add')
});
router.get('/room_self_order',function (req,res,next) {
  res.render('users/room_self_order')
});
router.get('/room_order_verify',function (req,res,next) {
  res.render('users/room_order_verify')
});


router.get('/labroom_read',function (req,res,next) {
  res.render('admin/read/labroom_read')
});
router.get('/labroom_promise',function (req,res,next) {
  res.render('admin/read/labroom_promise')
});


router.get('/lab_order',function (req,res,next) {
  res.render('users/lab_order')
});
router.get('/lab_info',function (req,res,next) {
  res.render('users/lab_info')
});
router.get('/lab_exam',function (req,res,next) {
  res.render('users/lab_exam')
});
router.get('/lab_danger_element',function (req,res,next) {
  res.render('users/lab_danger_element')
});
router.get('/lab_urgent_schema',function (req,res,next) {
  res.render('users/lab_urgent_schema')
});
router.get('/lab_submit',function (req,res,next) {
  // console.log(req.headers.referer);
  res.render('users/lab_submit')
});
router.get('/room_order',function (req,res,next) {
  res.render('users/room_order')
});


module.exports = router;
