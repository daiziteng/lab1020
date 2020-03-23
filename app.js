let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let cookieSession=require('cookie-session');
let logger = require('morgan');
let ejs = require('ejs');
let cors=require('cors')


let indexRouter = require('./routes/index');
let adminRouter = require('./routes/admin');
let loginRouter = require('./routes/login');
let userRouter = require('./routes/user');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//采用html作为页面模板
app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//cookie、session
app.use(cookieParser());
(function () {
  let keys=[];
  for(let i=0;i<100000;i++){
    keys[i]='a_'+Math.random();
  }
  app.use(cookieSession({
    secret:'secret',
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    name:'sess_id',
    keys:keys,
    maxAge:60*60*1000  
  }))
})();



app.use(express.static(path.join(__dirname, 'public')));


// app.use(express.static(path.join(__dirname, 'uploads')));


app.use('/', indexRouter);
app.use('/', adminRouter);
app.use('/', loginRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
//解决浏览器的跨域访问问题
// app.use(cors({
//   origin:['http://localhost:8080/geoserver/classroom/wms'],
//   methods:['GET','POST'],
//   alloweHeaders:['Conten-Type', 'Authorization']
// }));


app.use(cors({
  origin:['http://localhost:8080'],
  methods:['GET','POST'],
  alloweHeaders:['Conten-Type', 'Authorization']
}));
//设置跨域访问
app.all("*",function(req,res,next){
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","http://api.douban.com/v2/movie/top250");
  //允许的header类型
  res.header("Access-Control-Allow-Headers","content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
})

app.listen(4800, function () {
  console.log("Server Start!");
});


module.exports = app;
