/*
    SETUP
*/
// Express
const express = require('express');
const app = express();
const path = require('path');
const PORT = 45854;

// Database
const db = require('./db-connector');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

/*
    ROUTES
*/

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manage Movies
app.get('/manage_movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage_movies.html'));
});

// Manage Actors
app.get('/manage_actors', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage_actors.html'));
});

// Manage Directors
app.get('/manage_directors', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage_directors.html'));
});

// Manage Reviews
app.get('/manage_reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage_reviews.html'));
});

// Movies and Actors
app.get('/movies_actors', (req, res) => {
    res.sendFile(path.join(__dirname, 'movies_actors.html'));
});

// Browse Movies
app.get('/browse_movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'browse_movies.html'));
});

// Add Movie Page
app.get('/add_movie', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_movie.html'));
});

// Manage Users
app.get('/manage_users', (req, res) => {
    res.sendFile(path.join(__dirname, 'manage_users.html'));
});

/*
    API ROUTES FOR DYNAMIC CONTENT
*/

// Fetch movie data
app.get('/api/browse_movies', (req, res) => {
    const { title = '' } = req.query;
    const query = `
        SELECT Movies.movieID, Movies.title, Movies.genre, Movies.releaseYear, Directors.name AS director
        FROM Movies
        LEFT JOIN Directors ON Movies.directorID = Directors.directorID
        WHERE Movies.title LIKE ?
        ORDER BY Movies.title;
    `;

    db.pool.query(query, [`%${title}%`], (err, results) => {
        if (err) {
            console.error("Error fetching movies:", err);
            return res.status(500).json({ error: "Error fetching movies" });
        }
        res.json(results); // Return the JSON data
    });
});

// Fetch Movies
app.get('/get_movies', (req, res) => {
    const query = `SELECT movieID, title FROM Movies ORDER BY title`;
    db.pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching movies:", err);
            return res.status(500).json({ error: "Error fetching movies" });
        }
        res.json(results);
    });
});

// Fetch Reviews
app.get('/get_reviews', (req, res) => {
    const query = `
        SELECT Reviews.reviewID, Reviews.rating, Reviews.reviewText, Movies.title
        FROM Reviews
        JOIN Movies ON Reviews.movieID = Movies.movieID;
    `;
    db.pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching reviews:", err);
            return res.status(500).json({ error: "Error fetching reviews" });
        }
        res.json(results);
    });
});

// Fetch Actors
app.get('/get_actors', (req, res) => {
    const query = `SELECT actorID, name FROM Actors ORDER BY name`;
    db.pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching actors:", err);
            return res.status(500).json({ error: "Error fetching actors" });
        }
        res.json(results);
    });
});

// API route to fetch actors based on search name
app.get('/api/manage_actors', (req, res) => {
    const { name = '' } = req.query;
    const query = `SELECT * FROM Actors WHERE name LIKE ? ORDER BY name`;

    db.pool.query(query, [`%${name}%`], (err, results) => {
        if (err) {
            console.error("Error fetching actors:", err);
            return res.status(500).json({ error: "Error fetching actors" });
        }
        res.json(results);
    });
});

// Fetch Movie-Actor Relationships
app.get('/get_movies_actors', (req, res) => {
    const query = `
        SELECT 
            Actors.actorID, Actors.name AS actorName, 
            Movies.movieID, Movies.title AS movieTitle, 
            Movies.releaseYear
        FROM 
            Actors
        INNER JOIN 
            ActorMovies ON Actors.actorID = ActorMovies.actorID
        INNER JOIN 
            Movies ON Movies.movieID = ActorMovies.movieID
        ORDER BY 
            actorName, movieTitle;
    `;

    db.pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching movies and actors:", err);
            return res.status(500).json({ error: "Error fetching movies and actors" });
        }
        res.json(results);
    });
});

// Fetch Directors
app.get('/get_directors', (req, res) => {
    const { name = '' } = req.query;
    const query = `SELECT directorID, name FROM Directors WHERE name LIKE ? ORDER BY name`;

    db.pool.query(query, [`%${name}%`], (err, results) => {
        if (err) {
            console.error("Error fetching directors:", err);
            return res.status(500).json({ error: "Error fetching directors" });
        }
        res.json(results);
    });
});

// Fetch Users
app.get('/get_users', (req, res) => {
    const query = `SELECT userID, username, email, registrationDate FROM Users ORDER BY registrationDate DESC`;

    db.pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: "Error fetching users" });
        }
        res.json(results);
    });
});

/*
    POST ROUTES FOR OPERATIONS
*/

// Add a new movie
app.post('/add_movie', (req, res) => {
    const { title, genre, releaseYear, duration, director, newDirector } = req.body;

    const insertDirectorQuery = 'INSERT INTO Directors (name) VALUES (?)';
    const movieQuery = 'INSERT INTO Movies (title, genre, releaseYear, duration, directorID) VALUES (?, ?, ?, ?, ?)';
    const directorQuery = 'SELECT directorID FROM Directors WHERE name = ?';

    // Case 1: No Director is selected
    if (!director || director.trim() === "") {
        db.pool.query(movieQuery, [title, genre, releaseYear, duration, null], (err) => {
            if (err) {
                console.error("Error adding movie with NULL director:", err.message);
                return res.status(500).send("Error adding movie.");
            }
            res.redirect('/browse_movies'); // Redirect to Browse Movies page
        });
    }
    // Case 2: Add New Director
    else if (director === "NEW_DIRECTOR" && newDirector && newDirector.trim() !== "") {
        db.pool.query(insertDirectorQuery, [newDirector], (err, results) => {
            if (err) {
                console.error("Error inserting new director:", err.message);
                return res.status(500).send("Error adding new director.");
            }
            const newDirectorID = results.insertId; // Get the new director's ID
            db.pool.query(movieQuery, [title, genre, releaseYear, duration, newDirectorID], (err) => {
                if (err) {
                    console.error("Error adding movie with new director:", err.message);
                    return res.status(500).send("Error adding movie.");
                }
                res.redirect('/browse_movies'); // Redirect to Browse Movies page
            });
        });
    }
    // Case 3: Existing Director is selected
    else {
        db.pool.query(directorQuery, [director], (err, results) => {
            if (err) {
                console.error("Error checking director:", err.message);
                return res.status(500).send("Error processing request.");
            }

            if (results.length > 0) {
                const directorID = results[0].directorID; // Get the existing director's ID
                db.pool.query(movieQuery, [title, genre, releaseYear, duration, directorID], (err) => {
                    if (err) {
                        console.error("Error adding movie with existing director:", err.message);
                        return res.status(500).send("Error adding movie.");
                    }
                    res.redirect('/browse_movies'); // Redirect to Browse Movies page
                });
            } else {
                res.status(400).send("Invalid director selection.");
            }
        });
    }
});

// Edit Movie
app.post('/edit_movie', (req, res) => {
    const { movieID, title, genre, releaseYear, director } = req.body;

    let updateMovieQuery;
    let queryParams;

    if (!director || director === "") {
        // No Director selected, set directorID to NULL
        updateMovieQuery = `
            UPDATE Movies 
            SET title = ?, genre = ?, releaseYear = ?, directorID = NULL 
            WHERE movieID = ?;
        `;
        queryParams = [title, genre, releaseYear, movieID];
    } else {
        // Director selected, use the provided directorID
        updateMovieQuery = `
            UPDATE Movies 
            SET title = ?, genre = ?, releaseYear = ?, directorID = ? 
            WHERE movieID = ?;
        `;
        queryParams = [title, genre, releaseYear, director, movieID];
    }

    db.pool.query(updateMovieQuery, queryParams, (err) => {
        if (err) {
            console.error("Error updating movie:", err);
            return res.status(500).send("Error updating movie.");
        }
        res.redirect('/browse_movies'); // Redirect to Browse Movies page
    });
});

app.post('/delete_movie', (req, res) => {
    const { movieID } = req.body;
    const query = 'DELETE FROM Movies WHERE movieID = ?';

    db.pool.query(query, [movieID], (err) => {
        if (err) {
            console.error("Error deleting movie:", err);
            return res.status(500).send("Error deleting movie.");
        }
        res.redirect('/browse_movies');
    });
});

// Add Actor-Movie Relationship
app.post('/add_actor_movie', (req, res) => {
    const { actorID, movieID } = req.body;
    const query = 'INSERT INTO ActorMovies (actorID, movieID) VALUES (?, ?)';

    db.pool.query(query, [actorID, movieID], (err) => {
        if (err) {
            console.error("Error adding actor-movie relationship:", err);
            return res.status(500).send("Error adding relationship.");
        }
        res.redirect('/movies_actors');
    });
});

// Delete Actor-Movie Relationship
app.post('/delete_actor_movie', (req, res) => {
    const { actorID, movieID } = req.body;
    const query = 'DELETE FROM ActorMovies WHERE actorID = ? AND movieID = ?';

    db.pool.query(query, [actorID, movieID], (err) => {
        if (err) {
            console.error("Error deleting actor-movie relationship:", err);
            return res.status(500).send("Error deleting relationship.");
        }
        res.redirect('/movies_actors');
    });
});

// Update Actor-Movie Relationship
app.post('/update_actor_movie', (req, res) => {
    const { oldActorID, oldMovieID, newActorID, newMovieID } = req.body;
    const query = `
        UPDATE ActorMovies
        SET actorID = ?, movieID = ?
        WHERE actorID = ? AND movieID = ?;
    `;
    db.pool.query(query, [newActorID, newMovieID, oldActorID, oldMovieID], (err) => {
        if (err) {
            console.error("Error updating actor-movie relationship:", err);
            return res.status(500).send("Error updating relationship.");
        }
        res.redirect('/movies_actors'); // Redirect back to the Movies and Actors page
    });
});

// Add a Director
app.post('/add_director', (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO Directors (name) VALUES (?)';

    db.pool.query(query, [name], (err) => {
        if (err) {
            console.error("Error adding director:", err);
            return res.status(500).send("Error adding director.");
        }
        res.redirect('/manage_directors');
    });
});

// Edit a Director
app.post('/edit_director', (req, res) => {
    const { directorID, name } = req.body;
    const query = 'UPDATE Directors SET name = ? WHERE directorID = ?';

    db.pool.query(query, [name, directorID], (err) => {
        if (err) {
            console.error("Error editing director:", err);
            return res.status(500).send("Error editing director.");
        }
        res.redirect('/manage_directors');
    });
});

// Delete a Director
app.post('/delete_director', (req, res) => {
    const { directorID } = req.body;
    const query = 'DELETE FROM Directors WHERE directorID = ?';

    db.pool.query(query, [directorID], (err) => {
        if (err) {
            console.error("Error deleting director:", err);
            return res.status(500).send("Error deleting director.");
        }
        res.redirect('/manage_directors');
    });
});

// Add a User
app.post('/add_user', (req, res) => {
    const { username, email } = req.body;
    const registrationDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    const query = 'INSERT INTO Users (username, email, registrationDate) VALUES (?, ?, ?)';

    db.pool.query(query, [username, email, registrationDate], (err) => {
        if (err) {
            console.error("Error adding user:", err);
            return res.status(500).send("Error adding user.");
        }
        res.redirect('/manage_users');
    });
});

// Edit a User
app.post('/edit_user', (req, res) => {
    const { userID, username, email } = req.body;
    const query = 'UPDATE Users SET username = ?, email = ? WHERE userID = ?';

    db.pool.query(query, [username, email, userID], (err) => {
        if (err) {
            console.error("Error editing user:", err);
            return res.status(500).send("Error editing user.");
        }
        res.redirect('/manage_users');
    });
});

// Delete a User
app.post('/delete_user', (req, res) => {
    const { userID } = req.body;
    const query = 'DELETE FROM Users WHERE userID = ?';

    db.pool.query(query, [userID], (err) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).send("Error deleting user.");
        }
        res.redirect('/manage_users');
    });
});

// Add a new actor
app.post('/add_actor', (req, res) => {
    const { name, dateOfBirth } = req.body;
    const query = 'INSERT INTO Actors (name, dateOfBirth) VALUES (?, ?)';
    db.pool.query(query, [name, dateOfBirth], (err) => {
        if (err) {
            console.error("Error adding actor:", err);
            return res.status(500).send("Error adding actor to the database.");
        }
        res.redirect('/manage_actors');
    });
});

app.post('/edit_actor', (req, res) => {
    const { actorID, name, dateOfBirth } = req.body;
    const query = 'UPDATE Actors SET name = ?, dateOfBirth = ? WHERE actorID = ?';

    db.pool.query(query, [name, dateOfBirth, actorID], (err) => {
        if (err) {
            console.error("Error updating actor:", err);
            return res.status(500).send("Error updating actor.");
        }
        res.redirect('/manage_actors');
    });
});

app.post('/delete_actor', (req, res) => {
    const { actorID } = req.body;
    const query = 'DELETE FROM Actors WHERE actorID = ?';

    db.pool.query(query, [actorID], (err) => {
        if (err) {
            console.error("Error deleting actor:", err);
            return res.status(500).send("Error deleting actor.");
        }
        res.redirect('/manage_actors');
    });
});

app.post('/add_review', (req, res) => {
    const { movieID, rating, reviewText } = req.body;
    const query = 'INSERT INTO Reviews (movieID, rating, reviewText) VALUES (?, ?, ?)';

    db.pool.query(query, [movieID, rating, reviewText], (err) => {
        if (err) {
            console.error("Error adding review:", err);
            return res.status(500).send("Error adding review.");
        }
        res.redirect('/manage_reviews');
    });
});

app.post('/edit_review', (req, res) => {
    const { reviewID, rating, reviewText } = req.body;
    const query = 'UPDATE Reviews SET rating = ?, reviewText = ? WHERE reviewID = ?';

    db.pool.query(query, [rating, reviewText, reviewID], (err) => {
        if (err) {
            console.error("Error editing review:", err);
            return res.status(500).send("Error editing review.");
        }
        res.redirect('/manage_reviews');
    });
});

app.post('/delete_review', (req, res) => {
    const { reviewID } = req.body;
    const query = 'DELETE FROM Reviews WHERE reviewID = ?';

    db.pool.query(query, [reviewID], (err) => {
        if (err) {
            console.error("Error deleting review:", err);
            return res.status(500).send("Error deleting review.");
        }
        res.redirect('/manage_reviews');
    });
});

/*
    LISTENER
*/
app.listen(PORT, () => {
    console.log(`Server running at http://classwork.engr.oregonstate.edu:${PORT}`);
});
