// Single Page Scrolling and Background Transitions
document.addEventListener("DOMContentLoaded", function () {
	const sections = document.querySelectorAll(".section");
	const navLinks = document.querySelectorAll(".navLink");
	const appMount = document.getElementById("appMount");

	// Smooth scrolling for navigation links
	navLinks.forEach((link) => {
		link.addEventListener("click", function (e) {
			e.preventDefault();
			const targetId = this.getAttribute("href").substring(1);
			const targetSection = document.getElementById(targetId);

			if (targetSection) {
				targetSection.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});

	// Section detection and background transitions
	function updateActiveSection() {
		const scrollPosition = appMount.scrollTop;
		const windowHeight = window.innerHeight;

		sections.forEach((section, index) => {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.offsetHeight;

			// Check if section is in view
			if (
				scrollPosition >= sectionTop - windowHeight * 0.5 &&
				scrollPosition < sectionTop + sectionHeight - windowHeight * 0.5
			) {
				// Add active class
				section.classList.add("active");

				// Update navigation active state
				navLinks.forEach((link) => link.classList.remove("active"));
				const correspondingNavLink = document.querySelector(
					`[href="#${section.id}"]`
				);
				if (correspondingNavLink) {
					correspondingNavLink.classList.add("active");
				}

				// Update background based on section
				updateBackground(section.id);
			} else {
				section.classList.remove("active");
			}
		});
	}

	// Background transition function
	function updateBackground(sectionId) {
		const body = document.body;
		const canvas = document.getElementById("gradient-canvas");

		// Remove existing background classes
		body.classList.remove("home-bg", "about-bg", "contact-bg");

		// Add new background class
		switch (sectionId) {
			case "home":
				body.classList.add("home-bg");
				if (canvas) {
					canvas.style.opacity = "0.8";
				}
				break;
			case "about":
				body.classList.add("about-bg");
				if (canvas) {
					canvas.style.opacity = "0.8";
				}
				break;
			case "contact":
				body.classList.add("contact-bg");
				if (canvas) {
					canvas.style.opacity = "0.8";
				}
				break;
		}
	}

	// Throttled scroll handler for performance
	let ticking = false;
	function requestTick() {
		if (!ticking) {
			requestAnimationFrame(updateActiveSection);
			ticking = true;
		}
	}

	function handleScroll() {
		ticking = false;
		requestTick();
	}

	// Add scroll event listener
	appMount.addEventListener("scroll", handleScroll);

	// Initial call to set up initial state
	updateActiveSection();

	// Handle keyboard navigation
	document.addEventListener("keydown", function (e) {
		const currentSection = getCurrentSection();
		let targetSection = null;

		switch (e.key) {
			case "ArrowDown":
			case "PageDown":
				e.preventDefault();
				targetSection = getNextSection(currentSection);
				break;
			case "ArrowUp":
			case "PageUp":
				e.preventDefault();
				targetSection = getPreviousSection(currentSection);
				break;
			case "Home":
				e.preventDefault();
				targetSection = document.getElementById("home");
				break;
			case "End":
				e.preventDefault();
				targetSection = document.getElementById("contact");
				break;
		}

		if (targetSection) {
			targetSection.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	});

	// Helper functions for keyboard navigation
	function getCurrentSection() {
		const scrollPosition = appMount.scrollTop;
		const windowHeight = window.innerHeight;

		for (let section of sections) {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.offsetHeight;

			if (
				scrollPosition >= sectionTop - windowHeight * 0.5 &&
				scrollPosition < sectionTop + sectionHeight - windowHeight * 0.5
			) {
				return section;
			}
		}
		return sections[0];
	}

	function getNextSection(currentSection) {
		const currentIndex = Array.from(sections).indexOf(currentSection);
		return currentIndex < sections.length - 1
			? sections[currentIndex + 1]
			: null;
	}

	function getPreviousSection(currentSection) {
		const currentIndex = Array.from(sections).indexOf(currentSection);
		return currentIndex > 0 ? sections[currentIndex - 1] : null;
	}

	// Touch/swipe support for mobile
	let touchStartY = 0;
	let touchEndY = 0;

	appMount.addEventListener("touchstart", function (e) {
		touchStartY = e.touches[0].clientY;
	});

	appMount.addEventListener("touchend", function (e) {
		touchEndY = e.changedTouches[0].clientY;
		handleSwipe();
	});

	function handleSwipe() {
		const swipeThreshold = 50;
		const diff = touchStartY - touchEndY;

		if (Math.abs(diff) > swipeThreshold) {
			const currentSection = getCurrentSection();
			let targetSection = null;

			if (diff > 0) {
				// Swipe up - go to next section
				targetSection = getNextSection(currentSection);
			} else {
				// Swipe down - go to previous section
				targetSection = getPreviousSection(currentSection);
			}

			if (targetSection) {
				targetSection.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}
	}

	// Intersection Observer for better performance
	if ("IntersectionObserver" in window) {
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("active");
						updateBackground(entry.target.id);
					} else {
						entry.target.classList.remove("active");
					}
				});
			},
			{
				threshold: 0.5,
				rootMargin: "-10% 0px -10% 0px",
			}
		);

		sections.forEach((section) => {
			sectionObserver.observe(section);
		});
	}

	// Add CSS classes for background transitions
	document.body.classList.add("single-page-mode");

	// Initialize first section as active
	if (sections.length > 0) {
		sections[0].classList.add("active");
		updateBackground("home");
	}
});
