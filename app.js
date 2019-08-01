var createError = require('http-errors');
var express = require('express');
var path = require('path');
var app = new express();
var bodyParser = require('body-parser');

//使用ejs模板
app.set('view engine', 'ejs');

//配置public目录为静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

//设置bodyParser中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//mongodb数据库连接
var MongoClient = require('mongodb').MongoClient;
var DbUrl = 'mongodb://127.0.0.1:27017/'
// var client = new MongoClient(DbUrl);

//session保存用户信息
var session = require('express-session')
//配置中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
    // cookie: { secure: true }
}))

app.use(function(req,res,next){
    console.log(session.userinfo)
    if(req.url == '/login' || req.url == '/dologin'){
        next()
    }else {
        // console.log(req.session.userinfo)
        if(session.userinfo && session.userinfo.name !=''){
            app.locals['userinfo'] = session.userinfo
            next()
        }else{
            res.redirect('/login')
        }
    }
})

app.get('/',function(req,res){
   res.send('index')
})

app.get('/login', function(req, res, next) {

    res.render('login')
    // res.send('登录');

});

//获取登录提交的数据
app.post('/dologin', function(req, res, next) {
    var params = req.body;
    MongoClient.connect(DbUrl,{useNewUrlParser:true},function(err,client){
        if(err){
            console.log(err)
            return
        }
        var db = client.db('zk')
        var findcollection = db.collection('user');
        findcollection.find(params).toArray(function(error,docs){
            if(docs.length>0){
                session.userinfo = docs[0]
                // res.redirect('/product')
                res.status(200),
                    res.json([{
                        name:'shihzikai'
                    },{
                        name:'admin'
                    }])
            }else{
                res.send('<script>alert("没有该用户，请注册！");location.href="/login"</script>');
            }
            client.close()
        })
    })

});

app.get('/product', function(req, res, next) {
    res.render('product')
    // res.send('np');

});

app.get('/productadd', function(req, res, next) {

    res.send('productadd');

});
//退出登录
app.get('/loginOut', function(req, res, next) {
    //销毁session数据
    req.session.destroy(function(err) {
        res.redirect('/login')
    })

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});


app.listen(3000)

/*
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser')
var app = require('./routes/all');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
//
// var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

*/