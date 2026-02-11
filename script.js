// ==================== Hamburguer Menu ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Close menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.style.display = 'none';
    });
});

// ==================== Smooth Scrolling ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Countdown Timer ====================
function startCountdown() {
    // Set the wedding date (ganti sesuai tanggal pernikahan Anda)
    const weddingDate = new Date('2024-03-15').getTime();

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeRemaining = weddingDate - now;

        if (timeRemaining > 0) {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        } else {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-timer').innerHTML = '<h3>Acara telah dimulai! 🎉</h3>';
        }
    }, 1000);
}

startCountdown();

// ==================== RSVP Form ====================
const rsvpForm = document.getElementById('rsvpForm');
const successMessage = document.getElementById('successMessage');

rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validasi form
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const attendance = document.getElementById('attendance').value;
    const guests = document.getElementById('guests').value;

    if (!name || !phone || !attendance || !guests) {
        alert('Mohon isi semua kolom yang wajib diisi!');
        return;
    }

    // Validasi nomor WhatsApp
    if (!phone.match(/^\d{10,15}$/)) {
        alert('Nomor WhatsApp tidak valid! Gunakan format: 62812345678');
        return;
    }

    // Siapkan data
    const formData = {
        name: name,
        phone: phone,
        email: document.getElementById('email').value || '-',
        attendance: attendance,
        guests: guests,
        allergies: document.getElementById('allergies').value || '-',
        message: document.getElementById('message').value || '-',
        timestamp: new Date().toLocaleString('id-ID')
    };

    // Log data (dalam implementasi nyata, kirim ke server)
    console.log('Data RSVP:', formData);

    // Simulasi pengiriman ke WhatsApp
    const whatsappMessage = `
Konfirmasi Kehadiran Pernikahan
================================
Nama: ${formData.name}
Nomor WhatsApp: ${formData.phone}
Email: ${formData.email}
Status Kehadiran: ${formData.attendance}
Jumlah Tamu: ${formData.guests}
Alergi Makanan: ${formData.allergies}
Pesan: ${formData.message}
Waktu: ${formData.timestamp}
    `;

    // Bisa tambahkan pengiriman ke API backend di sini
    // await fetch('/api/rsvp', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });

    // Tampilkan pesan sukses
    rsvpForm.style.display = 'none';
    successMessage.style.display = 'block';

    // Reset form setelah 3 detik
    setTimeout(() => {
        rsvpForm.reset();
        rsvpForm.style.display = 'block';
        successMessage.style.display = 'none';
    }, 3000);

    // Optional: Redirect ke WhatsApp
    // const whatsappLink = `https://wa.me/62812345678?text=${encodeURIComponent(whatsappMessage)}`;
    // window.open(whatsappLink, '_blank');
});

// ==================== Music Toggle ====================
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
let isPlaying = false;

// Auto-play music (beberapa browser memerlukan interaksi user terlebih dahulu)
window.addEventListener('load', () => {
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            musicToggle.classList.add('playing');
        }).catch(() => {
            // Autoplay dicegah browser
            console.log('Autoplay dicegah oleh browser');
        });
    }
});

musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        musicToggle.classList.remove('playing');
    } else {
        bgMusic.play();
        isPlaying = true;
        musicToggle.classList.add('playing');
    }
});

// ==================== Intersection Observer untuk Animasi ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe semua element dengan class spesifik
document.querySelectorAll('.couple-card, .timeline-item, .gallery-item, .wish-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ==================== Gallery Lightbox (Opsional) ====================
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const src = img.src;
        
        // Buat modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            cursor: pointer;
        `;
        
        const imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        `;
        
        modal.appendChild(imgElement);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', () => {
            modal.remove();
        });
    });
});

// ==================== Responsive Navigation ====================
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        navMenu.style.display = 'flex';
    } else if (!hamburger.classList.contains('active')) {
        navMenu.style.display = 'none';
    }
});

// ==================== Scroll Animation untuk Header ====================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScrollTop = scrollTop;
});

// ==================== Fungsi Utility ====================
// Format angka dengan leading zero
function padZero(num) {
    return String(num).padStart(2, '0');
}

// Cek jika elemen ada di viewport
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==================== Page Load Animation ====================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== Keyboard Navigation ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.style.display = 'none';
    }
});

// ==================== Analytics (Optional) ====================
// Tambahkan tracking untuk event penting
function trackEvent(eventName, eventData) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log('Event tracked:', eventName, eventData);
}

// Track ketika user confirm RSVP
rsvpForm.addEventListener('submit', () => {
    trackEvent('rsvp_submitted', {
        event_category: 'engagement',
        event_label: 'user_confirmed_rsvp'
    });
});

// ==================== Service Worker (PWA) ====================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service Worker tidak terdaftar (normal untuk development)');
    });
}

console.log('✨ Selamat datang di website undangan digital pernikahan kami! 💍');