import { bruteForceSteps } from "../algorithms/bruteForce.js";
// @MX:NOTE: 입력(text,pattern) → KMP/Brute 시각화 시퀀스 생성·보관. 순수 알고리즘과 UI 사이 어댑터.
import { kmpSearchSteps } from "../algorithms/kmp.js";

export const LIMITS = { text: 2000, pattern: 100 };

export class MatchEngine {
	#text = "";
	#pattern = "";
	#kmp = { steps: [], matches: [], lps: [], lpsSteps: [] };
	#brute = { steps: [], matches: [] };
	#error = null;

	/**
	 * 입력을 설정하고 길이 상한을 검증한다(초과 시 build 스킵, throw 아님 — fail-soft).
	 */
	setInput(text, pattern) {
		this.#error = null;
		if (text.length > LIMITS.text) {
			this.#error = `텍스트가 너무 길어요 (최대 ${LIMITS.text}자).`;
		} else if (pattern.length > LIMITS.pattern) {
			this.#error = `패턴이 너무 길어요 (최대 ${LIMITS.pattern}자).`;
		}
		this.#text = text;
		this.#pattern = pattern;
	}

	/**
	 * 시퀀스를 생성한다. 큰 입력은 다음 틱으로 양보해 메인 스레드 블록을 줄인다.
	 * @returns {Promise<void>}
	 */
	async build() {
		if (this.#error) {
			this.#kmp = { steps: [], matches: [], lps: [], lpsSteps: [] };
			this.#brute = { steps: [], matches: [] };
			return;
		}
		// @MX:NOTE: 큰 입력일 때 두 시퀀스 생성 사이마다 yield (작은 입력은 즉시 — 첫 렌더 지연 방지).
		// @MX:REASON: KMP/Brute 생성을 메인 스레드에서 연속 실행하면 긴 입력에서 한 프레임을 길게 점유하므로 사이에 양보.
		const big = this.#text.length > 500;
		if (big) await Promise.resolve();
		this.#kmp = kmpSearchSteps(this.#text, this.#pattern);
		if (big) await Promise.resolve();
		this.#brute = bruteForceSteps(this.#text, this.#pattern);
	}

	getKmp() {
		return this.#kmp;
	}

	getBrute() {
		return this.#brute;
	}

	get error() {
		return this.#error;
	}

	get text() {
		return this.#text;
	}

	get pattern() {
		return this.#pattern;
	}

	/** 두 트랙 중 더 긴 스텝 수(슬라이더 범위). */
	get totalSteps() {
		return Math.max(this.#kmp.steps.length, this.#brute.steps.length);
	}

	/** 트랙별 누적 비교 횟수(마지막 스텝 기준). */
	get comparisons() {
		const last = (arr) => (arr.length ? arr[arr.length - 1].comparisons : 0);
		return { kmp: last(this.#kmp.steps), brute: last(this.#brute.steps) };
	}
}
