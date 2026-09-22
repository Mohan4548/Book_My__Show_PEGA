const nodemailer = require('nodemailer');

let transporter = null;

// Create Ethereal test account for email correspondence
async function initEmailTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✅ Nodemailer Ethereal SMTP account created successfully for Movexa ⭐ correspondence.');
  } catch (error) {
    console.warn('⚠️ Could not initialize Ethereal SMTP. Email notifications will log to console as fallback.', error.message);
  }
}

initEmailTransporter().catch((err) => {
  console.warn('⚠️ Nodemailer initialization error (falling back to console logging):', err.message);
});

/**
 * Send booking resolved correspondence email to customer
 * @param {Object} booking 
 * @param {Object} show 
 * @param {Object} movie 
 */
async function sendBookingResolvedEmail(booking, show, movie) {
  const subject = `🎟️ Movexa ⭐ Booking Confirmed! Case ID: ${booking.id}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
      <h2 style="color: #38bdf8; border-bottom: 2px solid #38bdf8; padding-bottom: 8px;">Movexa ⭐ Case Resolved - Booking Confirmation</h2>
      <p>Dear <strong>${booking.customerName}</strong>,</p>
      <p>Great news! Your movie ticket request (Case ID: <span style="color: #fbbf24; font-weight: bold;">${booking.id}</span>) has been approved and successfully processed.</p>
      
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #10b981;">${movie.title} (${movie.showType})</h3>
        <p style="margin: 4px 0;"><strong>Theatre:</strong> ${show.theatre} - ${show.location}</p>
        <p style="margin: 4px 0;"><strong>Showtime:</strong> ${new Date(show.dateTime).toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Tickets Reserved:</strong> ${booking.numTickets}</p>
        <p style="margin: 4px 0;"><strong>Total Cost:</strong> $${booking.totalCost.toFixed(2)}</p>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">
        Your digital pass & dynamic QR entry ticket are available on the Movexa My Bookings portal.
      </p>
      <div style="margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
        Movexa ⭐ Pega Case Management System &bull; Automated Correspondence Service
      </div>
    </div>
  `;

  console.log('\n=================== SENDER CORRESPONDENCE LOG ===================');
  console.log(`To: ${booking.customerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Case ID: ${booking.id}`);
  console.log(`Customer: ${booking.customerName}`);
  console.log(`Movie: ${movie.title} (${show.theatre})`);
  console.log(`Tickets: ${booking.numTickets} | Total: $${booking.totalCost.toFixed(2)}`);
  console.log(`Resolved At: ${new Date().toISOString()}`);
  console.log('=================================================================\n');

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: '"Movexa Support ⭐" <no-reply@movexa.com>',
        to: booking.customerEmail,
        subject,
        html: htmlContent,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 Ethereal Email Preview URL: ${previewUrl}`);
      return { sent: true, previewUrl };
    } catch (err) {
      console.warn('⚠️ Failed to send via Nodemailer transporter, logged to console:', err.message);
      return { sent: false, error: err.message };
    }
  }

  return { sent: true, mode: 'console-log' };
}

module.exports = {
  sendBookingResolvedEmail,
};
