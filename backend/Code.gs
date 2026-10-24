/**
 * AONE Style Studio booking backend.
 * Deploy this Apps Script project as a Web app (execute as you; access: anyone).
 * Run setup() once from the editor to create the private booking spreadsheet.
 *
 * IMPORTANT:
 * - Bookings start as PENDING and are emailed to Ashok and the customer.
 * - Pending requests reserve their slot until Ashok changes Status to CONFIRMED or CANCELLED.
 * - Smoothing durations are intentionally disabled until Ashok confirms them.
 */
const CONFIG = {
  BARBER_EMAIL: "doliyaashok101@gmail.com",
  BUSINESS_NAME: "AONE Style Studio",
  BARBER_NAME: "Ashok",
  ADDRESS: "Inside AJ Barbering and SPA, 2450 Finch Ave W Unit 8, North York, ON M9M 2E9",
  TIMEZONE: "America/Toronto",
  OPEN_HOUR: 10,
  CLOSE_HOUR: 20,
  SLOT_INTERVAL_MINUTES: 15,
  SERVICES: {
    "Men's Haircut": { price: 20, duration: 30 },
    "Regular Children's Haircut": { price: 20, duration: 30 },
    "Women's Haircut": { price: 45, duration: 45 },
    "Smoothing (Men)": { price: 100, duration: null },
    "Smoothing (Women)": { price: 150, duration: null },
    "Clean Up": { price: 40, duration: 15 }
  },
  SHEET_NAME: "Bookings"
};

function setup() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty("AONE_BOOKING_SPREADSHEET_ID");
  let spreadsheet;
  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create("AONE Style Studio - Private Bookings");
    spreadsheetId = spreadsheet.getId();
    props.setProperty("AONE_BOOKING_SPREADSHEET_ID", spreadsheetId);
  }
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Booking ID", "Created At", "Customer Name", "Phone", "Customer Email",
      "Service", "Price CAD", "Date", "Start Time", "End Time", "Status", "Notes"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
    sheet.autoResizeColumns(1, 12);
  }
  return { spreadsheetUrl: spreadsheet.getUrl(), message: "AONE booking sheet is ready." };
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Booking")
    .setTitle("Book an Appointment | AONE Style Studio")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function getBookingOptions() {
  return Object.keys(CONFIG.SERVICES).map(function(name) {
    const s = CONFIG.SERVICES[name];
    return { name: name, price: s.price, duration: s.duration };
  });
}

function getAvailableSlots(dateString, serviceName) {
  const service = CONFIG.SERVICES[serviceName];
  if (!service) throw new Error("Please choose a valid service.");
  if (!service.duration) return { slots: [], message: "Ashok needs to confirm the duration for this service before online booking can be enabled." };
  const date = parseDate_(dateString);
  if (date < startOfToday_()) return { slots: [], message: "Please choose today or a future date." };
  const existing = getActiveBookingsForDate_(dateString);
  const slots = [];
  for (let mins = CONFIG.OPEN_HOUR * 60; mins + service.duration <= CONFIG.CLOSE_HOUR * 60; mins += CONFIG.SLOT_INTERVAL_MINUTES) {
    const start = mins;
    const end = start + service.duration;
    if (dateString === Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd") &&
        start <= currentMinutes_()) continue;
    const overlaps = existing.some(function(b) {
      return start < b.end && end > b.start;
    });
    if (!overlaps) slots.push({ value: minutesToTime_(start), label: minutesToLabel_(start) });
  }
  return { slots: slots, message: slots.length ? "" : "No times are available on this date. Please try another date." };
}

function createBooking(form) {
  validateForm_(form);
  const service = CONFIG.SERVICES[form.service];
  if (!service.duration) throw new Error("Online booking for this service is not available until Ashok confirms its duration.");
  const date = parseDate_(form.date);
  if (date < startOfToday_()) throw new Error("Please choose today or a future date.");
  const start = timeToMinutes_(form.time);
  const end = start + service.duration;
  if (start < CONFIG.OPEN_HOUR * 60 || end > CONFIG.CLOSE_HOUR * 60) throw new Error("This appointment falls outside studio hours.");
  if (form.date === Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd") && start <= currentMinutes_()) {
    throw new Error("Please choose a future time.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let booking;
  try {
    const existing = getActiveBookingsForDate_(form.date);
    if (existing.some(function(b) { return start < b.end && end > b.start; })) {
      throw new Error("Sorry, that time was just taken. Please choose another available time.");
    }
    const sheet = getBookingSheet_();
    const id = "AONE-" + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 900 + 100);
    const startLabel = minutesToLabel_(start);
    const endLabel = minutesToLabel_(end);
    booking = {
      id: id, name: clean_(form.name), phone: clean_(form.phone), email: clean_(form.email),
      service: form.service, price: service.price, date: form.date,
      start: startLabel, end: endLabel, status: "PENDING",
      notes: clean_(form.notes || "")
    };
    sheet.appendRow([
      booking.id, new Date(), booking.name, booking.phone, booking.email,
      booking.service, booking.price, booking.date, booking.start, booking.end,
      booking.status, booking.notes
    ]);
  } finally {
    lock.releaseLock();
  }

  sendBookingEmails_(booking);
  return {
    success: true,
    bookingId: booking.id,
    status: booking.status,
    message: "Your request has been sent. It is pending Ashok's confirmation; please watch your email."
  };
}

function validateForm_(f) {
  if (!f || typeof f !== "object") throw new Error("Please complete the booking form.");
  ["name", "phone", "email", "service", "date", "time"].forEach(function(k) {
    if (!String(f[k] || "").trim()) throw new Error("Please complete all required fields.");
  });
  if (String(f.name).length > 100 || String(f.phone).length > 40 || String(f.email).length > 254) {
    throw new Error("One or more fields are too long.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email))) throw new Error("Please enter a valid email address.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(f.date))) throw new Error("Please choose a valid date.");
  if (!/^\d{2}:\d{2}$/.test(String(f.time))) throw new Error("Please choose a valid time.");
  if (!CONFIG.SERVICES[f.service]) throw new Error("Please choose a valid service.");
  if (String(f.name).length < 2) throw new Error("Please enter your full name.");
  if (String(f.phone).replace(/\D/g, "").length < 7) throw new Error("Please enter a valid phone number.");
}

function sendBookingEmails_(b) {
  const dateLabel = Utilities.formatDate(parseDate_(b.date), CONFIG.TIMEZONE, "EEE, MMM d, yyyy");
  const subject = "Booking request " + b.id + " - " + b.name;
  const barberBody = [
    "A new appointment request was submitted for AONE Style Studio.",
    "", "Status: PENDING APPROVAL", "Booking ID: " + b.id, "Customer: " + b.name,
    "Phone: " + b.phone, "Email: " + b.email, "Service: " + b.service,
    "Price: CAD $" + b.price, "Date: " + dateLabel, "Time: " + b.start + " to " + b.end,
    "Notes: " + (b.notes || "None"), "", "Open the private AONE booking spreadsheet to confirm or cancel this request."
  ].join("\n");
  const customerBody = [
    "Hi " + b.name + ",", "", "We've received your appointment request with " + CONFIG.BARBER_NAME + " at " + CONFIG.BUSINESS_NAME + ".",
    "", "Booking ID: " + b.id, "Service: " + b.service, "Price: CAD $" + b.price,
    "Requested date: " + dateLabel, "Requested time: " + b.start + " to " + b.end,
    "Location: " + CONFIG.ADDRESS, "", "Status: PENDING. This is a request, not a confirmed appointment. Ashok will follow up to confirm it.",
    "", "Thank you,", CONFIG.BUSINESS_NAME
  ].join("\n");
  MailApp.sendEmail(CONFIG.BARBER_EMAIL, subject, barberBody);
  MailApp.sendEmail(b.email, "We received your AONE appointment request - " + b.id, customerBody);
}

function getActiveBookingsForDate_(dateString) {
  const sheet = getBookingSheet_();
  const rows = sheet.getDataRange().getValues();
  const active = [];
  for (let i = 1; i < rows.length; i++) {
    const rowDate = normalizeDateCell_(rows[i][7]);
    const status = String(rows[i][10] || "").toUpperCase();
    if (rowDate !== dateString || status === "CANCELLED" || status === "REJECTED") continue;
    const start = timeCellToMinutes_(rows[i][8]);
    const end = timeCellToMinutes_(rows[i][9]);
    if (start !== null && end !== null) active.push({ start: start, end: end });
  }
  return active;
}

function getBookingSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("AONE_BOOKING_SPREADSHEET_ID");
  if (!id) throw new Error("Booking sheet is not initialized. Run setup() once in the Apps Script editor.");
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error("Booking sheet was not found. Run setup() again.");
  return sheet;
}

function parseDate_(s) {
  const p = String(s).split("-").map(Number);
  if (p.length !== 3) throw new Error("Invalid date.");
  const d = new Date(p[0], p[1] - 1, p[2], 12, 0, 0);
  if (Utilities.formatDate(d, CONFIG.TIMEZONE, "yyyy-MM-dd") !== s) throw new Error("Invalid date.");
  return d;
}
function startOfToday_() {
  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");
  return parseDate_(today);
}
function currentMinutes_() {
  const now = new Date();
  return Number(Utilities.formatDate(now, CONFIG.TIMEZONE, "H")) * 60 +
    Number(Utilities.formatDate(now, CONFIG.TIMEZONE, "m"));
}
function minutesToTime_(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
function minutesToLabel_(m) {
  const h = Math.floor(m / 60), min = m % 60;
  return String((h % 12) || 12) + ":" + String(min).padStart(2, "0") + (h >= 12 ? " PM" : " AM");
}
function timeToMinutes_(s) {
  const p = String(s).split(":").map(Number);
  return p[0] * 60 + p[1];
}
function timeCellToMinutes_(v) {
  if (v instanceof Date) return v.getHours() * 60 + v.getMinutes();
  if (typeof v === "number") return Math.round(v * 24 * 60);
  if (typeof v === "string" && /^\d{2}:\d{2}$/.test(v)) return timeToMinutes_(v);
  if (typeof v === "string") {
    const m = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) return ((Number(m[1]) % 12) + (/PM/i.test(m[3]) ? 12 : 0)) * 60 + Number(m[2]);
  }
  return null;
}
function normalizeDateCell_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CONFIG.TIMEZONE, "yyyy-MM-dd");
  return String(v || "");
}
function clean_(v) { return String(v || "").trim().replace(/[<>]/g, "").slice(0, 500); }
