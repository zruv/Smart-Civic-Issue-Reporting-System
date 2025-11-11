const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database File ---
const DB_FILE = path.join(__dirname, 'complaints.json');

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// --- API Routes ---

// Report an issue
app.post('/api/report', upload.single('issueImage'), (req, res) => {
    const { name, email, issueType, severity, description, address, location } = req.body;
    const newComplaint = {
        id: `CIV-${Date.now()}`,
        timestamp: new Date().toISOString(),
        name,
        email,
        issueType,
        severity,
        description,
        address,
        location: location || 'Not provided',
        imagePath: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'Submitted'
    };

    const complaints = JSON.parse(fs.readFileSync(DB_FILE));
    complaints.push(newComplaint);
    fs.writeFileSync(DB_FILE, JSON.stringify(complaints, null, 2));

    res.status(201).json({
        message: 'Report submitted successfully!',
        complaintId: newComplaint.id
    });
});

// Track a complaint
app.get('/api/track/:id', (req, res) => {
    const { id } = req.params;
    const complaints = JSON.parse(fs.readFileSync(DB_FILE));
    const complaint = complaints.find(c => c.id === id);

    if (complaint) {
        res.json(complaint);
    } else {
        res.status(404).json({ message: 'Complaint not found' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
