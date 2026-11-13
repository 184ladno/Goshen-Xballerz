/* =====================================================================
   GOSHEN XBALLERZ – SITE SCRIPT (loaded by every page)
   ---------------------------------------------------------------------
   Every feature below checks whether its HTML exists on the current page
   before doing anything, so one file can serve all pages safely.

   CONTENTS (search for the "----------" headings):
     0. Settings            ← the things you are most likely to edit
     1. Player pop-up        (home page)
     2. Feature scroll section (home page)
     3. Scrolling behaviour  (every page)
     4. FAQ widget           (every page)
     5. Contact form         (contact page)
     6. Compact sticky header (every page)
     7. Coach profile pop-ups (coaches page)

   Tip: if something stops working, open the browser's developer tools
   (F12 → Console). Errors there show the line number in this file.
   ===================================================================== */


/* ---------- 0. Settings ---------- */

// Address the contact form sends enquiries to.
// (Also update the email link shown on contact.html.)
const CONTACT_EMAIL = "info@goshenxballerz.co.uk";

// Popular questions shown in the FAQ pop-up on every page.
// Add or remove { question, answer } lines as needed.
const POPULAR_QUESTIONS = [
	{ question: "[Question]", answer: "[Answer]" },
	{ question: "[Question]", answer: "[Answer]" },
	{ question: "[Question]", answer: "[Answer]" },
	{ question: "[Question]", answer: "[Answer]" },
	{ question: "[Question]", answer: "[Answer]" },
];

// "Have a question?" speech bubble beside the FAQ button (milliseconds).
const HINT_FIRST_DELAY = 5000;   // first appearance after the page loads
const HINT_VISIBLE_FOR = 5000;   // how long it stays on screen
const HINT_REPEAT_EVERY = 20000; // time between appearances


/* ---------- Small helper used by several pop-ups ----------
   Lets a <dialog> close when the visitor clicks the dark area around it. */
function closeOnBackdropClick(dialog) {
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});
}


/* ---------- 1. Player pop-up (home page) ----------
   Clicking the big player image opens #player-dialog. */
function initPlayerDialog() {
	const trigger = document.querySelector(".hero-player");
	const dialog = document.querySelector("#player-dialog");
	if (!trigger || !dialog) return;

	trigger.addEventListener("click", () => dialog.showModal());
	dialog.querySelector(".player-dialog-close").addEventListener("click", () => dialog.close());
	closeOnBackdropClick(dialog);
}


/* ---------- 2. Feature scroll section (home page) ----------
   The right-hand .feature-copy articles in index.html are the single
   source of truth: to change the text/images, edit those articles only.
   Each article's .feature-summary is copied into the sticky left panel,
   and the step nearest the middle of the screen becomes "active". */
function initFeatureShowcase(section) {
	const articles = [...section.querySelectorAll(".feature-copy[data-feature]")];
	const stage = section.querySelector(".feature-description-stage");
	const progress = section.querySelector(".feature-progress");
	if (!articles.length || !stage) return;

	// Build one left-hand panel (and one numbered progress dot) per article.
	const panels = articles.map((article, index) => {
		const panel = document.createElement("article");
		panel.className = "feature-description-panel";
		panel.dataset.description = article.dataset.feature;

		const label = article.querySelector(".feature-number");
		if (label) panel.append(label.cloneNode(true));

		const summary = article.querySelector(".feature-summary");
		if (summary) panel.append(...[...summary.children].map((child) => child.cloneNode(true)));
		panel.classList.toggle("has-image", Boolean(panel.querySelector(".feature-image")));

		stage.append(panel);

		if (progress) {
			const dot = document.createElement("li");
			dot.dataset.step = article.dataset.feature;
			dot.textContent = String(index + 1).padStart(2, "0"); // 01, 02, 03…
			progress.append(dot);
		}
		return panel;
	});
	const dots = progress ? [...progress.children] : [];

	// Highlight one step (by its data-feature name) everywhere at once.
	let activeName = null;
	function setActive(name) {
		if (name === activeName) return;
		activeName = name;
		articles.forEach((el) => el.classList.toggle("is-active", el.dataset.feature === name));
		panels.forEach((el) => {
			const isActive = el.dataset.description === name;
			el.classList.toggle("is-active", isActive);
			el.setAttribute("aria-hidden", String(!isActive));
		});
		dots.forEach((el) => el.classList.toggle("is-active", el.dataset.step === name));
	}

	setActive(articles[0].dataset.feature);

	if (!("IntersectionObserver" in window)) return; // very old browsers: first step stays active

	// Active step = the last article whose top edge has passed the middle of the screen.
	function updateActive() {
		const centre = window.innerHeight / 2;
		let current = articles[0];
		articles.forEach((article) => {
			if (article.getBoundingClientRect().top <= centre) current = article;
		});
		setActive(current.dataset.feature);
	}

	// Re-check when an article moves through the middle band of the screen,
	// or when the whole list enters/leaves the screen (jumps, reloads mid-page).
	const bandThresholds = Array.from({ length: 21 }, (_, i) => i / 20);
	const bandObserver = new IntersectionObserver(updateActive, { rootMargin: "-40% 0px -40% 0px", threshold: bandThresholds });
	articles.forEach((article) => bandObserver.observe(article));

	const listObserver = new IntersectionObserver(updateActive, { threshold: [0, 0.25, 0.5, 0.75, 1] });
	listObserver.observe(section.querySelector(".feature-list"));
}


/* ---------- 3. Scrolling behaviour (every page) ----------
   - Reloading a page always starts at the top.
   - In-page links (e.g. "Read reviews" → #reviews) scroll smoothly
     without adding #reviews to the address bar.
   - A link from another page to a section (e.g. index.html#reviews)
     still jumps straight to it. */
function initScrolling() {
	if ("scrollRestoration" in history) history.scrollRestoration = "manual";

	const navigationEntry = performance.getEntriesByType("navigation")[0];
	if (navigationEntry && navigationEntry.type === "reload") {
		if (location.hash) history.replaceState(null, "", location.pathname + location.search);
		window.addEventListener("load", () => window.scrollTo(0, 0));
	}

	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener("click", (event) => {
			const target = document.getElementById(link.getAttribute("href").slice(1));
			if (!target) return;
			event.preventDefault();
			target.scrollIntoView(); // smooth via CSS scroll-behavior (respects reduced motion)
		});
	});
}


/* ---------- 4. FAQ widget (every page) ----------
   Adds the round avatar button in the bottom-right corner. Clicking it
   opens a pop-up listing POPULAR_QUESTIONS (see Settings at the top).
   All of its HTML is created here, so it doesn't appear in the .html files. */
function initFaqWidget() {
	const widget = document.createElement("div");
	widget.className = "faq-widget";

	const items = POPULAR_QUESTIONS.map(({ question, answer }) => `
		<details class="faq-item">
			<summary>
				<span class="faq-question">${question}</span>
				<span class="faq-icon" aria-hidden="true"></span>
			</summary>
			<div class="faq-answer"><p>${answer}</p></div>
		</details>`).join("");

	widget.innerHTML = `
		<div class="faq-popup" id="faq-popup" role="dialog" aria-labelledby="faq-popup-title" hidden>
			<div class="faq-popup-header">
				<p class="faq-popup-label">FAQ</p>
				<h2 id="faq-popup-title">Popular questions</h2>
				<button type="button" class="faq-popup-close" aria-label="Close popular questions">&times;</button>
			</div>
			<div class="faq-popup-body">
				<div class="faq-list">${items}</div>
			</div>
			<a class="faq-popup-contact" href="contact.html">Need more information? <span>Contact us</span></a>
		</div>
		<p class="faq-widget-hint" aria-hidden="true">Have a question?</p>
		<button type="button" class="faq-widget-button" aria-label="Popular questions" aria-expanded="false" aria-controls="faq-popup"></button>`;

	document.body.append(widget);

	const button = widget.querySelector(".faq-widget-button");
	const popup = widget.querySelector(".faq-popup");
	const close = widget.querySelector(".faq-popup-close");
	const hint = widget.querySelector(".faq-widget-hint");

	function setOpen(open) {
		popup.hidden = !open;
		button.setAttribute("aria-expanded", String(open));
		widget.classList.toggle("is-open", open);
		if (open) close.focus();
	}

	// "Have a question?" bubble: pops up now and then until the button is clicked.
	let hintDismissed = false;
	let hintInterval;
	const hintTimers = [];

	function showHint() {
		if (hintDismissed || !popup.hidden) return;
		hint.classList.add("is-visible");
		hintTimers.push(setTimeout(() => hint.classList.remove("is-visible"), HINT_VISIBLE_FOR));
	}

	function dismissHint() {
		hintDismissed = true;
		hintTimers.forEach(clearTimeout);
		clearInterval(hintInterval);
		hint.classList.remove("is-visible");
	}

	hintTimers.push(setTimeout(() => {
		showHint();
		hintInterval = setInterval(showHint, HINT_REPEAT_EVERY);
	}, HINT_FIRST_DELAY));

	// Open / close: the button toggles, × closes, Esc closes, clicking elsewhere closes.
	button.addEventListener("click", () => {
		dismissHint();
		setOpen(popup.hidden);
	});
	close.addEventListener("click", () => {
		setOpen(false);
		button.focus();
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !popup.hidden) {
			setOpen(false);
			button.focus();
		}
	});
	document.addEventListener("click", (event) => {
		if (!popup.hidden && !widget.contains(event.target)) setOpen(false);
	});
}


/* ---------- 5. Contact form (contact page) ----------
   Checks every field is filled in correctly, then opens the visitor's
   email app with the enquiry ready to send to CONTACT_EMAIL. */
function initContactForm() {
	const form = document.querySelector("#contact-form");
	if (!form) return;

	const status = form.querySelector(".form-status");

	form.addEventListener("submit", (event) => {
		event.preventDefault();

		// 1) Validate: mark empty/invalid fields red and focus the first one.
		const fields = [...form.querySelectorAll("input, select, textarea")];
		let firstInvalid = null;

		fields.forEach((field) => {
			const valid = field.checkValidity() && field.value.trim() !== "";
			field.setAttribute("aria-invalid", String(!valid));
			if (!valid && !firstInvalid) firstInvalid = field;
		});

		status.classList.remove("is-success");
		if (firstInvalid) {
			const label = form.querySelector(`label[for="${firstInvalid.id}"]`);
			status.textContent = `Please check the "${label ? label.textContent : "highlighted"}" field.`;
			firstInvalid.focus();
			return;
		}

		// 2) Build the email and open the visitor's email app.
		const data = new FormData(form);
		const subject = `Coaching enquiry: ${data.get("interest")}`;
		const body = [
			`Name: ${data.get("name")}`,
			`Email: ${data.get("email")}`,
			`Coaching interest: ${data.get("interest")}`,
			"",
			data.get("message"),
		].join("\n");

		window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
		status.classList.add("is-success");
		status.textContent = "Your email app should open with your message ready to send.";
	});

	// Remove the red error outline as soon as a field becomes valid.
	form.addEventListener("input", (event) => {
		if (event.target.getAttribute("aria-invalid") === "true" && event.target.checkValidity()) {
			event.target.setAttribute("aria-invalid", "false");
		}
	});
}


/* ---------- 6. Compact sticky header (every page) ----------
   Once the full header scrolls out of view, a slim bar with the logo and
   name slides in at the top. It copies the logo and name from the main
   header, so there's nothing to edit here. Clicking it goes home. */
function initMiniHeader() {
	const header = document.querySelector(".header");
	if (!header) return;

	const logo = header.querySelector(".logo");
	const title = header.querySelector(".site-title");

	const bar = document.createElement("a");
	bar.className = "mini-header";
	bar.href = "index.html";
	bar.setAttribute("aria-label", "Goshen XBallerz home");
	bar.tabIndex = -1; // can't be tabbed to while hidden
	bar.innerHTML = `
		<img class="mini-header-logo" src="${logo ? logo.getAttribute("src") : ""}" alt="">
		<span class="mini-header-name">${title ? title.textContent : "GOSHEN XBALLERZ"}</span>`;
	document.body.prepend(bar);

	let shown = null;
	function update() {
		const show = header.getBoundingClientRect().bottom <= 0;
		if (show === shown) return;
		shown = show;
		bar.classList.toggle("is-visible", show);
		bar.tabIndex = show ? 0 : -1;
		bar.setAttribute("aria-hidden", String(!show));
	}

	window.addEventListener("scroll", update, { passive: true });
	window.addEventListener("resize", update);
	update();
}


/* ---------- 7. Coach profile pop-ups (coaches page) ----------
   Clicking a coach card opens ONE shared pop-up (#coach-dialog) and fills
   it with that card's photo, role, name and hidden .team-profile content.
   To change a coach's pop-up text, edit their .team-profile in coaches.html. */
function initCoachDialogs() {
	const dialog = document.querySelector("#coach-dialog");
	if (!dialog) return;

	const dialogPhoto = dialog.querySelector(".coach-dialog-photo");
	const dialogRole = dialog.querySelector(".coach-dialog-role");
	const dialogName = dialog.querySelector("#coach-dialog-title");
	const dialogProfile = dialog.querySelector(".coach-dialog-profile");
	let lastButton = null;

	// Copy the children of `source` into `target` (or empty it if there's no source).
	const copyInto = (target, source) =>
		target.replaceChildren(...(source ? [...source.children].map((el) => el.cloneNode(true)) : []));

	function openCoach(card) {
		copyInto(dialogPhoto, card.querySelector(".team-photo"));
		dialogRole.textContent = card.querySelector(".team-copy .feature-eyebrow")?.textContent || "";
		dialogName.textContent = card.querySelector(".team-copy h3")?.textContent || "";
		copyInto(dialogProfile, card.querySelector(".team-profile"));
		lastButton = card.querySelector(".team-profile-button");
		dialog.showModal();
	}

	document.querySelectorAll(".team-card").forEach((card) => {
		card.addEventListener("click", () => openCoach(card));
	});

	dialog.querySelector(".player-dialog-close").addEventListener("click", () => dialog.close());
	closeOnBackdropClick(dialog);
	// Return keyboard focus to the card's button after closing.
	dialog.addEventListener("close", () => {
		if (lastButton) lastButton.focus();
	});
}


/* ---------- Start everything ---------- */
initPlayerDialog();
document.querySelectorAll(".feature-showcase").forEach(initFeatureShowcase);
initScrolling();
initFaqWidget();
initContactForm();
initMiniHeader();
initCoachDialogs();
