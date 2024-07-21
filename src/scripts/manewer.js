// use a script tag or an external JS file
document.addEventListener("DOMContentLoaded", (event) => {
	gsap.registerPlugin(ScrollTrigger);
});

const transitionElements = [
	// header
	{ name: "#headerText", x: 0, y: 400, r: 0, d: 1.8 },
	{ name: "#separator", x: 0, y: 1200, r: 0, d: 2.6 },
	{ name: "#headerSubtextOne", x: 1400, y: 0, r: 0, d: 2.0 },
	{ name: "#headerSubtextTwo", x: 1000, y: 0, r: 0, d: 2.0 },
	{ name: "#description", x: 0, y: 200, r: 0, d: 1.2 },
	{ name: "#arrow", x: 0, y: 200, r: 360, d: 1.5 },
];

const scrollHeadingElements = [
	{
		name: "#headerText",
		trigger: "header",
		scrub: 0.6,
		x: -600,
		y: -600,
		r: 0,
	},
	{ name: "#separator", trigger: "header", scrub: 0.6, x: 0, y: 1000, r: 0 },
	{
		name: "#headerSubtextOne",
		trigger: "header",
		scrub: 0.6,
		x: 900,
		y: -600,
		r: 0,
	},
	{
		name: "#headerSubtextTwo",
		trigger: "header",
		scrub: 0.6,
		x: 1200,
		y: -600,
		r: 0,
	},
	{
		name: "#description",
		trigger: "header",
		scrub: 0.6,
		x: 1000,
		y: -600,
		r: 0,
	},
	{
		name: "#arrow",
		trigger: "header",
		scrub: 0.6,
		x: -1000,
		y: -600,
		r: 180,
	},
	{ name: "#overlay", trigger: "header", scrub: 0.6, x: 0, y: -600, r: 0 },
	{ name: "#background", trigger: "header", scrub: 0.6, x: 0, y: -600, r: 0 },
	{
		name: "#firstSectionHeading",
		trigger: "header",
		scrub: 0.6,
		x: 20,
		y: 0,
		r: 0,
	},
	{
		name: "#firstSectionText",
		trigger: "header",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#firstSectionDescription",
		trigger: "header",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{ name: "#protoSvg", trigger: "header", scrub: 0.6, x: 0, y: 0, r: 0 },
	{
		name: "#secondSectionHeading",
		trigger: "#firstSectionHeading",
		scrub: 0.6,
		x: 20,
		y: 0,
		r: 0,
	},
	{
		name: "#secondSectionText",
		trigger: "#firstSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#secondSectionDescription",
		trigger: "#firstSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#protoSvg2",
		trigger: "#firstSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#thirdSectionHeading",
		trigger: "#secondSectionHeading",
		scrub: 0.6,
		x: 20,
		y: 0,
		r: 0,
	},
	{
		name: "#thirdSectionText",
		trigger: "#secondSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#thirdSectionDescription",
		trigger: "#secondSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#chicken",
		trigger: ".secondSectionWrapper",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#fourthSectionHeading",
		trigger: "#thirdSectionHeading",
		scrub: 0.6,
		x: 20,
		y: 0,
		r: 0,
	},
	{
		name: "#fourthSectionText",
		trigger: "#thirdSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#fourthSectionDescription",
		trigger: "#thirdSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
	{
		name: "#chartSvg",
		trigger: "#thirdSectionHeading",
		scrub: 0.6,
		x: 0,
		y: 0,
		r: 0,
	},
];

/**
 * very basic scroll trigger handler
 * @param {*} element element DOM name
 * @param {*} trigger element trigger
 * @param {*} scrub scrub speed
 * @param {*} x change in x
 * @param {*} y change in y
 * @param {*} rotation rotation
 * @returns {*} scrollTrigger object
 */
function createScrollTrigger(element, trigger, scrub, x, y, rotation) {
	gsap.to(`${element}`, {
		scrollTrigger: {
			trigger: `${trigger}`,
			start: "top top",
			end: "+=600",
			scrub: scrub,
			markers: false,
		},
		x: x,
		y: y,
		rotation: rotation,
		ease: "none",
	});
}

function createTransitionTween(element, x, y, r, d) {
	gsap.from(`${element}`, {
		x: x,
		y: y,
		rotation: r,
		duration: d,
		ease: "expo",
	});
}

scrollHeadingElements.forEach((_trigger) => {
	createScrollTrigger(
		_trigger["name"],
		_trigger["trigger"],
		_trigger["scrub"],
		_trigger["x"],
		_trigger["y"],
		_trigger["r"]
	);
});
transitionElements.forEach((_trigger) => {
	createTransitionTween(
		_trigger["name"],
		_trigger["x"],
		_trigger["y"],
		_trigger["r"],
		_trigger["d"]
	);
});