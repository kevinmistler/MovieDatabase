-- Data Manipulation Queries

-- SELECT Queries
-- Fetch all movies with their directors
SELECT Movies.movieID, Movies.title, Movies.genre, Movies.releaseYear, Directors.name AS director
FROM Movies
LEFT JOIN Directors ON Movies.directorID = Directors.directorID;

-- Fetch all actors with their movies
SELECT Actors.name AS actorName, Movies.title AS movieTitle
FROM ActorMovies
JOIN Actors ON ActorMovies.actorID = Actors.actorID
JOIN Movies ON ActorMovies.movieID = Movies.movieID;

-- Fetch reviews with movie titles
SELECT Reviews.reviewID, Reviews.rating, Reviews.reviewText, Movies.title AS movieTitle
FROM Reviews
JOIN Movies ON Reviews.movieID = Movies.movieID;

-- INSERT Queries
-- Insert a new director
INSERT INTO Directors (name, birthDate) VALUES ('New Director', '1980-01-01');

-- Insert a new actor
INSERT INTO Actors (name, dateOfBirth) VALUES ('New Actor', '1990-01-01');

-- Insert a new movie
INSERT INTO Movies (title, genre, releaseYear, duration, directorID) 
VALUES ('New Movie', 'Genre', 2023, 120, 1);

-- Insert a new review
INSERT INTO Reviews (movieID, rating, reviewText) 
VALUES (1, 4, 'Great movie!');

-- Insert a new user
INSERT INTO Users (username, email, registrationDate) 
VALUES ('newuser', 'newuser@example.com', CURDATE());

-- Insert a new actor-movie relationship
INSERT INTO ActorMovies (actorID, movieID) VALUES (1, 3);

-- UPDATE Queries
-- Update movie details
UPDATE Movies 
SET title = 'Updated Title', genre = 'Updated Genre', releaseYear = 2022, directorID = NULL
WHERE movieID = 1;

-- Update an actor's details
UPDATE Actors 
SET name = 'Updated Actor', dateOfBirth = '1985-05-05'
WHERE actorID = 1;

-- Update a review
UPDATE Reviews 
SET rating = 5, reviewText = 'This movie is even better on a second watch!'
WHERE reviewID = 1;

-- DELETE Queries
-- Delete a movie
DELETE FROM Movies WHERE movieID = 3;

-- Delete an actor
DELETE FROM Actors WHERE actorID = 2;

-- Delete a review
DELETE FROM Reviews WHERE reviewID = 2;

-- Delete an actor-movie relationship
DELETE FROM ActorMovies WHERE actorID = 1 AND movieID = 1;
