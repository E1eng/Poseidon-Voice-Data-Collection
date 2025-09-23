// --- Kode dari tag <script> di index.html ---

particlesJS('particles-js', { particles: { number: { value: 80, density: { enable: true, value_area: 800 } }, color: { value: '#00e1ff' }, shape: { type: 'circle' }, opacity: { value: 0.5, random: true }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 150, color: '#00e1ff', opacity: 0.2 }, move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' } }, interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } }, modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } } }, retina_detect: true });

const statusEl = document.getElementById('status');
const listEl = document.getElementById('data-list');
const totalCountEl = document.getElementById('total-count-display');
const countryCodeMap = { 'Indonesian': 'id', 'Spanish': 'es', 'Korean': 'kr', 'Portuguese': 'pt', 'Turkish': 'tr', 'Urdu': 'pk', 'Hindi': 'in', 'Arabic': 'sa', 'Russian': 'ru', 'Marathi': 'in', 'Mandarin': 'cn', 'Vietnamese': 'vn', 'French': 'fr', 'German': 'de', 'Japanese': 'jp', 'English': 'gb' };


// =========================================================
// 🔄 LOGIKA WEBSOCKET DIGANTI DENGAN HTTP POLLING 🔄
// =========================================================

/**
 * Mengambil data dari endpoint API baru dan memperbarui dashboard.
 */
async function fetchData() {
    statusEl.textContent = 'CONNECTING...';
    try {
        // Panggil endpoint API baru yang dibuat di server.js
        const response = await fetch('/api/data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Asumsi server.js mengembalikan { data: results }
        if (data && data.data) {
            statusEl.textContent = `LAST SYNC: ${new Date().toLocaleTimeString('id-ID')}`;
            updateDashboard(data.data);
        } else {
            statusEl.textContent = 'ERROR: No data received';
        }

    } catch (error) {
        console.error("Failed to fetch data:", error);
        statusEl.textContent = 'CONNECTION TERMINATED (API Error)';
    }
}

// Panggil fungsi segera setelah dimuat, lalu atur interval polling
fetchData();
setInterval(fetchData, 5000); // Polling setiap 5 detik

// =========================================================
// END OF POLLING LOGIC
// =========================================================


function updateDashboard(data) {
    let totalCount = 0;
    // Sortir sisi klien agar data berurutan jika tidak disortir oleh server
    if (window.innerWidth >= 768) { /* server-side sort */ } else { data.sort((a, b) => a.name.localeCompare(b.name)); }
    listEl.innerHTML = '';
    data.forEach(item => {
        totalCount += item.count;
        const card = document.createElement('div');
        card.className = 'data-card';
        const countryCode = countryCodeMap[item.name] || 'xx';
        const flagImageUrl = `https://flagcdn.com/w40/${countryCode}.png`; 
        card.innerHTML = `<div class="card-info"><span class="flag-icon"><img src="${flagImageUrl}" alt="Bendera ${item.name}"></span><span class="name">${item.name}</span></div><div class="card-count">${new Intl.NumberFormat('id-ID').format(item.count)}</div>`;
        listEl.appendChild(card);
    });
    animateCount(totalCountEl, totalCount);
}

function animateCount(element, newCount) {
    const currentCount = parseInt(element.innerText.replace(/\./g, '')) || 0;
    if (currentCount === newCount) return;
    const duration = 500;
    let startTime = null;
    function animationStep(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const animatedValue = Math.floor(progress * (newCount - currentCount) + currentCount);
        element.innerText = new Intl.NumberFormat('id-ID').format(animatedValue);
        if (progress < 1) requestAnimationFrame(animationStep);
    }
    requestAnimationFrame(animationStep);
}