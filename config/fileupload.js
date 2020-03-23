/**
 *
 * @Description 文件上传配置
 * @Author Amor
 * @Created 2016/04/27 17:50
 * 技术只是解决问题的选择,而不是解决问题的根本...
 * 我是Amor,为发骚而生!
 *
 */
var multer = require('multer');
// var config = require('./config')
let fs = require("fs");


var createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};
var uploadFolder = './public/uploads/file/';
var uploadFolder_2 = './public/upload/file/';

var storage = multer.diskStorage({
    //设置上传文件路径,以后可以扩展成上传至七牛,文件服务器等等
    //Note:如果你传递的是一个函数，你负责创建文件夹，如果你传递的是一个字符串，multer会自动创建
    // destination: config.upload.path,
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    //TODO:文件区分目录存放
    //给上传文件重命名
    filename: function (req, file, cb) {
        createFolder(uploadFolder)
        // var fileFormat = (file.originalname).split(".");
        timestamp = new Date().getTime();
        filename = timestamp + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.')[1];
        cb(null, filename)
        // cb(null, file.fieldname + "." + fileFormat[fileFormat.length - 1]);
        // cb(null, file.fieldname + '-' + Date.now()); //对文件进行命名操作
    }
});


var storage_2 = multer.diskStorage({
    //设置上传文件路径,以后可以扩展成上传至七牛,文件服务器等等
    //Note:如果你传递的是一个函数，你负责创建文件夹，如果你传递的是一个字符串，multer会自动创建
    // destination: config.upload.path,
    destination: function (req, file, cb) {
        cb(null, uploadFolder_2);    // 保存的路径，备注：需要自己创建
    },
    //TODO:文件区分目录存放
    //给上传文件重命名
    filename: function (req, file, cb) {
        createFolder(uploadFolder_2)
        // var fileFormat = (file.originalname).split(".");
        timestamp = new Date().getTime();
        filename = timestamp + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.')[1];
        cb(null, filename)
        // cb(null, file.fieldname + "." + fileFormat[fileFormat.length - 1]);
        // cb(null, file.fieldname + '-' + Date.now()); //对文件进行命名操作
    }
});



//添加配置文件到muler对象。
var upload = multer({
    storage: storage,
    //其他设置请参考multer的limits
    //limits:{}
})

var upload_2 = multer({
    storage: storage_2,
    //其他设置请参考multer的limits
    //limits:{}
})


module.exports = upload;
module.exports = upload_2;