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

	// The observer root is a band across the middle of the viewport. Articles
	// entering or leaving that band are tracked, and the one closest to the
	// viewport centre becomes active. This works in both scroll directions.
	const inBand = new Set();
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) inBand.add(entry.target);
			else inBand.delete(entry.target);
		});
		if (!inBand.size) return;

		const centre = window.innerHeight / 2;
		let closest = null;
		let closestDistance = Infinity;
		inBand.forEach((article) => {
			const { top, bottom } = article.getBoundingClientRect();
			const distance = top <= centre && bottom >= centre ? 0 : Math.min(Math.abs(top - centre), Math.abs(bottom - centre));
			if (distance < closestDistance) {
				closestDistance = distance;
				closest = article;
			}
		});
		if (closest) setActive(closest.dataset.feature);
	}, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

	articles.forEach((article) => observer.observe(article));
}

document.querySelectorAll(".feature-showcase").forEach(initFeatureShowcase);
