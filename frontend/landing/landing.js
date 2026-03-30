// Landing Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      
      // Animate hamburger icon
      const spans = mobileMenuBtn.querySelectorAll('span');
      if (mobileMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  }
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Close mobile menu if open
          if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
          }
        }
      }
    });
  });
  
  // Generate hero illustration if image doesn't exist
  const heroImage = document.getElementById('heroImage');
  if (heroImage) {
    heroImage.onerror = function() {
      // Create a placeholder SVG
      const svg = `
        <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:hsl(220, 85%, 55%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(270, 70%, 60%);stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="250" cy="250" r="200" fill="url(#grad1)" opacity="0.2"/>
          <circle cx="250" cy="250" r="150" fill="url(#grad1)" opacity="0.3"/>
          <circle cx="250" cy="250" r="100" fill="url(#grad1)" opacity="0.5"/>
          <text x="250" y="260" font-family="Arial" font-size="80" fill="white" text-anchor="middle">🔧</text>
        </svg>
      `;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      this.src = URL.createObjectURL(blob);
    };
  }
  
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe service cards
  document.querySelectorAll('.service-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
  });
  
  // Parallax effect for hero shapes
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.1;
      shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
  
  // Counter animation for stats
  const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 30);
  };
  
  // Observe stats
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const value = entry.target.textContent;
        const numericValue = parseInt(value.replace(/\D/g, ''));
        if (numericValue) {
          entry.target.textContent = '0';
          animateCounter(entry.target, numericValue);
        }
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.stat-value').forEach(stat => {
    statsObserver.observe(stat);
  });
});
