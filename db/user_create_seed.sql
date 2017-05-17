-- It may be helpful to drop and reinstantilize the table when doing
-- the tests in case you delete users/cars the tests are expecting to see
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

create table users(
	id SERIAL primary key,
	firstname text,
	lastname text,
	email varchar(40)
);


insert into users(firstname, lastname, email) values('John', 'Smith', 'John@Smith.com'),
('Dave', 'Davis', 'Dave@Davis.com'),
('Jane', 'Janis', 'Jane@Janis.com');

