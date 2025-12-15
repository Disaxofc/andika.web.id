/**
 * ANDIKA AI PLATFORM - REAL AI LOGIC
 * Menggunakan: LocalStorage (DB) & Pollinations.ai (Free Public API)
 */

// --- 1. AUTHENTICATION SYSTEM (LocalStorage) ---
const DB_KEY = 'andika_users_v2';
const SESSION_KEY = 'andika_session_v2';

function getUsers() { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
function saveUsers(users) { localStorage.setItem(DB_KEY, JSON.stringify(users)); }

function register(username, email, password, phone) {
    let users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email sudah terdaftar!' };
    
    users.push({ 
        username, email, password, phone, 
        joined: new Date().toISOString() 
    });
    saveUsers(users);
    return { ok: true };
}

function login(email, password) {
    let users = getUsers();
    let user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { ok: true };
    }
    return { ok: false, msg: 'Email atau Password salah!' };
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

function checkSession() {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!user) window.location.href = 'login.html';
    return user;
}

// --- 2. REAL AI LOGIC (FETCH API) ---

// A. AI IMAGE GENERATOR (Real Stable Diffusion via Pollinations)
async function generateRealImage(prompt) {
    // Encode prompt agar aman di URL
    const safePrompt = encodeURIComponent(prompt + " cyberpunk style, neon colors, high quality, 8k");
    const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=512&height=512&nologo=true`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Izin akses CORS untuk watermark
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject("Gagal memuat gambar dari AI.");
    });
}

// B. AI TEXT GENERATOR (Real GPT via Pollinations Text)
async function generateRealText(prompt, systemRole = "") {
    try {
        // Menggunakan endpoint text Pollinations (Free)
        // Format: https://text.pollinations.ai/{prompt}?model=openai
        // Kita tambahkan instruksi sistem di dalam prompt agar output sesuai
        const finalPrompt = encodeURIComponent(`${systemRole}\n\nUser: ${prompt}\nAI:`);
        const response = await fetch(`https://text.pollinations.ai/${finalPrompt}`);
        
        if (!response.ok) throw new Error("AI Server Busy");
        return await response.text();
    } catch (e) {
        console.error(e);
        return "Maaf, server AI sedang sibuk. Coba lagi nanti.";
    }
}

// C. WATERMARK LOGIC (Canvas Manipulation)
function addWatermarkToCanvas(canvas, imageObj) {
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    // 1. Gambar Hasil AI
    ctx.drawImage(imageObj, 0, 0, 512, 512);

    // 2. Tambah Overlay Gelap dikit di bawah
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 470, 512, 42);

    // 3. Teks Watermark
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#00ff9c"; // Hijau Neon
    ctx.fillText("DIKA-AI PLATFORM", 20, 500);
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("andikaa.web.id", 380, 500);
}