const skillLogos = document.querySelectorAll('.skillLogo');

skillLogos.forEach((logo, index) => {
    logo.style.animation = `fade-in-left 0.3s ${index * 0.03}s ease-out forwards`;
});
