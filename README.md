# sql-assessment

## Setup

You have a starting node server.

* Create a database called assessbox and do your database work there.
* You will need to set up and use massive.

## Running Tests
Tests can be run automatically. After setup, run `npm test` to check tests.

## Users

Using the `user_create_seed.sql`

Create a table called Users that has an id, firstname, lastname, and an email
* Insert 3 records into Users:

```
John Smith - John@Smith.com
Dave Davis - Dave@Davis.com
Jane Janis - Jane@Janis.com
```

## Vehicles

Using the `vehicle_create_seed.sql`

Create a table called Vehicles that has an id, make, model, year, and ownerId (a foreign key to users)

* Insert 6 records into Vehicles.  Below you find the make, model, year, and ownerId (for the foreign key)
```
Toyota Camry 1991 - John Smith
Honda Civic 1995 - John Smith
Ford Focus 2005 - John Smith
Ford Taurus 2003 - Dave Davis
VW Bug 2010 - Dave Davis
Mini Coup 2013 - Jane Janis
```

## Endpoints & Queries
GOTCHA: It's important to know that express converts values passed into and accessed off of 'params' into strings. This might not match the data types you set in your schema and will result in errors if they don't.
* Create an endpoint at `GET '/api/users'` that will query the database and get all users.
* Create an endpoint at `GET '/api/vehicles'` that will query the database and get all vehicles.
* Create an endpoint at `POST '/api/users'` that will take a user from the body and add them to the database
* Create an endpoint at `POST '/api/vehicles'` that will take a vehicle from the body and add it to the database
* Create an endpoint at `GET '/api/user/:userId/vehiclecount'` that will return a count of how many vehicles belong to the given user  
  Response should be an object with a count property ie: `{count:1}`
* Create an endpoint at `GET '/api/user/:userId/vehicle'` that will find all vehicles that belong to the user with the provided users id
* Create an endpoint at `GET '/api/vehicle?UserEmail=email'` that will find all vehicles that belong to the user with the provided users Email
* Use the above endpoint to also handle `GET '/api/vehicle?userFirstStart=letters'` to get all vehicles for any user whose first name starts with the provided letters
* Create an endpoint at `GET '/api/newervehiclesbyyear'` that gets all vehicles newer than 2000 and sorted by year with the newest car first with the owner first and last name
* Create an endpoint at `PUT '/api/vehicle/:vehicleId/user/:userId'` that changes the ownership of the provided vehicle to be the new user.
* Create an endpoint at `DELETE '/api/user/:userId/vehicle/:vehicleId'` that removes ownership of that vehicle from the provided user, but does not delete the vehicle
* Create an endpoint at `DELETE '/api/vehicle/:vehicleId'` that deletes the specified vehicle
