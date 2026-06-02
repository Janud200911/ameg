/**
 * ==========================================================================
 * DATA STORAGE SIMULASI (LOCAL DATABASE MOCKUP)
 * ==========================================================================
 */
const DATA_GAMES = [
    { id: "mlbb", name: "Mobile Legends", type: "moba", icon: "🎮", hasZone: true },
    { id: "ff", name: "Free Fire", type: "shooter", icon: "🔥", hasZone: false },
    { id: "pubgm", name: "PUBG Mobile", type: "shooter", icon: "🪂", hasZone: false },
    { id: "hok", name: "Honor of Kings", type: "moba", icon: "👑", hasZone: false },
    { id: "val", name: "Valorant", type: "fps", icon: "🎯", hasZone: false },
    { id: "genshin", name: "Genshin Impact", type: "rpg", icon: "✨", hasZone: true },
    { id: "hsr", name: "Honkai Star Rail", type: "rpg", icon: "🌌", hasZone: true },
    { id: "codm", name: "Call of Duty Mobile", type: "shooter", icon: "🔫", hasZone: false },
    { id: "roblox", name: "Roblox", type: "sandbox", icon: "🧱", hasZone: false },
    { id: "minecraft", name: "Minecraft", type: "sandbox", icon: "⛏️", hasZone: false }
];

const DATA_NOMINALS = [
    "86 Diamonds", "172 Diamonds", "257 Diamonds", 
    "344 Diamonds", "514 Diamonds", "706 Diamonds"
];

const DATA_PAYMENTS = ["Dana", "OVO", "GoPay", "ShopeePay", "QRIS"];

/**
 * ==========================================================================
 * STATE MANAGEMENT APP
 * ==========================================================================
 */
let checkoutState = {
    selectedGame: null,
    userId: "",
    zoneId: "",
    selectedNominal: "",
    selectedPayment: ""
};

/**
 * ==========================================================================
 * INITIALIZER & DOM SELECTORS
 * ==========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    renderGames(DATA_GAMES);
    setupTheme();
    setupNavigation();
    setupSearch();
    setupFormTriggers();
}

/**
 * ==========================================================================
 * RENDERING ENGINE (DOM MANIPULATION)
 * ==========================================================================
 */
function renderGames(gamesList) {
    const grid = document.getElementById("games-grid");
    grid.innerHTML = "";

    if(gamesList.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted)">Game tidak ditemukan...</p>`;
        return;
    }

    gamesList.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card glass";
        card.innerHTML = `
            <div class="game-thumb">${game.icon}</div>
            <div class="game-info">
                <h4>${game.name}</h4>
                <button class="btn btn-primary btn-sm">Pilih</button>
            </div>
        `;
        card.addEventListener("click", () => handleSelectGame(game));
        grid.appendChild(card);
    });
}

function renderFormOptions(game) {
    // 1. Setup Input Name & Zone visibility
    document.getElementById("form-game-name").value = game.name;
    const zoneWrapper = document.getElementById("zone-id-wrapper");
    zoneWrapper.style.display = game.hasZone ? "flex" : "none";

    // 2. Render Nominals
    const nominalGrid = document.getElementById("nominal-grid");
    nominalGrid.innerHTML = "";
    DATA_NOMINALS.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerText = item;
        card.addEventListener("click", () => {
            document.querySelectorAll("#nominal-grid .item-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            checkoutState.selectedNominal = item;
            updateProgressBar();
        });
        nominalGrid.appendChild(card);
    });

    // 3. Render Payments
    const paymentGrid = document.getElementById("payment-grid");
    paymentGrid.innerHTML = "";
    DATA_PAYMENTS.forEach(method => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerText = method;
        card.addEventListener("click", () => {
            document.querySelectorAll("#payment-grid .item-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            checkoutState.selectedPayment = method;
            updateProgressBar();
        });
        paymentGrid.appendChild(card);
    });
}

/**
 * ==========================================================================
 * INTERACTION LOGIC & ACTION HANDLERS
 * ==========================================================================
 */
function handleSelectGame(game) {
    checkoutState.selectedGame = game;
    renderFormOptions(game);
    
    // Alihkan Halaman View
    switchPage("transaction-page");
    updateProgressBar();
    
    // Otomatis Scroll Ke Form Mulai Isian Data Akun
    document.getElementById("transaction-page").scrollIntoView({ behavior: "smooth" });
}

function switchPage(pageId) {
    document.querySelectorAll(".page-view").forEach(page => {
        page.classList.add("hidden");
        page.classList.remove("active");
    });
    const target = document.getElementById(pageId);
    target.classList.remove("hidden");
    target.classList.add("active");
}

function updateProgressBar() {
    // Reset status steps
    document.querySelectorAll(".step").forEach(step => {
        step.classList.remove("active", "completed");
    });

    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");
    const step4 = document.getElementById("step-4");

    // Evaluasi State Terkini
    if (document.getElementById("success-page").classList.contains("active")) {
        step1.classList.add("completed");
        step2.classList.add("completed");
        step3.classList.add("completed");
        step4.classList.add("active");
    } else if (checkoutState.selectedPayment) {
        step1.classList.add("completed");
        step2.classList.add("completed");
        step3.classList.add("active");
    } else if (checkoutState.userId || checkoutState.selectedNominal) {
        step1.classList.add("completed");
        step2.classList.add("active");
    } else if (checkoutState.selectedGame) {
        step1.classList.add("active");
    }
}

/**
 * ==========================================================================
 * VALIDATION & CHECKOUT PIPELINE
 * ==========================================================================
 */
function setupFormTriggers() {
    // Sinkronisasi data ID manual input ke State
    document.getElementById("form-user-id").addEventListener("input", (e) => {
        checkoutState.userId = e.target.value;
        updateProgressBar();
    });
    document.getElementById("form-zone-id").addEventListener("input", (e) => {
        checkoutState.zoneId = e.target.value;
    });

    // Back button handler
    document.getElementById("btn-back-to-games").addEventListener("click", () => {
        resetAppWorkflow();
        switchPage("selection-page");
    });

    // Submit Order button handler
    document.getElementById("btn-submit-order").addEventListener("click", () => {
        if (!checkoutState.selectedGame || !checkoutState.userId || !checkoutState.selectedNominal || !checkoutState.selectedPayment) {
            showToast("Harap lengkapi semua data terlebih dahulu");
            return;
        }
        
        // Populate modal data info
        document.getElementById("md-game").innerText = checkoutState.selectedGame.name;
        document.getElementById("md-uid").innerText = checkoutState.userId;
        document.getElementById("md-zid").innerText = checkoutState.selectedGame.hasZone && checkoutState.zoneId ? checkoutState.zoneId : "-";
        document.getElementById("md-nominal").innerText = checkoutState.selectedNominal;
        document.getElementById("md-payment").innerText = checkoutState.selectedPayment;

        // Buka modal konfirmasi UI
        document.getElementById("confirmation-modal").classList.remove("hidden");
    });

    // Modal action listener
    document.getElementById("btn-modal-cancel").addEventListener("click", () => {
        document.getElementById("confirmation-modal").classList.add("hidden");
    });

    document.getElementById("btn-modal-confirm").addEventListener("click", () => {
        document.getElementById("confirmation-modal").classList.add("hidden");
        executeSimulatedPayment();
    });

    // Reset Top Up Lagi Action
    document.getElementById("btn-reset").addEventListener("click", () => {
        resetAppWorkflow();
        switchPage("selection-page");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function executeSimulatedPayment() {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.classList.remove("hidden");

    // Simulasi 3 Detik Sistem Progress Bar Pembayaran Berjalan
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        showSuccessPage();
    }, 3000);
}

function showSuccessPage() {
    switchPage("success-page");
    updateProgressBar();

    // Generate Transaksi ID Acak Kapital Alfanumerik (E.g., TRX-4A8F9B2D)
    const randomChars = "0123456789ABCDEF";
    let token = "";
    for(let i = 0; i < 8; i++) {
        token += randomChars[Math.floor(Math.random() * 16)];
    }
    const finalTrxId = `TRX-${token}`;

    // Get current formatted date string (Indonesian Locale Format)
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateFormatted = new Date().toLocaleDateString('id-ID', options);

    // Render detail struk pembayaran sukses
    document.getElementById("success-trx-id").innerText = finalTrxId;
    document.getElementById("inv-game").innerText = checkoutState.selectedGame.name;
    document.getElementById("inv-uid").innerText = checkoutState.userId;
    document.getElementById("inv-nominal").innerText = checkoutState.selectedNominal;
    document.getElementById("inv-payment").innerText = checkoutState.selectedPayment;
    document.getElementById("inv-date").innerText = dateFormatted;
}

function resetAppWorkflow() {
    checkoutState = { selectedGame: null, userId: "", zoneId: "", selectedNominal: "", selectedPayment: "" };
    document.getElementById("form-user-id").value = "";
    document.getElementById("form-zone-id").value = "";
    document.getElementById("form-game-name").value = "";
    updateProgressBar();
}

/**
 * ==========================================================================
 * UTILITIES FUNCTIONS (THEME, SEARCH, TOAST, TOOGLE)
 * ==========================================================================
 */
function setupSearch() {
    const input = document.getElementById("search-input");
    input.className = "search-input"; // Inject class list for styles dynamically
    input.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = DATA_GAMES.filter(g => g.name.toLowerCase().includes(keyword));
        renderGames(filtered);
    });
}

function setupTheme() {
    const btn = document.getElementById("theme-toggle");
    const htmlEl = document.documentElement;

    btn.addEventListener("click", () => {
        const currentTheme = htmlEl.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        htmlEl.setAttribute("data-theme", nextTheme);
    });
}

function setupNavigation() {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("nav-menu");

    hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
        hamburger.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.remove("hidden");
    
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}