// Scroll-based gradient transitions for single-page layout

class ScrollTransitions {
	constructor() {
		this.sections = [
			{
				id: "home",
				colors: ["#ef008f", "#fb9209", "#c989ff", "#547cff"], // main
			},
			{
				id: "about",
				colors: ["#cb2727", "#ffcb57", "#ff3377", "#ff9090"], // about
			},
			{
				id: "contact",
				colors: ["#7038ff", "#5cede3", "#3853ff", "#db40ec"], // contact
			},
		];

		this.currentSection = 0;
		this.isTransitioning = false;
		this.lastSectionIndex = -1;
		this.lastProgress = -1;

		this.container = null;
		this.sectionEls = [];
		this.idToIndex = new Map();
		this.isSnapping = false;
		this.currentTargetIndex = null;

		this.init();
	}

	init() {
		// Prevent the browser from restoring previous scroll positions
		try {
			if ("scrollRestoration" in history) {
				history.scrollRestoration = "manual";
			}
		} catch (_) {}

		// Resolve scroll container (single page uses #appMount)
		this.container =
			document.getElementById("appMount") ||
			document.scrollingElement ||
			document.documentElement;

		// Add smooth scroll behavior to container
		document.documentElement.style.scrollBehavior = "smooth";

		// Build section element list and id->index map
		this.sectionEls = this.sections
			.map((s) => document.getElementById(s.id))
			.filter(Boolean);
		this.sections.forEach((s, i) => this.idToIndex.set(s.id, i));

		// Set up intersection observer for section detection
		this.setupIntersectionObserver();

		// Set up scroll event listener for smooth transitions
		this.setupScrollListener();

		// Attach snap controller and anchor navigation
		// Snap controller disabled per request
		this.setupAnchorNavigation();

		// Initial load: honor hash or default to Home top
		const initialHash = (window.location.hash || "").replace(/^#/, "");
		if (initialHash && this.idToIndex.has(initialHash)) {
			// Let the browser jump to the anchor naturally
			// Optionally ensure it's near top
			setTimeout(() => {
				document.getElementById(initialHash)?.scrollIntoView({
					behavior: "instant",
					block: "start",
				});
			}, 0);
		} else {
			// Default to Home top
			setTimeout(() => {
				(this.container || document.documentElement).scrollTop = 0;
			}, 0);
			try {
				history.replaceState(null, "", "#home");
			} catch (_) {}
		}

		// Initialize with home colors
		this.updateGradientColors(0);
	}

	getHeaderOffset() {
		const nav = document.querySelector(".navContainer");
		if (!nav) return 0;
		const rect = nav.getBoundingClientRect();
		return Math.ceil(rect.height);
	}

	getSectionTopInContainer(sec) {
		const c = this.container || document.documentElement;
		const cRect = c.getBoundingClientRect();
		const sRect = sec.getBoundingClientRect();
		return c.scrollTop + (sRect.top - cRect.top);
	}

	setupIntersectionObserver() {
		const header = this.getHeaderOffset();
		const options = {
			root: this.container,
			rootMargin: `-${header}px 0px -${header}px 0px`,
			threshold: 0,
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const sectionId = entry.target.id;
					const sectionIndex = this.sections.findIndex(
						(s) => s.id === sectionId
					);

					if (
						sectionIndex !== -1 &&
						sectionIndex !== this.currentSection
					) {
						this.transitionToSection(sectionIndex);
					}
				}
			});
		}, options);

		// Observe all sections
		this.sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) {
				observer.observe(element);
			}
		});
	}

	setupScrollListener() {
		let ticking = false;

		const target = this.container || window;
		target.addEventListener("scroll", () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					this.handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		});
	}

	handleScroll() {
		const el = this.container || document.documentElement;
		const scrollY = el.scrollTop;
		const windowHeight = el.clientHeight;
		const documentHeight = el.scrollHeight;

		// Calculate current section based on scroll position
		const sectionProgress = Math.max(
			0,
			Math.min(1, scrollY / (documentHeight - windowHeight))
		);
		const totalSections = this.sections.length;

		// Calculate which section we're in
		const currentSectionFloat = sectionProgress * (totalSections - 1);
		const currentSectionIndex = Math.floor(currentSectionFloat);
		const nextSectionIndex = Math.min(
			currentSectionIndex + 1,
			totalSections - 1
		);

		// Calculate progress between current and next section
		const progressBetweenSections =
			currentSectionFloat - currentSectionIndex;

		// Always update smoothly with interpolation between adjacent sections
		const factor = Math.max(0, Math.min(1, progressBetweenSections));
		this.updateGradientColors(currentSectionIndex, factor);
		this.lastSectionIndex = currentSectionIndex;
		this.lastProgress = progressBetweenSections;
	}

	// setupSnapController removed

	setupAnchorNavigation() {
		// Intercept in-page anchor clicks and do a simple smooth scroll
		document.addEventListener("click", (e) => {
			const a =
				e.target &&
				e.target.closest &&
				e.target.closest('a[href^="#"]');
			if (!a) return;
			const href = a.getAttribute("href") || "";
			// Ignore plain # or empty
			if (!href || href === "#") return;
			const id = decodeURIComponent(href.replace(/^#/, ""));
			const el = document.getElementById(id);
			if (!el) return;
			e.preventDefault();
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			history.pushState(null, "", `#${id}`);
		});

		// If hash changes (e.g., programmatic), center-snap to it
		window.addEventListener("hashchange", () => {
			const id = (window.location.hash || "").replace(/^#/, "");
			if (!id) return;
			document.getElementById(id)?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}

	transitionToSection(sectionIndex) {
		// Avoid conflicting time-based animations; rely on scroll-driven blending
		if (sectionIndex === this.currentSection) return;
		this.currentSection = sectionIndex;
	}

	updateGradientColors(sectionIndex, interpolationFactor = 0) {
		const section = this.sections[sectionIndex];
		if (!section) return;

		const nextSection = this.sections[sectionIndex + 1];

		// If we have a next section and interpolation factor, blend colors
		if (nextSection && interpolationFactor > 0) {
			const blendedColors = this.interpolateColors(
				section.colors,
				nextSection.colors,
				interpolationFactor
			);
			this.applyColors(blendedColors);
		} else {
			this.applyColors(section.colors);
		}
	}

	interpolateColors(colors1, colors2, factor) {
		return colors1.map((color1, index) => {
			const color2 = colors2[index];
			return this.interpolateColor(color1, color2, factor);
		});
	}

	interpolateColor(color1, color2, factor) {
		const hex1 = color1.replace("#", "");
		const hex2 = color2.replace("#", "");

		const r1 = parseInt(hex1.substr(0, 2), 16);
		const g1 = parseInt(hex1.substr(2, 2), 16);
		const b1 = parseInt(hex1.substr(4, 2), 16);

		const r2 = parseInt(hex2.substr(0, 2), 16);
		const g2 = parseInt(hex2.substr(2, 2), 16);
		const b2 = parseInt(hex2.substr(4, 2), 16);

		const r = Math.round(r1 + (r2 - r1) * factor);
		const g = Math.round(g1 + (g2 - g1) * factor);
		const b = Math.round(b1 + (b2 - b1) * factor);

		return `#${r.toString(16).padStart(2, "0")}${g
			.toString(16)
			.padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	}

	applyColors(colors) {
		const target =
			document.getElementById("gradient-canvas") ||
			document.documentElement;
		colors.forEach((color, index) => {
			target.style.setProperty(`--gradient-color-${index + 1}`, color);
		});

		// Debug log to see color changes
		console.log("Applied colors:", colors);
	}

	animateGradientTransition(sectionIndex, callback) {
		const targetColors = this.sections[sectionIndex].colors;
		const startColors = [];

		// Get current colors from the same target we write to (canvas preferred)
		const root =
			document.getElementById("gradient-canvas") ||
			document.documentElement;
		for (let i = 1; i <= 4; i++) {
			const currentColor = getComputedStyle(root)
				.getPropertyValue(`--gradient-color-${i}`)
				.trim();
			startColors.push(currentColor);
		}

		const duration = 800; // 800ms transition
		const startTime = performance.now();

		const animate = (currentTime) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Use easing function for smooth transition
			const easedProgress = this.easeInOutCubic(progress);

			const interpolatedColors = this.interpolateColors(
				startColors,
				targetColors,
				easedProgress
			);
			this.applyColors(interpolatedColors);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				callback && callback();
			}
		};

		requestAnimationFrame(animate);
	}

	easeInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}
}

// Initialize scroll transitions when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	new ScrollTransitions();
});
