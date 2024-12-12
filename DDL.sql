--Data Definition Queries

-- Drop tables if they exist
DROP TABLE IF EXISTS ActorMovies, Reviews, Movies, Actors, Directors, Users;

-- Create Directors Table
CREATE TABLE Directors (
    directorID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birthDate DATE
);

-- Create Actors Table
CREATE TABLE Actors (
    actorID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dateOfBirth DATE
);

-- Create Movies Table
CREATE TABLE Movies (
    movieID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    releaseYear INT NOT NULL,
    duration INT NOT NULL,
    directorID INT,
    FOREIGN KEY (directorID) REFERENCES Directors(directorID) ON DELETE SET NULL
);

-- Create Reviews Table
CREATE TABLE Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    movieID INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    reviewText TEXT,
    FOREIGN KEY (movieID) REFERENCES Movies(movieID) ON DELETE CASCADE
);

-- Create Users Table
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    registrationDate DATE NOT NULL
);

-- Create ActorMovies Table (M:N Relationship)
CREATE TABLE ActorMovies (
    actorID INT NOT NULL,
    movieID INT NOT NULL,
    PRIMARY KEY (actorID, movieID),
    FOREIGN KEY (actorID) REFERENCES Actors(actorID) ON DELETE CASCADE,
    FOREIGN KEY (movieID) REFERENCES Movies(movieID) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO Directors (name, birthDate) VALUES 
    ('Christopher Nolan', '1970-07-30'),
    ('Steven Spielberg', '1946-12-18'),
    ('Quentin Tarantino', '1963-03-27');

INSERT INTO Actors (name, dateOfBirth) VALUES 
    ('Leonardo DiCaprio', '1974-11-11'),
    ('Kate Winslet', '1975-10-05'),
    ('Morgan Freeman', '1937-06-01');

INSERT INTO Movies (title, genre, releaseYear, duration, directorID) VALUES 
    ('Inception', 'Sci-Fi', 2010, 148, 1),
    ('Titanic', 'Drama', 1997, 2),
    ('The Dark Knight', 'Action', 2008, 152, 1);

INSERT INTO Reviews (movieID, rating, reviewText) VALUES 
    (1, 5, 'Amazing movie with a mind-bending plot!'),
    (2, 4, 'Classic love story, beautifully directed.'),
    (3, 5, 'Outstanding performances and direction.');

INSERT INTO Users (username, email, registrationDate) VALUES 
    ('johndoe', 'john@example.com', '2023-01-15'),
    ('janedoe', 'jane@example.com', '2023-02-10'),
    ('admin', 'admin@example.com', '2023-03-01');

INSERT INTO ActorMovies (actorID, movieID) VALUES 
    (1, 1), -- Leonardo DiCaprio in Inception
    (1, 2), -- Leonardo DiCaprio in Titanic
    (2, 2); -- Kate Winslet in Titanic
