
// ===============================================
// FILE: js/main.js
// SISTEM: DATABASE LOKAL + AI POLLING (NO API KEY)
// ===============================================

// Konfigurasi Database (Disimpan di Browser)
const DB_NAME = 'andika_users_final';
const SESSION_NAME = 'andika_session_active';

// ===============================================
// 1. BAGIAN LOGIN & REGISTER (DATABASE)
// ===============================================

// --- FUNGSI DAFTAR (REGISTER) ---
function registerUser() {
    // Ambil data dari form
    const username = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const pass = document.getElementById('pass').value;

    // Validasi input
    if (!username || !email || !pass) {
        alert("❌ Harap isi Username, Email, dan Password!");
        return;
    }

    // Ubah tombol jadi loading
    const btn = document.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = "MENDAFTAR...";
    btn.disabled = true;

    // Simulasi loading sebentar (biar keren)
    setTimeout(() => {
        // Ambil data user yang sudah ada
        let users = JSON.parse(localStorage.getItem(DB_NAME)) || [];

        // Cek apakah email sudah dipakai
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            alert("❌ Email ini sudah terdaftar di HP ini!");
            btn.innerText = oldText;
            btn.disabled = false;
            return;
        }

        // Simpan user baru
        users.push({
            username: username,
            email: email,
            phone: phone,
            password: pass, // Disimpan lokal
            joined: new Date().toLocaleDateString()
        });

        // Update database
        localStorage.setItem(DB_NAME, JSON.stringify(users));

        alert("✅ PENDAFTARAN BERHASIL!\nSilakan Login dengan akun baru Anda.");
        window.location.href = 'login.html';
    }, 1500);
}

// --- FUNGSI MASUK (LOGIN) ---
function loginUser() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!email || !pass) {
        alert("❌ Isi Email dan Password!");
        return;
    }

    const btn = document.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = "MEMERIKSA...";
    btn.disabled = true;

    setTimeout(() => {
        // Ambil database
        let users = JSON.parse(localStorage.getItem(DB_NAME)) || [];

        // Cari user yang cocok
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            // Login Berhasil -> Simpan Sesi
            localStorage.setItem(SESSION_NAME, JSON.stringify(user));
            alert("✅ LOGIN SUKSES!\nSelamat Datang, " + user.username);
            window.location.href = 'dashboard.html';
        } else {
            // Login Gagal
            alert("❌ GAGAL MASUK\nEmail atau Password salah, atau akun belum dibuat di browser ini.");
            btn.innerText = oldText;
            btn.disabled = false;
        }
    }, 1500);
}

// --- FUNGSI LOGOUT ---
function logout() {
    if (confirm("Yakin ingin keluar?")) {
        localStorage.removeItem(SESSION_NAME);
        window.location.href = 'login.html';
    }
}

// --- CEK SESI (Security Dashboard) ---
function checkAuth() {
    const session = localStorage.getItem(SESSION_NAME);
    if (!session) {
        // Kalau gak ada sesi, tendang ke login
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(session);
}

// ===============================================
// 2. BAGIAN KECERDASAN BUATAN (AI REAL)
// ===============================================

// --- IMAGE GENERATOR (Pollinations AI) ---
async function generateRealImage(prompt) {
    // Tambahkan "bumbu" prompt biar hasilnya selalu bagus & gaya cyberpunk
    const enhancedPrompt = encodeURIComponent(prompt + ", cyberpunk style, neon lights, futuristic, high quality, 8k, detailed");
    
    const url = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=512&height=512&nologo=true`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Supaya bisa diedit canvas (watermark)
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject("Gagal terhubung ke Server AI Gambar.");
    });
}

// --- TEXT GENERATOR (Pollinations Text) ---
async function generateRealText(prompt, systemRole) {
    try {
        // Format prompt khusus untuk Pollinations Text
        const finalPrompt = encodeURIComponent(`${systemRole}\n\nUser: ${prompt}\nAI:`);
        
        // Fetch ke API gratis
        const response = await fetch(`https://text.pollinations.ai/${finalPrompt}`);
        
        if (!response.ok) throw new Error("Server Busy");
        return await response.text();
    } catch (error) {
        console.error(error);
        return "Maaf, Server AI sedang sibuk. Silakan coba beberapa saat lagi.";
    }
}

// --- WATERMARK SYSTEM ---
function addWatermarkToCanvas(canvas, imageObj) {
    const ctx = canvas.getContext('2d');
    
    // Pastikan ukuran canvas pas
    canvas.width = 512;
    canvas.height = 512;

    // 1. Gambar Hasil AI
    ctx.drawImage(imageObj, 0, 0, 512, 512);

    // 2. Buat Kotak Hitam Transparan di Bawah
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 460, 512, 52);

    // 3. Tulis Teks Neon
    ctx.font = "bold 22px Orbitron, Arial";
    ctx.fillStyle = "#00ff9c"; // Hijau Neon
    ctx.fillText("ANDIKA AI", 20, 495);
    
    ctx.font = "14px Inter, Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("andikaa.web.id", 380, 495);
}
