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
		this.setupSnapController();
		this.setupAnchorNavigation();

		// Center-snap on initial load
		const initialHash = (window.location.hash || "").replace(/^#/, "");
		if (initialHash && this.idToIndex.has(initialHash)) {
			// Respect direct links like #about or #contact
			setTimeout(() => {
				this.scrollToIndex &&
					this.scrollToIndex(this.idToIndex.get(initialHash));
			}, 0);
		} else {
			// Default to Home
			setTimeout(() => {
				this.scrollToIndex && this.scrollToIndex(0);
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

	setupSnapController() {
		const container = this.container;
		if (!container || !this.sectionEls.length) return;
		const getHeaderOffset = () => this.getHeaderOffset();

		const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

		const getCurrentIndex = () => {
			let bestIdx = 0;
			let bestDist = Infinity;
			const header = getHeaderOffset();
			const viewportCenter =
				container.scrollTop +
				header +
				(container.clientHeight - header) / 2;
			this.sectionEls.forEach((sec, i) => {
				const secTop = this.getSectionTopInContainer(sec);
				const secCenter = secTop + sec.offsetHeight / 2;
				const dist = Math.abs(secCenter - viewportCenter);
				if (dist < bestDist) {
					bestDist = dist;
					bestIdx = i;
				}
			});
			return bestIdx;
		};

		let lastTargetTop = null;
		let unlockTimer = null;

		const clearUnlock = () => {
			if (unlockTimer) {
				clearTimeout(unlockTimer);
				unlockTimer = null;
			}
		};

		const onScrollEnd = () => {
			// Finalize centering if CSS snap nudged us
			if (lastTargetTop != null) {
				const diff = Math.abs(container.scrollTop - lastTargetTop);
				if (diff > 2) {
					container.scrollTo({
						top: lastTargetTop,
						behavior: "auto",
					});
				}
			}
			this.isSnapping = false;
			this.currentTargetIndex = null;
			clearUnlock();
		};

		// Prefer scrollend when supported
		container.addEventListener("scrollend", onScrollEnd);

		const scrollToIndex = (idx) => {
			if (idx < 0 || idx >= this.sectionEls.length) return;
			this.isSnapping = true;
			this.currentTargetIndex = idx;
			const header = getHeaderOffset();
			const sec = this.sectionEls[idx];
			const secTop = this.getSectionTopInContainer(sec);
			const secH = sec.offsetHeight;
			const vpH = container.clientHeight;
			const visibleH = Math.max(1, vpH - header);
			let targetTop = Math.round(secTop - header + (secH - visibleH) / 2);
			// clamp within scrollable range
			const maxTop = container.scrollHeight - vpH;
			targetTop = clamp(targetTop, 0, maxTop);
			lastTargetTop = targetTop;
			container.scrollTo({ top: targetTop, behavior: "smooth" });
			// Fallback unlock if scrollend isn't supported
			clearUnlock();
			unlockTimer = window.setTimeout(() => {
				onScrollEnd();
			}, 700);
		};

		// Expose for anchor navigation
		this.scrollToIndex = scrollToIndex;

		const onWheel = (e) => {
			if (e.ctrlKey) return; // allow zoom gesture
			const dy = e.deltaY;
			if (Math.abs(dy) < 2) return; // ignore tiny movements
			e.preventDefault();
			const cur = getCurrentIndex();
			const dir = dy > 0 ? 1 : -1;
			const next = clamp(cur + dir, 0, this.sectionEls.length - 1);
			if (this.isSnapping && this.currentTargetIndex !== next) {
				clearUnlock();
				this.isSnapping = false;
				lastTargetTop = null;
			}
			if (next !== cur) scrollToIndex(next);
		};

		const onKey = (e) => {
			let dir = 0;
			if (
				e.code === "ArrowDown" ||
				e.code === "PageDown" ||
				e.code === "Space"
			)
				dir = 1;
			if (e.code === "ArrowUp" || e.code === "PageUp") dir = -1;
			if (!dir) return;
			e.preventDefault();
			const cur = getCurrentIndex();
			const next = clamp(cur + dir, 0, this.sectionEls.length - 1);
			if (this.isSnapping && this.currentTargetIndex !== next) {
				clearUnlock();
				this.isSnapping = false;
				lastTargetTop = null;
			}
			if (next !== cur) scrollToIndex(next);
		};

		container.addEventListener("wheel", onWheel, { passive: false });
		window.addEventListener("keydown", onKey, { passive: false });
	}

	setupAnchorNavigation() {
		// Intercept in-page anchor clicks like #home, #about, #contact
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
			if (!this.idToIndex.has(id)) return; // not one of our sections
			e.preventDefault();
			const idx = this.idToIndex.get(id);
			if (typeof this.scrollToIndex === "function") {
				this.scrollToIndex(idx);
			}
			// Update URL without triggering hashchange scroll jumps
			history.pushState(null, "", `#${id}`);
		});

		// If hash changes (e.g., programmatic), center-snap to it
		window.addEventListener("hashchange", () => {
			const id = (window.location.hash || "").replace(/^#/, "");
			if (!id || !this.idToIndex.has(id)) return;
			if (typeof this.scrollToIndex === "function") {
				this.scrollToIndex(this.idToIndex.get(id));
			}
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
