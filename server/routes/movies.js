const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all movies
router.get('/', (req, res) => {
  try {
    const movies = db.getMovies();
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET movie by ID
router.get('/:id', (req, res) => {
  try {
    const movie = db.getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create movie
router.post('/', (req, res) => {
  try {
    const { title, genre, durationMinutes, showType, description, posterUrl } = req.body;
    
    if (!title || !genre || !durationMinutes || !showType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, genre, durationMinutes, and showType ("Premium" | "Standard") are required' 
      });
    }

    if (!['Premium', 'Standard'].includes(showType)) {
      return res.status(400).json({
        success: false,
        message: 'showType must be either "Premium" or "Standard"',
      });
    }

    const newMovie = db.addMovie({ title, genre, durationMinutes, showType, description, posterUrl });
    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update movie
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE movie
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.deleteMovie(req.params.id);
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
