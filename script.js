document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav a');

    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('open'));
    }

    // Tự động đóng menu trên điện thoại khi click vào 1 link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
            }
        });
    });

    // Xử lý lỗi tải ảnh Avatar (Hiển thị chữ NP thay thế nếu lỗi file)
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('error', function () { 
            avatar.src = 'https://ui-avatars.com/api/?name=Huu+Phuoc&background=0d3b66&color=fff&size=220'; 
        });
    }

    // Language toggle (default English)
    const langToggle = document.getElementById('lang-toggle');
    function setLanguage(lang) {
        document.body.classList.remove('lang-en', 'lang-vi');
        document.body.classList.add('lang-' + lang);
        if (langToggle) langToggle.textContent = (lang === 'en') ? 'VI' : 'EN';
        try { localStorage.setItem('site-lang', lang); } catch(e){}
    }

    // initialize from localStorage or default to 'en'
    const savedLang = (function(){ try { return localStorage.getItem('site-lang'); } catch(e){ return null; } })() || 'en';
    setLanguage(savedLang);

    if (langToggle) {
        langToggle.addEventListener('click', function () {
            const current = document.body.classList.contains('lang-en') ? 'en' : 'vi';
            const next = (current === 'en') ? 'vi' : 'en';
            setLanguage(next);
        });
    }

    const emailLink = document.querySelector('.profile-details a[href^="mailto:"]');
    if (emailLink) {
        const email = emailLink.textContent.trim();
        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="email-modal-box">
                <div class="email-modal-title">Email</div>
                <div class="email-modal-value">${email}</div>
                <button type="button" class="email-modal-close">OK</button>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.email-modal-close');
        function openEmailModal() {
            modal.classList.add('open');
        }
        function closeEmailModal() {
            modal.classList.remove('open');
        }

        emailLink.setAttribute('title', email);
        emailLink.addEventListener('click', function (event) {
            event.preventDefault();
            openEmailModal();
        });
        closeBtn.addEventListener('click', closeEmailModal);
        modal.addEventListener('click', function (event) {
            if (event.target === modal) closeEmailModal();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeEmailModal();
        });
    }

    // Preserve desktop two-column hero layout on very small screens by applying a scale helper class
    function updateHeroScale() {
        const heroGrid = document.querySelector('.hero-grid');
        if (!heroGrid) return;
        const threshold = 420; // px - below this, scale down to preserve layout
        if (window.innerWidth <= threshold) {
            heroGrid.classList.add('should-scale');
        } else {
            heroGrid.classList.remove('should-scale');
        }
    }

    window.addEventListener('resize', updateHeroScale);
    updateHeroScale();
});
