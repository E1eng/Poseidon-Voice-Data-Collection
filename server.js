import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// --- Konfigurasi Dasar ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware untuk Menyajikan File Statis (HTML, CSS, Gambar) ---
// Ini penting agar index.html dan logo.jpg bisa diakses
app.use(express.static(__dirname));

// --- Daftar Koleksi & Konfigurasi API ---
const collections = [
    { name: 'Indonesian', address: '0x3597a283FF04686eF39a506edb7B62F047c95095' }, { name: 'Spanish', address: '0xD5Efce4C38d0dd5BbA7C350885B98BD3dF7DF2C2' },
    { name: 'Korean', address: '0xE08D1cdC8E0f6662cC4276778Dd91363b5F3645E' }, { name: 'Portuguese', address: '0xa21B517F0ca660fB9897cd86A21B13aa81756700' },
    { name: 'Turkish', address: '0x98B127a85ff8b0800EF2bBE11499A3109BDa0619' }, { name: 'Urdu', address: '0x01f9E3934927aFDC126f58E8c4af7328C570CA90' },
    { name: 'Hindi', address: '0x93693a4702adcBE9f2D7463544904019b8cDCD2b' }, { name: 'Arabic', address: '0x21419C6cB5d3910C04970b181C922862aAd6a6C0' },
    { name: 'Russian', address: '0x441C53b6005cB68d57de4b2c49783cba5cf25897' }, { name: 'Marathi', address: '0xA3383565Fa95d999174F13aB122EA4C750462265' },
    { name: 'Mandarin', address: '0x75F5a4Fadf6dE22E4373538A2F35636433896a1a' }, { name: 'Vietnamese', address: '0xceC8707D8e333f1d355fc52f34EB8daE822Df50E' },
{ name: 'French', address: '0x91f51E0b65174b232997279Bcf1b248D039cFB8b' }, { name: 'German', address: '0xB49136C68d7Fa8D6343488720F9411bab83dE90d' },
    { name: 'Japanese', address: '0xEDd28Fa1C46Ad0b444bBC9e12Afa7d7807719574' }, { name: 'English', address: '0xD774a3Ba7e916C62F16B2c068023EA526E3Ac33E' }
];
const url = 'https://api.storyapis.com/api/v4/collections';

// --- Logika WebSocket ---
wss.on('connection', (ws) => {
    console.log('Browser terhubung!');
    ws.on('close', () => console.log('Koneksi browser terputus.'));
});

// --- Fungsi Pengambilan & Penyiaran Data ---
const fetchDataAndBroadcast = async () => {
    // Mengirim semua permintaan API secara paralel untuk efisiensi
    const promises = collections.map(collection => {
        const requestBody = { pagination: { limit: 1 }, where: { collectionAddresses: [collection.address] } };
        const options = { method: 'POST', headers: { 'X-Api-Key': 'MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U', 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) };
        return fetch(url, options)
            .then(res => res.ok ? res.json() : null)
            .then(data => ({ name: collection.name, count: (data?.data?.[0]?.assetCount) || 0 }))
            .catch(() => ({ name: collection.name, count: 0 })); // Menangani error jaringan
    });

    try {
        let results = await Promise.all(promises);
        results.sort((a, b) => b.count - a.count); // Mengurutkan dari terbesar ke terkecil

        const message = JSON.stringify({ type: 'sorted-data', data: results });

        // Mengirim data ke semua browser yang terhubung
        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
        console.log(`Update dikirim pada ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error("Gagal memproses permintaan API:", error);
    }
};

// --- Menjalankan Fungsi Secara Berkala ---
// Interval 2 detik (2000 ms) adalah titik awal yang baik dan lebih aman
setInterval(fetchDataAndBroadcast, 2000);

// --- Menjalankan Server (Hanya untuk lokal) ---
server.listen(PORT, () => {
    console.log(`Server real-time berjalan di http://localhost:${PORT}`);
});

// --- Ekspor untuk Vercel ---
// Ini memungkinkan Vercel untuk menjalankan aplikasi Anda
export default app;