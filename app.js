var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
const mongojs = require('mongojs');
var db = mongojs('customerapp', ['users'])

var app = express();

// var logger = function(req, res, next){
//     console.log('logging');
//     next();
// }

// app.use(logger);

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// set static path
app.use(express.static(path.join(__dirname, 'public')));

//global vars
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// var users = [
//     {
//         id: 1,
//         first_name: 'John',
//         last_name: 'Doe',
//         email: 'johndoe@gmail.com'
//     },
//     {
//         id: 2,
//         first_name: 'bob',
//         last_name: 'smith',
//         email: 'bobsmith@gmail.com'
//     },
//     {
//         id: 3,
//         first_name: 'jill',
//         last_name: 'jackson',
//         email: 'jjackson@gmail.com'
//     }
// ]

app.get('/', function(req, res){
    db.users.find(function(err, docs){
        console.log(docs)
        if(err) throw err;
        res.render('index',{
            title: 'Customers',
            users: docs
        });
    });
});

app.post('/users/add', function(req,res){

    req.checkBody ('first_name', 'First Name is Required').notEmpty();
    req.checkBody ('last_name', 'Last Name is Required').notEmpty();
    req.checkBody ('email', 'Email is Required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('index',{
            title: 'Customers',
            users: users,
            errors: errors
        });
    }else{
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
        
        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
        });
    }

});

app.delete('/users/delete/:id', function(req,res){
    console.log(req.params.id);
    db.users.remove({_id: mongojs.ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/')
    })
});

app.listen(3000, function () {
    console.log('Server started on port 3000');
})