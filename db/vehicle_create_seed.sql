drop table if exists vehicles;
create table vehicles(
	id SERIAL primary key,
	make text,
	model text,
	year integer,
	ownerId integer references users(id)
);
insert into vehicles(make, model, year, ownerId) values('Toyota', 'Camry', 1991, 1),
('Honda', 'Civic', 1995, 1),
('Ford', 'Focus', 2005, 1),
('Ford', 'Taurus', 2003, 2),
('VW', 'Bug', 2010, 2),
('Mini', 'Coup', 2013, 3);
