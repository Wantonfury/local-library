const Genre = require("../models/genre");
const Book = require('../models/book');

const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort({ name: 1 })
    .exec((err, list_genres) => {
      if (err) return next(err);
      
      res.render('genre_list', {
        title: "Genre List",
        genre_list: list_genres
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    
    genre_books(callback) {
      Book.find({ genre: req.params.id}).exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    
    if (results.genre == null) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    
    res.render("genre_detail", {
      title: "Genre Detail",
      genre: results.genre,
      genre_books: results.genre_books
    });
  });
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name required.").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    
    if (!errors.isEmpty()) {
      return res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array()
      });
    }
    
    Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
      if (err) return next(err);
      if (found_genre) return res.redirect(found_genre.url);
      
      genre.save(err => {
        if (err) return next(err);
      }, res.redirect(genre.url));
    });
  }
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    
    genre_books(callback) {
      Book.find({ genre: req.params.id }).exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    
    if (results.genre == null) {
      res.redirect('catalog/genres');
    }
    
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genre_books
    });
  });
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.body.genreid).exec(callback);
    },
    
    genre_books(callback) {
      Book.find({ genre: req.body.genreid }).exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    
    if (results.genre_books.length > 0) {
      return res.render('genre_delete', {
        title: "Delete Genre",
        genre: results.genre,
        genre_books: results.genre_books
      });
    }
    
    Genre.findByIdAndRemove(req.body.genreid, err => {
      if (err) return next(err);
      res.redirect('catalog/genres');
    });
  });
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre) => {
    res.render('genre_form', {
      title: 'Update Genre',
      genre
    })
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id
    });
    
    if (!errors.isEmpty()) {
      return res.render('genre_form', {
        title: 'Update Genre',
        genre,
        errors: errors.array()
      });
    }
    
    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, genreUpdated) => {
      if (err) return next(err);
      res.redirect(genreUpdated.url);
    });
  }
];