const playerTrigger = document.querySelector(".hero-player");
const playerDialog = document.querySelector("#player-dialog");
const playerDialogClose = playerDialog.querySelector(".player-dialog-close");

playerTrigger.addEventListener("click", () => {
	playerDialog.showModal();
});

playerDialogClose.addEventListener("click", () => {
	playerDialog.close();
});

playerDialog.addEventListener("click", (event) => {
	if (event.target === playerDialog) {
		playerDialog.close();
	}
});

/* ---------- Scroll-driven sticky feature section ----------
   The right-hand .feature-copy articles are the single source of truth.
   Each article's .feature-summary is cloned into the sticky left panel,
   and an IntersectionObserver watching a thin line at the viewport centre
   decides which article (and therefore which left panel) is active. */
function initFeatureShowcase(section) {
	const articles = [...section.querySelectorAll(".feature-copy[data-feature]")];
	const stage = section.querySelector(".feature-description-stage");
	const progress = section.querySelector(".feature-progress");
	if (!articles.length || !stage) return;

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
			dot.textContent = String(index + 1).padStart(2, "0");
			progress.append(dot);
		}
		return panel;
	});
	const dots = progress ? [...progress.children] : [];

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

	if (!("IntersectionObserver" in window)) return;

	// Active step = the last article whose top edge has passed the viewport centre.
	// Only four rect reads, and only when an observer reports a change.
	function updateActive() {
		const centre = window.innerHeight / 2;
		let current = articles[0];
		articles.forEach((article) => {
			if (article.getBoundingClientRect().top <= centre) current = article;
		});
		setActive(current.dataset.feature);
	}

	// Triggers: articles crossing a band around the viewport centre (normal scrolling),
	// plus the whole list entering/leaving the viewport (jumps, reloads mid-page).
	// Fine-grained thresholds so the callback also fires while an edge moves through the band.
	const bandThresholds = Array.from({ length: 21 }, (_, i) => i / 20);
	const bandObserver = new IntersectionObserver(updateActive, { rootMargin: "-40% 0px -40% 0px", threshold: bandThresholds });
	articles.forEach((article) => bandObserver.observe(article));

	const listObserver = new IntersectionObserver(updateActive, { threshold: [0, 0.25, 0.5, 0.75, 1] });
	listObserver.observe(section.querySelector(".feature-list"));
}

document.querySelectorAll(".feature-showcase").forEach(initFeatureShowcase);
