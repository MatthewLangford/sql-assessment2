import test from 'ava'
import request from 'supertest-as-promised'
import app from './index'
// import Faker from 'faker'

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

test.before(function(){
  return sleep(1000).then(function(){
  });
})

test('Get Users request works and returns correct users', async t=>{
  const res = await request(app)
    .get('/api/users')
    .expect(200)
  t.is(res.status, 200, 'Status is not 200')
  t.truthy(res.body.length >=3, 'There should be at least 3 users')
  var missing = res.body.reduce(
    function(prev, cur){
      if (prev.indexOf(cur.firstname) >-1){
        prev.splice(prev.indexOf(cur.firstname),1);
      }
      return prev;
    },["Dave","John","Jane"]);
  t.truthy(missing.length === 0, missing.join(", ") + " are missing from the database");
})

test('Get Vehicles request works and returns correct users', async t=>{
  const res = await request(app)
    .get('/api/vehicles')
    .expect(200)
  t.is(res.status, 200, 'Status is not 200')
  t.truthy(res.body.length >=6, 'There should be at least 6 vehicles')
  var missing = res.body.reduce(
    function(prev, cur){
      if (prev.indexOf(cur.model) >-1){
        prev.splice(prev.indexOf(cur.model),1);
      }
      return prev;
    },["Camry","Civic","Focus", "Taurus","Bug","Coup"]);
  t.truthy(missing.length === 0, "The " + missing.join(", ") + " are missing from the database");
})

test('Post User works', async t=>{
  var checkId = Math.floor(Math.random()*100);
  var newUser = {firstname:"Mr", lastname:"Clean", email:"Clean@Machine."+checkId}
  const res = await request(app)
    .post('/api/users')
    .send(newUser)

  t.is(res.status, 200, 'Status is not 200');
  let userCheckData = await request(app)
    .get('/api/users')

  t.is(userCheckData.status, 200, "GET Users endpoint must be written to evaluate test")
  let foundUser = userCheckData.body.reduce((prev, cur) => {
    return prev || cur.email == newUser.email;
  }, false)

  t.truthy(foundUser, "New user was not found in the database");
})

test('Post Vehicle works', async t=>{
  var year = Math.floor(Math.random()*100+2200);
  var newUser = {make:"Bat", model:"Mobile", year:year, ownerId:2}
  const res = await request(app)
    .post('/api/vehicles')
    .send(newUser)

  t.is(res.status, 200, 'Status is not 200');
  await sleep(100);
  let vehicleCheckData = await request(app)
    .get('/api/vehicles')
  t.is(vehicleCheckData.status, 200, "GET Vehicles endpoint must be written to evaluate test")
  let foundUser = vehicleCheckData.body.reduce((prev, cur) => {
    return prev || cur.year == newUser.year;
  }, false)
  t.truthy(foundUser, "New vehicle was not found in the database");
})

test('Get Count of Vehicles By owner\'s Id' ,async t =>{
const res = await request(app)
  .get('/api/user/1/vehiclecount')
  let db = app.get('db');
  db.run('SELECT Count(*) FROM vehicles WHERE ownerId = 1',
  function(err, response){
    t.is(res.status, 200, 'Status is not 200')
    t.truthy(res.body.count, 'Expected an object with a count property')
    t.is(res.body.count, response[0].count, 'The count is not correct.')
  });

})

test('Get Vehicles By owner\'s Id' ,async t =>{
const res = await request(app)
  .get('/api/user/1/vehicle')
    t.is(res.status, 200, 'Status is not 200')
    t.truthy(res.body.length, 'Expected an object with a count property')
    t.truthy(res.body[0].make, 'Expected a make propety')
    t.truthy(res.body[0].model, 'Expected a model property')
    var checkId = res.body.reduce(function(prev, cur){
      if (!prev) return prev;
      return cur.ownerId = 1;
    },true)
    t.truthy(checkId, 'Not all cars returned have ownerId of 1');
})

test('Get Vehicles By Email' ,async t =>{
const res = await request(app)
  .get('/api/vehicle?UserEmail=John@Smith.com')
    t.is(res.status, 200, 'Status is not 200')
    // t.is(res.body.length >=3 , 'Expected at least 3 cars for John@Smith.com')
    t.truthy(res.body[0].email, 'Expected to see an email propety')
    t.truthy(res.body[0].make, 'Expected to see a make propety')
    t.truthy(res.body[0].model, 'Expected to see a model propety')
    var checkEmail = res.body.reduce(function(prev, cur){
      if (!prev) return prev;
      return cur.email = "John@Smith.com"
    },true)
    t.truthy(checkEmail, 'Not all vehicles returned were for John@Smith.com')
})

test('Get Vehicles By Partial First Name' ,async t =>{
const res = await request(app)
  .get('/api/vehicle?userFirstStart=J')
    t.is(res.status, 200, 'Status is not 200')
    // t.is(res.body.length >=3 , 'Expected at least 3 cars for John@Smith.com')
    t.truthy(res.body[0].firstname, 'Expected to see a firstname propety')
    t.truthy(res.body[0].make, 'Expected to see a make propety')
    t.truthy(res.body[0].model, 'Expected to see a model propety')
    t.truthy(res.body[0].year, 'Expected to see a year propety')
    var checkEmail = res.body.reduce(function(prev, cur){
      if (!prev) return prev;
      return cur.firstname[0] == "J"
    },true)
    var missing = res.body.reduce(
      function(prev, cur){
        if (prev.indexOf(cur.firstname) >-1){
          prev.splice(prev.indexOf(cur.firstname),1);
        }
        return prev;
      },["Jane","John"]);
    t.is(missing.length,0, missing.join(", ") + ' should have pulled up in this query')
})

test('Get Vehicles newer than 2000, sort newest first' ,async t =>{
const res = await request(app)
  .get('/api/newervehiclesbyyear')
    t.is(res.status, 200, 'Status is not 200')

    t.truthy(res.body.length, 'Expected at least 1 new car')
    t.truthy(res.body[0].firstname, 'Expected owners firstname')
    t.truthy(res.body[0].lastname, 'Expected owners lastname')

    t.truthy(res.body[0].year - res.body[res.body.length - 1 ].year>=0, 'Expected newest cars first')
})

test('Update Vehicle to new Owner', async t =>{
  const getCars = await request(app)
    .get('/api/vehicles')

    t.is(getCars.status, 200, "Must write GET /api/vehicles endpoint before this test")

  var car = getCars.body.reduce(function(prev, cur){
    if(cur.ownerid == 2){
      return cur;
    }
    return prev;
  },{})
  const updateRequest = await request(app)
    .put('/api/vehicle/' + car.id + '/user/3')
    t.is(updateRequest.status, 200, "Update Request Status should be 200")
  const getCars2 = await request(app)
    .get('/api/vehicles')

    let match = getCars2.body.reduce(function (prev, cur){
      return prev || (cur.id==car.id?cur.ownerid:0);
    }, 0);

    t.is(match, 3, "Car should be updated to ownerId of 3");
});

test('Remove Vehicles Owner', async t =>{
  const getCars = await request(app)
    .get('/api/vehicles')
    t.is(getCars.status, 200, "Must write GET /api/vehicles endpoint before this test")
  var car = getCars.body.reduce(function(prev, cur){
    if(cur.ownerid == 3){
      return cur;
    }
    return prev;
  },{})

  const updateRequest = await request(app)
    .delete('/api/user/3/vehicle/' + car.id)
    t.is(updateRequest.status, 200, "Update Request Status should be 200")
  const getCars2 = await request(app)
    .get('/api/vehicles')
    let match = getCars2.body.reduce(function (prev, cur){
      return prev || (cur.id==car.id?cur.ownerid:0);
    }, 0);
    t.truthy(!match,"ownerId not removed from vehicle");
});

test('Deleting A Vehicle', async t=>{
  await sleep(1000)
  var newUser = {make:"Delete", model:"Me", year:11, ownerId:1}
  const makeCar = await request(app)
    .post('/api/vehicles')
    .send(newUser)

  const findCar = await request(app)
    .get('/api/vehicles')
  t.is(findCar.status, 200, "The Get Vehicles endpoint is not working");
  const car = findCar.body.reduce(function(prev, cur){
    if(cur.make == "Delete") return cur;
    return prev;
  },{})

  t.truthy(car.id, "Not Creating new cars");

  const deleteRes = await request(app)
    .delete('/api/vehicle/' + car.id)

  t.is(deleteRes.status, 200, "Delete Request status not 200");

  const checkCars = await request(app)
    .get('/api/vehicles')

  t.is(checkCars.status, 200, "Request status not 200");
  var carGone = checkCars.body.reduce(function(prev, cur){
    if (cur.id == car.id) prev = false;
    return prev
  },true)
  t.truthy(checkCars.body.length, "Should not delete all cars");
  t.truthy(carGone, "The car was not removed");
})
