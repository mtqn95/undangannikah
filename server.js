const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-invitation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// ==================== Database Schema ====================
const rsvpSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        match: /^\d{10,15}$/
    },
    email: {
        type: String,
        default: '',
        lowercase: true
    },
    attendance: {
        type: String,
        enum: ['Hadir', 'Tidak Hadir', 'Mungkin'],
        required: true
    },
    guests: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    allergies: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// ==================== Routes ====================

// GET: Statistik RSVP
app.get('/api/stats', async (req, res) => {
    try {
        const total = await RSVP.countDocuments();
        const attending = await RSVP.countDocuments({ attendance: 'Hadir' });
        const notAttending = await RSVP.countDocuments({ attendance: 'Tidak Hadir' });
        const maybe = await RSVP.countDocuments({ attendance: 'Mungkin' });
        const totalGuests = await RSVP.aggregate([
            { $group: { _id: null, total: { $sum: '$guests' } } }
        ]);

        res.json({
            total,
            attending,
            notAttending,
            maybe,
            totalGuests: totalGuests[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Semua RSVP (untuk admin)
app.get('/api/rsvp', async (req, res) => {
    try {
        const rsvps = await RSVP.find().sort({ createdAt: -1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: RSVP berdasarkan ID
app.get('/api/rsvp/:id', async (req, res) => {
    try {
        const rsvp = await RSVP.findById(req.params.id);
        if (!rsvp) {
            return res.status(404).json({ error: 'RSVP tidak ditemukan' });
        }
        res.json(rsvp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Buat RSVP baru
app.post('/api/rsvp', async (req, res) => {
    try {
        // Validasi input
        const { name, phone, attendance, guests } = req.body;

        if (!name || !phone || !attendance || !guests) {
            return res.status(400).json({ 
                error: 'Semua field yang wajib harus diisi!' 
            });
        }

        // Cek duplikasi nomor phone
        const existingRsvp = await RSVP.findOne({ phone });
        if (existingRsvp) {
            return res.status(400).json({ 
                error: 'Nomor WhatsApp ini sudah terdaftar. Silakan update data Anda jika ingin berubah.' 
            });
        }

        // Buat RSVP baru
        const rsvp = new RSVP({
            name,
            phone,
            email: req.body.email || '',
            attendance,
            guests: parseInt(guests),
            allergies: req.body.allergies || '',
            message: req.body.message || ''
        });

        await rsvp.save();

        // Kirim notifikasi WhatsApp (opsional)
        await sendWhatsAppNotification(rsvp);

        res.status(201).json({
            success: true,
            message: 'Terima kasih telah mengkonfirmasi kehadiran!',
            data: rsvp
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Update RSVP
app.put('/api/rsvp/:id', async (req, res) => {
    try {
        const { name, phone, email, attendance, guests, allergies, message } = req.body;

        const rsvp = await RSVP.findByIdAndUpdate(
            req.params.id,
            {
                name,
                phone,
                email,
                attendance,
                guests: parseInt(guests),
                allergies,
                message
            },
            { new: true, runValidators: true }
        );

        if (!rsvp) {
            return res.status(404).json({ error: 'RSVP tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'Data RSVP berhasil diperbarui!',
            data: rsvp
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Hapus RSVP
app.delete('/api/rsvp/:id', async (req, res) => {
    try {
        const rsvp = await RSVP.findByIdAndDelete(req.params.id);

        if (!rsvp) {
            return res.status(404).json({ error: 'RSVP tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'RSVP berhasil dihapus!',
            data: rsvp
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Wishlist/Ucapan
const wishSchema = new mongoose.Schema({
    name: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Wish = mongoose.model('Wish', wishSchema);

app.post('/api/wishes', async (req, res) => {
    try {
        const { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'Nama dan pesan harus diisi!' });
        }

        const wish = new Wish({ name, message });
        await wish.save();

        res.status(201).json({
            success: true,
            message: 'Ucapan berhasil ditambahkan!',
            data: wish
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/wishes', async (req, res) => {
    try {
        const wishes = await Wish.find().sort({ createdAt: -1 });
        res.json(wishes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== Helper Functions ====================

// Kirim notifikasi WhatsApp menggunakan Twilio
async function sendWhatsAppNotification(rsvpData) {
    try {
        // Pastikan Anda sudah setup Twilio credentials di .env
        if (!process.env.TWILIO_ACCOUNT_SID) {
            console.log('⚠️  Twilio not configured, skipping notification');
            return;
        }

        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const message = `
Terima kasih ${rsvpData.name}! 💕

Kami sudah menerima konfirmasi kehadiran Anda:
Status: ${rsvpData.attendance}
Jumlah Tamu: ${rsvpData.guests}

Tunggu informasi lebih lanjut di chat ini.
        `;

        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+${rsvpData.phone}`,
            body: message
        });

        console.log(`✅ WhatsApp notification sent to ${rsvpData.phone}`);
    } catch (error) {
        console.error('❌ Error sending WhatsApp notification:', error);
    }
}

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});