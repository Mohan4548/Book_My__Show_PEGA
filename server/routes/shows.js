const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all shows
router.get('/', (req, res) => {
  try {
    const shows = db.getShows();
    res.json({ success: true, data: shows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET seat availability and booked seats for a show (Requirement #8)
router.get('/:id/seats', (req, res) => {
  try {
    const show = db.getShowById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const bookedSeats = db.getBookedSeatsForShow(show.id);

    res.json({
      success: true,
      data: {
        showId: show.id,
        totalSeats: show.totalSeats,
        seatsAvailable: Math.max(0, show.totalSeats - bookedSeats.length),
        bookedSeats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET show by ID
router.get('/:id', (req, res) => {
  try {
    const show = db.getShowById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create show
router.post('/', (req, res) => {
  try {
    const { movieId, theatre, location, dateTime, totalSeats, pricePerSeat } = req.body;

    if (!movieId || !theatre || !location || !dateTime || !totalSeats || !pricePerSeat) {
      return res.status(400).json({
        success: false,
        message: 'movieId, theatre, location, dateTime, totalSeats, and pricePerSeat are required',
      });
    }

    const movie = db.getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Referenced Movie not found' });
    }

    const newShow = db.addShow({ movieId, theatre, location, dateTime, totalSeats, pricePerSeat });
    res.status(201).json({ success: true, data: newShow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update show
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateShow(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE show
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.deleteShow(req.params.id);
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
