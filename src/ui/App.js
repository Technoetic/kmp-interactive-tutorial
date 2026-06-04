// @MX:NOTE: 오케스트레이터. 입력→엔진→플레이어→뷰 데이터 흐름이 여기 한 곳에 선형으로 드러난다(선택안 B).
// @MX:ANCHOR App.#renderAll — 모든 뷰(GridView x2, Caption, Lps, Counter, PlaybackBar)가 이 한 함수로 갱신.
// @MX:REASON 단일 갱신 지점이라 스텝 동기화 버그를 한 곳에서 추적 가능.
import { MatchEngine } from "../core/MatchEngine.js";
import { StepPlayer } from "../core/StepPlayer.js";
import { DEFAULT_PATTERN, DEFAULT_TEXT } from "../data/examples.js";
import { CaptionView } from "./CaptionView.js";
import { CounterView } from "./CounterView.js";
import { GridView } from "./GridView.js";
import { InputForm } from "./InputForm.js";
import { LpsTable } from "./LpsTable.js";
import { PlaybackBar } from "./PlaybackBar.js";

export class App {
	#root;
	#engine;
	#kmpView;
	#bruteView;
	#caption;
	#lps;
	#counter;
	#input;
	#player;
	#bar;

	constructor(root) {
		this.#root = root;
	}

	#$(sel) {
		return this.#root.querySelector(sel);
	}

	async init() {
		this.#engine = new MatchEngine();
		this.#kmpView = new GridView(this.#$("#track-kmp"), { mode: "kmp" });
		this.#bruteView = new GridView(this.#$("#track-brute"), { mode: "brute" });
		this.#caption = new CaptionView(this.#$("#caption"));
		this.#lps = new LpsTable(this.#$("#lps"));
		this.#counter = new CounterView(this.#$("#counter"));
		this.#player = new StepPlayer({ onStep: (i) => this.#renderAll(i) });
		this.#bar = new PlaybackBar(this.#$("#playback"), { player: this.#player });
		this.#input = new InputForm(this.#$("#input"), {
			onChange: (t, p) => this.#reload(t, p),
		});

		await Promise.all([this.#kmpView.init(), this.#bruteView.init()]);

		this.#input.setValue(DEFAULT_TEXT, DEFAULT_PATTERN);
		this.#bindKeys();
		await this.#reload(DEFAULT_TEXT, DEFAULT_PATTERN);
	}

	async #reload(text, pattern) {
		this.#engine.setInput(text, pattern);
		await this.#engine.build();
		this.#input.showError(this.#engine.error);

		const kmp = this.#engine.getKmp();
		this.#lps.setLps(pattern, kmp.lps);
		this.#kmpView.setData(text, pattern);
		this.#bruteView.setData(text, pattern);

		const total = this.#engine.totalSteps;
		this.#counter.setMax(this.#engine.comparisons.brute || 1);
		this.#bar.setTotal(total);
		this.#player.load(total);
	}

	#renderAll(index) {
		const kmp = this.#engine.getKmp();
		const brute = this.#engine.getBrute();
		const kmpStep = kmp.steps[Math.min(index, kmp.steps.length - 1)] ?? null;
		const bruteStep =
			brute.steps[Math.min(index, brute.steps.length - 1)] ?? null;

		this.#kmpView.render(kmpStep);
		this.#bruteView.render(bruteStep);
		this.#lps.render(kmpStep);
		// 캡션은 KMP 트랙 기준(학습 초점). KMP가 끝났으면 brute 설명 보조.
		this.#caption.render(kmpStep ?? bruteStep);
		this.#counter.render({
			kmp: kmpStep?.comparisons ?? 0,
			brute: bruteStep?.comparisons ?? 0,
		});
		this.#bar.setIndex(index, this.#engine.totalSteps);
	}

	#bindKeys() {
		document.addEventListener("keydown", (e) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLSelectElement
			)
				return;
			if (e.key === " ") {
				e.preventDefault();
				this.#player.status === "playing"
					? this.#player.pause()
					: this.#player.play();
				this.#bar.syncButton();
			} else if (e.key === "ArrowRight") {
				this.#player.stepForward();
			} else if (e.key === "ArrowLeft") {
				this.#player.stepBack();
			} else if (e.key === "r" || e.key === "R") {
				this.#player.reset();
			}
		});
	}
}
