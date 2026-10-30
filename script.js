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
