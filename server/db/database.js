const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'cinewave_db.json');

// Default database structure
const initialData = {
  movies: [],
  shows: [],
  booking_requests: [],
  case_audit_logs: [],
  counters: {
    movies: 0,
    shows: 0,
    caseId: 1000,
    auditLog: 0,
  },
};

// Initialize DB file if not present
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
}

function readDb() {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, reinitializing:', err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

module.exports = {
  readDb,
  writeDb,

  // Movies Helper
  getMovies: () => readDb().movies,
  getMovieById: (id) => readDb().movies.find((m) => m.id === Number(id)),
  addMovie: (movieData) => {
    const db = readDb();
    db.counters.movies += 1;
    const newMovie = {
      id: db.counters.movies,
      title: movieData.title,
      genre: movieData.genre,
      durationMinutes: Number(movieData.durationMinutes),
      showType: movieData.showType, // "Premium" | "Standard"
      description: movieData.description || '',
      posterUrl: movieData.posterUrl || '',
      createdAt: new Date().toISOString(),
    };
    db.movies.push(newMovie);
    writeDb(db);
    return newMovie;
  },
  updateMovie: (id, updateData) => {
    const db = readDb();
    const idx = db.movies.findIndex((m) => m.id === Number(id));
    if (idx === -1) return null;
    db.movies[idx] = {
      ...db.movies[idx],
      ...updateData,
      id: Number(id),
      durationMinutes: updateData.durationMinutes ? Number(updateData.durationMinutes) : db.movies[idx].durationMinutes,
    };
    writeDb(db);
    return db.movies[idx];
  },
  deleteMovie: (id) => {
    const db = readDb();
    const numId = Number(id);
    db.movies = db.movies.filter((m) => m.id !== numId);
    db.shows = db.shows.filter((s) => s.movieId !== numId);
    writeDb(db);
    return true;
  },

  // Shows Helper
  getShows: () => {
    const db = readDb();
    return db.shows.map((show) => {
      const movie = db.movies.find((m) => m.id === show.movieId);
      return {
        ...show,
        movieTitle: movie ? movie.title : 'Unknown Movie',
        showType: movie ? movie.showType : 'Standard',
        posterUrl: movie ? movie.posterUrl : '',
      };
    });
  },
  getShowById: (id) => {
    const db = readDb();
    const show = db.shows.find((s) => s.id === Number(id));
    if (!show) return null;
    const movie = db.movies.find((m) => m.id === show.movieId);
    return {
      ...show,
      movieTitle: movie ? movie.title : 'Unknown Movie',
      showType: movie ? movie.showType : 'Standard',
      posterUrl: movie ? movie.posterUrl : '',
    };
  },
  getBookedSeatsForShow: (showId) => {
    const db = readDb();
    const showNumId = Number(showId);
    const activeBookings = db.booking_requests.filter(
      (b) => b.showId === showNumId && b.status !== 'Rejected'
    );
    const booked = new Set();
    activeBookings.forEach((b) => {
      if (Array.isArray(b.selectedSeats)) {
        b.selectedSeats.forEach((seat) => booked.add(seat));
      }
    });
    return Array.from(booked);
  },
  addShow: (showData) => {
    const db = readDb();
    db.counters.shows += 1;
    const newShow = {
      id: db.counters.shows,
      movieId: Number(showData.movieId),
      theatre: showData.theatre,
      location: showData.location,
      dateTime: showData.dateTime,
      totalSeats: Number(showData.totalSeats),
      seatsAvailable: Number(showData.totalSeats),
      pricePerSeat: Number(showData.pricePerSeat),
      createdAt: new Date().toISOString(),
    };
    db.shows.push(newShow);
    writeDb(db);
    return newShow;
  },
  updateShow: (id, updateData) => {
    const db = readDb();
    const idx = db.shows.findIndex((s) => s.id === Number(id));
    if (idx === -1) return null;
    db.shows[idx] = {
      ...db.shows[idx],
      ...updateData,
      id: Number(id),
    };
    writeDb(db);
    return db.shows[idx];
  },
  deleteShow: (id) => {
    const db = readDb();
    db.shows = db.shows.filter((s) => s.id !== Number(id));
    writeDb(db);
    return true;
  },

  // Booking Request (Pega Case) Helpers
  getBookings: () => {
    const db = readDb();
    return db.booking_requests.map((booking) => {
      const show = db.shows.find((s) => s.id === booking.showId);
      const movie = show ? db.movies.find((m) => m.id === show.movieId) : null;
      return {
        ...booking,
        selectedSeats: Array.isArray(booking.selectedSeats) ? booking.selectedSeats : [],
        showDetails: show
          ? {
              ...show,
              movieTitle: movie ? movie.title : 'Unknown Movie',
              showType: movie ? movie.showType : 'Standard',
            }
          : null,
      };
    });
  },
  getBookingById: (id) => {
    const db = readDb();
    const booking = db.booking_requests.find((b) => b.id.toUpperCase() === id.toUpperCase());
    if (!booking) return null;
    const show = db.shows.find((s) => s.id === booking.showId);
    const movie = show ? db.movies.find((m) => m.id === show.movieId) : null;
    const auditLogs = db.case_audit_logs.filter((a) => a.bookingRequestId === booking.id);
    return {
      ...booking,
      selectedSeats: Array.isArray(booking.selectedSeats) ? booking.selectedSeats : [],
      showDetails: show
        ? {
            ...show,
            movieTitle: movie ? movie.title : 'Unknown Movie',
            showType: movie ? movie.showType : 'Standard',
          }
        : null,
      auditLogs,
    };
  },
  createBookingCase: (caseData) => {
    const db = readDb();
    db.counters.caseId += 1;
    const caseId = `CW-${db.counters.caseId}`;

    const selectedSeats = Array.isArray(caseData.selectedSeats) ? caseData.selectedSeats : [];
    const numTickets = selectedSeats.length > 0 ? selectedSeats.length : Number(caseData.numTickets || 1);
    const addons = Array.isArray(caseData.addons) ? caseData.addons : [];
    const urgency = Number(caseData.urgency || (caseData.assignedQueue === 'PremiumShowQueue' ? 30 : 10));

    // Calculate child cases if addons exist (Pega Child Case Creation)
    const childCases = [];
    if (addons.length > 0) {
      if (!db.child_cases) db.child_cases = [];
      addons.forEach((addon, idx) => {
        const childId = `${caseId}-ADD${idx + 1}`;
        const childObj = {
          id: childId,
          parentCaseId: caseId,
          caseType: 'Food & Beverage Sub-Case',
          name: addon.name,
          category: addon.category || 'Concession',
          price: Number(addon.price || 0),
          quantity: Number(addon.quantity || 1),
          status: 'Resolved-Approved',
          createdAt: new Date().toISOString(),
        };
        db.child_cases.push(childObj);
        childCases.push(childObj);
      });
    }

    const newBooking = {
      id: caseId,
      customerName: caseData.customerName,
      customerEmail: caseData.customerEmail,
      showId: Number(caseData.showId),
      numTickets,
      selectedSeats,
      totalCost: Number(caseData.totalCost),
      addons,
      childCases,
      urgency,
      status: caseData.status || 'Initial Stage',
      confirmed: caseData.confirmed ? 1 : 0,
      assignedQueue: caseData.assignedQueue,
      rejectionReason: caseData.rejectionReason || null,
      createdAt: caseData.createdAt || new Date().toISOString(),
      resolvedAt: null,
    };

    db.booking_requests.push(newBooking);

    // Initial audit log
    db.counters.auditLog += 1;
    const addonDetails = addons.length > 0 ? ` with ${addons.length} Add-on Sub-Case(s) [${addons.map(a => a.name).join(', ')}]` : '';
    db.case_audit_logs.push({
      id: db.counters.auditLog,
      bookingRequestId: caseId,
      stage: 'Initial Stage',
      action: 'Case Created',
      performedBy: 'Customer (' + caseData.customerName + ')',
      details: `Submitted booking request for ${numTickets} ticket(s) [Seats: ${selectedSeats.join(', ') || 'N/A'}]${addonDetails}. Auto-assigned queue: ${caseData.assignedQueue} (Urgency: ${urgency})`,
      timestamp: new Date().toISOString(),
    });

    writeDb(db);
    return newBooking;
  },
  updateBookingCase: (id, updateData, auditEntry = null) => {
    const db = readDb();
    const idx = db.booking_requests.findIndex((b) => b.id.toUpperCase() === id.toUpperCase());
    if (idx === -1) return null;

    db.booking_requests[idx] = {
      ...db.booking_requests[idx],
      ...updateData,
    };

    if (auditEntry) {
      db.counters.auditLog += 1;
      db.case_audit_logs.push({
        id: db.counters.auditLog,
        bookingRequestId: db.booking_requests[idx].id,
        stage: auditEntry.stage || db.booking_requests[idx].status,
        action: auditEntry.action,
        performedBy: auditEntry.performedBy || 'System',
        details: auditEntry.details || '',
        timestamp: new Date().toISOString(),
      });
    }

    writeDb(db);
    return db.booking_requests[idx];
  },
  addAuditLog: (caseId, stage, action, performedBy, details) => {
    const db = readDb();
    db.counters.auditLog += 1;
    const log = {
      id: db.counters.auditLog,
      bookingRequestId: caseId,
      stage,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    };
    db.case_audit_logs.push(log);
    writeDb(db);
    return log;
  },
  getChildCasesForParent: (parentCaseId) => {
    const db = readDb();
    return (db.child_cases || []).filter(c => c.parentCaseId.toUpperCase() === parentCaseId.toUpperCase());
  },
};
