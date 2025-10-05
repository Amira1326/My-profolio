// carousel.js

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.portfolio-carousel');
    const prevBtn = document.querySelector('.carousel-btn.prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next-btn');
    
    // Check if elements exist before trying to manipulate them
    if (!carousel || !prevBtn || !nextBtn) {
        console.warn('Carousel elements not found. Carousel might not function.');
        return;
    }

    const scrollAmount = 350; // Adjust this value based on your item width + gap

    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Optional: Add/remove active class for navbar on scroll
    // This part assumes your main script.js handles general active class.
    // If not, you might need to add scroll listener here too.
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust this value to trigger active class earlier or later
            if (pageYOffset >= sectionTop - sectionHeight / 3) { 
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Additional script.js content (from previous interactions, if any)
    // For example, the text animation and menu icon functionality.
    // If you have existing script.js, merge this part carefully.

    // Text Animation (from your existing script.js)
    const textElement = document.querySelector('.home-content .text-animation span');
    const professions = ["Web Developer", "UI/UX Designer", "Data Analyst"]; // Your professions
    let professionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentProfession = professions[professionIndex];
        const currentChar = currentProfession.substring(0, charIndex);
        textElement.textContent = currentChar;

        if (!isDeleting && charIndex < currentProfession.length) {
            charIndex++;
            setTimeout(typeEffect, 100); // Typing speed
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeEffect, 50); // Deleting speed
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                professionIndex = (professionIndex + 1) % professions.length;
            }
            setTimeout(typeEffect, 1000); // Pause before next action
        }
    }

    if (textElement) {
        typeEffect();
    }

    // Toggle menu icon and navbar (from your existing script.js)
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };

        // Close navbar when a link is clicked
        navbar.querySelectorAll('a').forEach(link => {
            link.onclick = () => {
                menuIcon.classList.remove('bx-x');
                navbar.classList.remove('active');
            };
        });
    }
});