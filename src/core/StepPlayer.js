// @MX:NOTE: 재생 제어 상태머신. status: idle/playing/paused/done. 타이머는 멈출 때 항상 정리.
// @MX:WARN: setInterval 누수 위험 — play()마다 기존 타이머를 먼저 #clear()로 정리한다.
// @MX:REASON: 정리 누락 시 여러 타이머가 중첩돼 스텝이 건너뛰어진다.

export class StepPlayer {
	#onStep;
	#total = 0;
	#index = 0;
	#status = "idle";
	#speedMs = 300;
	#timer = null;

	/**
	 * @param {{ onStep: (index:number)=>void }} deps 생성자 주입
	 */
	constructor({ onStep }) {
		this.#onStep = onStep;
	}

	load(total) {
		this.#clear();
		this.#total = total;
		this.#index = 0;
		this.#status = total > 0 ? "idle" : "done";
		this.#onStep(this.#index);
	}

	play() {
		if (this.#total === 0) return;
		if (this.#status === "done") this.reset();
		this.#status = "playing";
		this.#clear();
		this.#timer = setInterval(() => this.#tick(), this.#speedMs);
	}

	pause() {
		if (this.#status !== "playing") return;
		this.#status = "paused";
		this.#clear();
	}

	reset() {
		this.#clear();
		this.#index = 0;
		this.#status = this.#total > 0 ? "idle" : "done";
		this.#onStep(this.#index);
	}

	stepForward() {
		this.pause();
		if (this.#index < this.#total - 1) {
			this.#index++;
			this.#onStep(this.#index);
		}
		if (this.#index >= this.#total - 1) this.#status = "done";
	}

	stepBack() {
		this.pause();
		if (this.#index > 0) {
			this.#index--;
			this.#status = "paused";
			this.#onStep(this.#index);
		}
	}

	seek(index) {
		this.pause();
		this.#index = Math.max(0, Math.min(index, this.#total - 1));
		this.#status = this.#index >= this.#total - 1 ? "done" : "paused";
		this.#onStep(this.#index);
	}

	setSpeed(ms) {
		this.#speedMs = ms;
		if (this.#status === "playing") this.play(); // 즉시 반영
	}

	#tick() {
		if (this.#index >= this.#total - 1) {
			this.#status = "done";
			this.#clear();
			return;
		}
		this.#index++;
		this.#onStep(this.#index);
		if (this.#index >= this.#total - 1) {
			this.#status = "done";
			this.#clear();
		}
	}

	#clear() {
		if (this.#timer !== null) {
			clearInterval(this.#timer);
			this.#timer = null;
		}
	}

	get status() {
		return this.#status;
	}

	get currentIndex() {
		return this.#index;
	}

	get total() {
		return this.#total;
	}

	get speedMs() {
		return this.#speedMs;
	}
}
