const db = require('./database');
const fs = require('fs');
const path = require('path');

function seedDatabase() {
  console.log('🌱 Starting database seed script...');

  // Reset database file to empty initial state
  const dbFilePath = path.join(__dirname, 'cinewave_db.json');
  const freshDb = {
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
  fs.writeFileSync(dbFilePath, JSON.stringify(freshDb, null, 2));

  // 1. Seed Movies
  const m1 = db.addMovie({
    title: 'Inception: 15th Anniversary IMAX',
    genre: 'Sci-Fi / Action',
    durationMinutes: 148,
    showType: 'Premium',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  });

  const m2 = db.addMovie({
    title: 'Avatar: The Way of Water 3D',
    genre: 'Sci-Fi / Adventure',
    durationMinutes: 192,
    showType: 'Premium',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  });

  const m3 = db.addMovie({
    title: 'The Dark Knight',
    genre: 'Action / Crime',
    durationMinutes: 152,
    showType: 'Standard',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  });

  const m4 = db.addMovie({
    title: 'Interstellar: Standard Edition',
    genre: 'Sci-Fi / Drama',
    durationMinutes: 169,
    showType: 'Standard',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  });

  console.log(`✅ Seeded ${[m1, m2, m3, m4].length} movies.`);

  // 2. Seed Shows
  const s1 = db.addShow({
    movieId: m1.id,
    theatre: 'CineWave Dolby Cinema 1',
    location: 'Downtown Hub, Screen A',
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    totalSeats: 60,
    pricePerSeat: 22.50,
  });

  const s2 = db.addShow({
    movieId: m2.id,
    theatre: 'CineWave IMAX Grand 3D',
    location: 'Metro Plaza, IMAX Hall',
    dateTime: new Date(Date.now() + 172800000).toISOString(), // 2 days later
    totalSeats: 100,
    pricePerSeat: 28.00,
  });

  const s3 = db.addShow({
    movieId: m3.id,
    theatre: 'CineWave Standard Multiplex',
    location: 'Westside Mall, Screen 4',
    dateTime: new Date(Date.now() + 43200000).toISOString(), // 12 hours later
    totalSeats: 80,
    pricePerSeat: 14.00,
  });

  const s4 = db.addShow({
    movieId: m4.id,
    theatre: 'CineWave Standard Multiplex',
    location: 'Eastside Square, Screen 2',
    dateTime: new Date(Date.now() + 259200000).toISOString(), // 3 days later
    totalSeats: 75,
    pricePerSeat: 12.50,
  });

  console.log(`✅ Seeded ${[s1, s2, s3, s4].length} shows.`);

  // 3. Seed Sample Booking Cases with varied SLA timestamps
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const minInMs = 60 * 1000;

  // Case 1: Active Premium Queue Case (On Track)
  const case1 = db.createBookingCase({
    customerName: 'Alex Rivera',
    customerEmail: 'alex.rivera@example.com',
    showId: s1.id,
    numTickets: 2,
    totalCost: 45.00,
    status: 'Approval',
    confirmed: true,
    assignedQueue: 'PremiumShowQueue',
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(), // Created 2 mins ago
  });

  // Case 2: SLA Goal Missed Case (> 26 hours old / > 1.5 mins old in demo)
  const case2 = db.createBookingCase({
    customerName: 'Sophia Chen',
    customerEmail: 'sophia.chen@example.com',
    showId: s2.id,
    numTickets: 4,
    totalCost: 112.00,
    status: 'Approval',
    confirmed: true,
    assignedQueue: 'PremiumShowQueue',
    createdAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago -> Goal Missed
  });

  // Case 3: SLA Deadline Missed Case (> 52 hours old / > 3 mins old in demo)
  const case3 = db.createBookingCase({
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@example.com',
    showId: s3.id,
    numTickets: 3,
    totalCost: 42.00,
    status: 'Approval',
    confirmed: true,
    assignedQueue: 'StandardShowQueue',
    createdAt: new Date(now - 52 * 60 * 60 * 1000).toISOString(), // 52 hours ago -> Deadline Missed
  });

  // Case 4: Resolved Case (Past completed)
  const case4 = db.createBookingCase({
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@example.com',
    showId: s1.id,
    numTickets: 1,
    totalCost: 22.50,
    status: 'Resolved',
    confirmed: true,
    assignedQueue: 'PremiumShowQueue',
    createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
  });

  db.updateBookingCase(case4.id, {
    resolvedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
  }, {
    stage: 'Resolved',
    action: 'Approved & Resolved',
    performedBy: 'Staff Admin',
    details: 'Ticket issued and correspondence email sent.',
  });

  console.log('🎉 Database seeding complete!');
}

seedDatabase();
