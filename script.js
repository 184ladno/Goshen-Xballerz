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

const featureArticles = [...document.querySelectorAll(".feature-copy")];
const featureDescriptions = [...document.querySelectorAll(".feature-description-panel")];

function setActiveFeature(featureName) {
	featureArticles.forEach((article) => {
		article.classList.toggle("is-active", article.dataset.feature === featureName);
	});

	featureDescriptions.forEach((description) => {
		const isActive = description.dataset.description === featureName;
		description.classList.toggle("is-active", isActive);
		description.setAttribute("aria-hidden", String(!isActive));
	});
}

if (featureArticles.length > 0) {
	const featureHeadings = featureArticles
		.map((article) => article.querySelector("h3"))
		.filter(Boolean);

	if ("IntersectionObserver" in window) {
		const featureObserver = new window.IntersectionObserver((entries) => {
			const activeHeading = entries
				.filter((entry) => entry.isIntersecting)
				.sort((first, second) => {
					const viewportCenter = window.innerHeight / 2;
					const firstDistance = Math.abs(first.boundingClientRect.top + first.boundingClientRect.height / 2 - viewportCenter);
					const secondDistance = Math.abs(second.boundingClientRect.top + second.boundingClientRect.height / 2 - viewportCenter);

					return firstDistance - secondDistance;
				})[0]?.target;

			if (activeHeading) {
				const activeFeature = activeHeading.closest("[data-feature]");
				if (activeFeature) setActiveFeature(activeFeature.dataset.feature);
			}
		}, {
			rootMargin: "-45% 0px -45% 0px",
			threshold: 0
		});

		featureHeadings.forEach((heading) => featureObserver.observe(heading));
	} else {
		let scrollFrame = 0;
		const updateActiveFeature = () => {
			scrollFrame = 0;
			const viewportCenter = window.innerHeight / 2;
			const activeHeading = featureHeadings
				.map((heading) => {
					const bounds = heading.getBoundingClientRect();

					return {
						heading,
						distance: Math.abs(bounds.top + bounds.height / 2 - viewportCenter)
					};
				})
				.sort((first, second) => first.distance - second.distance)[0];
			const activeFeature = activeHeading?.heading.closest("[data-feature]");

			if (activeFeature) setActiveFeature(activeFeature.dataset.feature);
		};
		const scheduleUpdate = () => {
			if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveFeature);
		};

		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate, { passive: true });
		scheduleUpdate();
	}
}
