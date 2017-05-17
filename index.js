let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let massive = require('massive');
let pw = require('./.pw');
let app = express();
//Need to enter username and password for your database
let connString = "postgres://postgres:"+ pw.pw +"@localhost/assessbox";
let count = 4;
let vCount = 7;

app.use(bodyParser.json());
app.use(cors());

//The test doesn't like the Sync version of connecting,
//  Here is a skeleton of the Async, in the callback is also
//  a good place to call your database seeds.
let db = massive.connect({connectionString : connString},
    function(err, localdb){
        db = localdb;
        app.set('db', db);

        db.user_create_seed(function(err, result){
            if(err){
                console.log(err)
            }
            console.log("User Table Init");
        });
        db.vehicle_create_seed(function(){
            if(err){
                console.log(err)
            }
            console.log("Vehicle Table Init")
        });
    });

app.get('/api/users', (req, res, next)=>{
    db.run('SELECT * FROM users', (err, users) =>{
        if (err){
            console.log(err)
        }else {
            res.json(users)
        }
    })
});

app.get('/api/vehicles', (req,res,next)=>{
    db.run('SELECT * FROM vehicles', (err, result)=>{
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
});

app.get('/api/user/:userId/vehiclecount', (req, res, next)=>{
    db.run('SELECT count(make) from users u join vehicles v on u.id = v.OwnerId WHERE u.id = $1', [parseInt(req.params.id)],(err, result)=>{
        res.json({count: result})
    })
});

app.get('/api/user/:userId/vehicle', (req, res, next)=>{
    db.run('SELECT make, model, year from vehicles WHERE ownerId = (select id from users where id = $1)', [parseInt(req.params.userId)],(err, result)=>{
        res.status(200).json(result)
    })
});

app.get('/api/vehicle', (req, res, next) => {
    if(req.query.UserEmail) {
        db.run('SELECT * from users u JOIN vehicles v ON u.id = v.ownerId WHERE u.email = $1', [req.query.UserEmail], (err, result) => {
            res.status(200).json(result);
        });
    }else if(req.query.userFirstStart){
        db.run('SELECT * from users u join vehicles v on u.id = v.ownerId where u.firstname like $1', [req.query.userFirstStart + '%'], (err, result) => {
            res.status(200).json(result);
        });
    }
});

app.get('/api/newervehiclesbyyear', (req, res, next)=>{
    db.run('SELECT firstname, lastname, make, model, year from vehicles v join users u on u.id = v.ownerId where v.year > 2000 order by year desc', (err, result)=>{
        res.json(result);
    });

});
app.put('/api/vehicle/:vehicleId/user/:userId', (req, res, next)=>{
    db.run('UPDATE vehicles SET ownerId = $1 where id = $2', [parseInt(req.params.userId), parseInt(req.params.vehicleId)], (err, result)=>{
        res.json(result);
    })
});

app.delete('/api/user/:userId/vehicle/:vehicleId', (req, res, next)=>{
    db.run('Update vehicles SET ownerId = null where id = $1', [parseInt(req.params.vehicleId)], (err, result)=>{
        res.json(result);
    })
});

app.delete('/api/vehicle/:vehicleId', (req, res, next)=>{
    db.run('DELETE from vehicles where id = $1', [parseInt(req.params.vehicleId)], (err, result)=>{
        res.send('ok');
    })
});

app.post('/api/users', (req, res, next) =>{
    db.run("insert into users (firstname, lastname, email) values($1, $2, $3)",[req.body.firstname, req.body.lastname, req.body.email],(err, user)=> {
        if(err){
            console.log(err)
        }
        res.json(user);
    });
});

app.post('/api/vehicles', (req, res, next) =>{

    db.run("insert into vehicles (make, model, year, ownerId) values($1, $2, $3, $4)",[req.body.make, req.body.model, req.body.year, req.body.ownerId],(err, vehicle)=> {
        if(err){
            console.log(err)
        }
        res.json(vehicle);
    });
});

app.listen('3000', function(){
    console.log("Successfully listening on : 3000")
});

module.exports = app;