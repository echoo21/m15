require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Setup Template Engine untuk Halaman Web
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Koneksi ke Database menggunakan Variabel Lingkungan (.env)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false, // Menghilangkan log SQL yang memenuhi terminal
    dialectOptions: {
        // Opsional: Beberapa database cloud memerlukan SSL aktif. 
        // Jika muncul error koneksi, hapus tanda komentar pada baris di bawah ini:
        // ssl: { rejectUnauthorized: false }
    }
});

// 3. Definisi Model Tabel 'quotes' (Sesuai Poin A)
const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at' // Memastikan nama kolom di MySQL tetap ular_case
    }
}, {
    tableName: 'quotes',
    timestamps: false // Karena kita manual membuat kolom created_at saja
});

// Koneksikan ke DB
sequelize.authenticate()
    .then(() => console.log('Database terhubung ke Railway / Lokal.'))
    .catch(err => console.error('Gagal terhubung database:', err));


// ==================== ENDPOINT API (Poin B) ====================

// Endpoint a: 'api/quotes/' -> Mengembalikan JSON 9 kutipan acak
app.get('/api/quotes/', async (req, res) => {
    try {
        const randomQuotes = await Quote.findAll({
            order: sequelize.random(),
            limit: 9
        });
        res.json(randomQuotes);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
});

// Endpoint b: '/quotes' -> Menampilkan halaman web HTML menarik
app.get('/quotes', async (req, res) => {
    try {
        const randomQuotes = await Quote.findAll({
            order: sequelize.random(),
            limit: 9
        });
        // Melempar data ke file ejs di folder views
        res.render('index', { quotes: randomQuotes });
    } catch (error) {
        res.status(500).send("Terjadi kesalahan pada server.");
    }
});


// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
