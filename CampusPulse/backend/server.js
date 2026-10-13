import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: 'Campus' },
  description: { type: String, default: '' },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { type: String, default: 'Campus Organizer' },
  capacity: { type: Number, default: 100, min: 1 },
  registrations: [{ name: String, email: String, registeredAt: { type: Date, default: Date.now } }],
  status: { type: String, enum: ['published', 'draft'], default: 'published' }
}, { timestamps: true });
const Event = mongoose.model('Event', eventSchema);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'CampusPulse API' }));

app.get('/api/events', async (_req, res) => {
  try {
    const events = await Event.find({ status: 'published' }).sort({ date: 1 });
    res.json(events.map(e => ({ ...e.toObject(), seatsLeft: Math.max(0, e.capacity - e.registrations.length) })));
  } catch (error) { res.status(500).json({ message: 'Could not load events' }); }
});

// Demo route: protect with organizer authentication/authorization before production.
app.post('/api/events', async (req, res) => {
  try {
    const { title, category, description, venue, date, organizer, capacity } = req.body;
    if (!title || !venue || !date) return res.status(400).json({ message: 'Title, venue and date are required.' });
    const event = await Event.create({ title, category, description, venue, date, organizer, capacity });
    res.status(201).json(event);
  } catch (error) { res.status(400).json({ message: 'Could not create event. Check the supplied details.' }); }
});

// Demo route: add student authentication and duplicate-registration checks before production.
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'published') return res.status(404).json({ message: 'Event not found.' });
    if (event.registrations.length >= event.capacity) return res.status(409).json({ message: 'Sorry, this event is full.' });
    event.registrations.push({ name: name.trim(), email: email.trim().toLowerCase() });
    await event.save();
    res.status(201).json({ message: 'Registration successful!', seatsLeft: event.capacity - event.registrations.length });
  } catch (error) { res.status(400).json({ message: 'Could not register. Check the event ID.' }); }
});

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuspulse');
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`CampusPulse API listening on http://localhost:${port}`));
} catch (error) {
  console.error('MongoDB connection failed. Check that MongoDB is running and MONGODB_URI is correct.');
  process.exit(1);
}
