// @MX:NOTE: 재생 컨트롤 바. ⏮ ▶/⏸ ⏭ + 속도 4단계 + 진행 슬라이더. 키보드 단축키도 처리.
const SPEEDS = [
	{ label: "느림", ms: 600 },
	{ label: "보통", ms: 300 },
	{ label: "빠름", ms: 100 },
	{ label: "즉시", ms: 16 },
];

export class PlaybackBar {
	#el;
	#player;
	#playBtn = null;
	#slider = null;
	#stepLabel = null;

	/**
	 * @param {HTMLElement} el
	 * @param {{ player: import('../core/StepPlayer.js').StepPlayer }} deps
	 */
	constructor(el, { player }) {
		this.#el = el;
		this.#player = player;
		this.#build();
		this.#bind();
	}

	#build() {
		const speedBtns = SPEEDS.map(
			(s) =>
				`<button class="speed-btn${s.ms === 300 ? " is-active" : ""}" data-ms="${s.ms}" type="button">${s.label}</button>`,
		).join("");
		this.#el.innerHTML = `
      <div class="playback-controls">
        <button class="ctrl-btn" data-act="back" type="button" aria-label="이전 단계">⏮</button>
        <button class="ctrl-btn ctrl-btn--play" data-act="play" type="button" aria-label="재생/정지">▶</button>
        <button class="ctrl-btn" data-act="forward" type="button" aria-label="다음 단계">⏭</button>
        <button class="ctrl-btn" data-act="reset" type="button" aria-label="처음으로">↺</button>
        <div class="speed-group" role="group" aria-label="재생 속도">${speedBtns}</div>
      </div>
      <div class="playback-progress">
        <input class="progress-slider" type="range" min="0" max="0" value="0" aria-label="진행 위치" />
        <span class="step-label">0 / 0</span>
      </div>`;
		this.#playBtn = this.#el.querySelector(".ctrl-btn--play");
		this.#slider = this.#el.querySelector(".progress-slider");
		this.#stepLabel = this.#el.querySelector(".step-label");
	}

	#bind() {
		this.#el
			.querySelector('[data-act="play"]')
			.addEventListener("click", () => {
				this.#player.status === "playing"
					? this.#player.pause()
					: this.#player.play();
				this.syncButton();
			});
		this.#el
			.querySelector('[data-act="forward"]')
			.addEventListener("click", () => this.#player.stepForward());
		this.#el
			.querySelector('[data-act="back"]')
			.addEventListener("click", () => this.#player.stepBack());
		this.#el
			.querySelector('[data-act="reset"]')
			.addEventListener("click", () => this.#player.reset());

		for (const el of this.#el.querySelectorAll(".speed-btn")) {
			const btn = /** @type {HTMLElement} */ (el);
			btn.addEventListener("click", () => {
				this.#player.setSpeed(Number(btn.dataset.ms));
				for (const b of this.#el.querySelectorAll(".speed-btn"))
					b.classList.remove("is-active");
				btn.classList.add("is-active");
				this.syncButton();
			});
		}

		let raf = null;
		this.#slider.addEventListener("input", () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = null;
				this.#player.seek(Number(this.#slider.value));
			});
		});
	}

	/** total 변경 시 슬라이더 범위 갱신. */
	setTotal(total) {
		this.#slider.max = String(Math.max(0, total - 1));
	}

	/** 현재 스텝 위치를 슬라이더/라벨에 반영. */
	setIndex(index, total) {
		this.#slider.value = String(index);
		this.#stepLabel.textContent = `${total ? index + 1 : 0} / ${total}`;
		this.syncButton();
	}

	syncButton() {
		const playing = this.#player.status === "playing";
		this.#playBtn.textContent = playing ? "⏸" : "▶";
	}
}
