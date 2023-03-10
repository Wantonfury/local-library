const Author = require('../models/author');
const Book = require('../models/book')
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Authors
exports.author_list = (req, res, next) => {
  Author.find()
    .sort({ family_name: 1 })
    .exec(function (err, list_authors) {
      if (err) return next(err);
      
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors
      })
    });
};

// Display detailed page for a specified Author
exports.author_detail = (req, res) => {
  async.parallel({
    author(callback) {
      Author.findById(req.params.id).exec(callback);
    },
    
    authors_books(callback) {
      Book.find({ author: req.params.id }, "title summary").exec(callback);
    }
  }, (err, results, next) => {
    if (err) return next(err);
    
    if (results.author == null) {
      const err = new Error('Author not found.');
      err.status = 404;
      return next(err);
    }
    
    res.render("author_detail", {
      title: "Author Detail",
      author: results.author,
      author_books: results.authors_books
    })
  });
};

// Display Author create form on GET
exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render("author_form", {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      });
    }
    
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death
    });
    
    author.save(err => {
      if (err) return next(err);
      
      res.redirect(author.url);
    });
  }
];

// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
  async.parallel({
    author(callback) {
      Author.findById(req.params.id).exec(callback);
    },
    
    authors_books(callback) {
      Book.find({ author: req.params.id }).exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    
    if (results.author == null) {
      res.redirect('catalog/authors');
    }
    
    res.render("author_delete", {
      title: "Delete Author",
      author: results.author,
      author_books: results.authors_books
    });
  });
};

// Handle Author delete on POST
exports.author_delete_post = (req, res, next) => {
  async.parallel({
    author(callback) {
      Author.findById(req.body.authorid).exec(callback);
    },
    
    authors_books(callback) {
      Book.find({ author: req.body.authorid }).exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    
    if (results.authors_books.length > 0) {
      return res.render("author_delete", {
        title: "Delete Author",
        author: results.author,
        author_books: results.author_books
      });
    }
    
    Author.findByIdAndRemove(req.body.authorid, err => {
      if (err) return next(err);
      
      res.redirect('catalog/authors');
    });
  });
};

// Display Author update form on GET
exports.author_update_get = (req, res, next) => {
  Author.findById(req.params.id, (err, author) => {
    if (err) return next(err);
    
    res.render('author_form', {
      title: 'Update Author',
      author
    });
  });
};

// Handle Author update on POST
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id
    });
    
    if (!errors.isEmpty()) {
      return res.render('author_form', {
        title: 'Update Author',
        author,
        errors: errors.array()
      });
    }
    
    Author.findByIdAndUpdate(req.params.id, author, {}, (err, updatedAuthor) => {
      if (err) return next(err);
      res.redirect(updatedAuthor.url);
    });
  }
];