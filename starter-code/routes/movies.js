const express = require("express");
const router = express.Router();
const withDbConnection = require("./../withDbConnection");
const Movie = require("./../models/movie");

//list the movies
router.get("/", (req, res, next) => {
  withDbConnection(async () => {
    try {
      let movies = await Movie.find();
      movies.sort((a, b) => a.title.localeCompare(b.title));

      let moviesN;
      if (movies.length > 1) moviesN = `There are ${movies.length} movies`;
      else if (movies.length === 1) moviesN = `There is 1 movie`;
      else moviesN = `There are no movies`;

      res.render("movies/index", {
        movies,
        moviesN,
        navMovies: true
      });
    } catch (error) {
      next(error);
    }
  });
});

//add new movie
router.get("/new", (req, res, next) =>
  res.render("movies/new", { navMovies: true })
);

router.post("/", (req, res, next) => {
  const { title, genre, plot } = req.body;
  const newMovie = new Movie({ title, genre, plot });
  withDbConnection(async () => {
    try {
      await newMovie.save();
      res.redirect("/movies");
    } catch (error) {
      console.log(error);
      res.render("movies/new", {
        errorMessage: "The movie must have a title!",
        navMovies: true
      });
    }
  });
});

//movie details
router.get("/:id", (req, res, next) => {
  withDbConnection(async () => {
    try {
      const movie = await Movie.findById(req.params.id);
      res.render("movies/show", { movie, navMovies: true });
    } catch (error) {
      next(error);
    }
  });
});

//delete movie
router.post("/:id/delete", (req, res, next) => {
  withDbConnection(async () => {
    try {
      const movie = await Movie.findById(req.params.id);
      await Movie.deleteOne(movie);
      res.redirect("/movies");
    } catch (error) {
      next(error);
    }
  });
});

//update movie
router.get("/:id/edit", (req, res, next) => {
  withDbConnection(async () => {
    try {
      const movie = await Movie.findOne({ _id: { $eq: req.params.id } });
      res.render("movies/edit", { movie, navMovies: true });
    } catch (error) {
      next(error);
    }
  });
});

router.post("/:id", (req, res, next) => {
  const { title, genre, plot } = req.body;
  withDbConnection(async () => {
    try {
      await Movie.findByIdAndUpdate(req.params.id, {
        title,
        genre,
        plot
      });
      res.redirect("/movies");
    } catch (error) {
      next(error);
    }
  });
});

module.exports = router;
