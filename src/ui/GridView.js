// @MX:NOTE: 문자 격자(text행 + pattern행) 렌더. setData에서 1회 DOM 빌드, render는 변경 셀 class만 토글.
// @MX:WARN: render에서 전체 DOM 재생성 금지 — 성능 계약. 셀 참조를 배열에 캐싱해 토글만 한다.
// @MX:REASON: 매 스텝 전체 재빌드 시 긴 text에서 버벅임.
import { StepType } from "../algorithms/steps.js";

const STATE_CLASS = {
	active: "cell--active",
	match: "cell--match",
	mismatch: "cell--mismatch",
	jump: "cell--jump",
	found: "cell--found",
};
const ALL_STATES = Object.values(STATE_CLASS);

export class GridView {
	#root;
	#mode;
	#textCells = [];
	#patternRow = null;
	#patternCells = [];
	#pattern = "";
	// @MX:NOTE: 직전 render에서 상태 class를 붙인 셀만 추적 → 해제를 O(1)로(전체 순회 제거). step071 최적화.
	#activeCells = [];

	/**
	 * @param {HTMLElement} rootEl
	 * @param {{ mode: 'kmp'|'brute' }} opts
	 */
	constructor(rootEl, { mode }) {
		this.#root = rootEl;
		this.#mode = mode;
	}

	async init() {
		this.#root.classList.add("grid-track");
		this.#root.setAttribute("role", "group");
		this.#root.setAttribute(
			"aria-label",
			this.#mode === "kmp" ? "KMP 트랙" : "Brute-force 트랙",
		);
	}

	setData(text, pattern) {
		this.#pattern = pattern;
		this.#root.textContent = "";
		this.#textCells = [];
		this.#patternCells = [];
		this.#activeCells = [];

		// @MX:NOTE: 빈 입력일 때 빈 격자 대신 안내 — 레이아웃 붕괴/혼란 방지(빈 상태 처리).
		if (!text.length || !pattern.length) {
			const hint = document.createElement("p");
			hint.className = "track-empty";
			hint.textContent = !pattern.length
				? "패턴(찾을 것)을 입력하면 탐색이 시작돼요."
				: "텍스트(찾을 대상)를 입력해 주세요.";
			this.#root.appendChild(hint);
			this.#patternRow = null;
			return;
		}

		const textRow = document.createElement("div");
		textRow.className = "grid-row grid-row--text";
		for (const ch of text) {
			const cell = this.#makeCell(ch);
			textRow.appendChild(cell);
			this.#textCells.push(cell);
		}

		this.#patternRow = document.createElement("div");
		this.#patternRow.className = "grid-row grid-row--pattern";
		for (const ch of pattern) {
			const cell = this.#makeCell(ch);
			this.#patternRow.appendChild(cell);
			this.#patternCells.push(cell);
		}

		this.#root.appendChild(textRow);
		this.#root.appendChild(this.#patternRow);
		this.#offsetPattern(0);
	}

	#makeCell(ch) {
		const cell = document.createElement("span");
		cell.className = "cell";
		cell.textContent = ch === " " ? "·" : ch; // 공백은 가운뎃점으로 가시화
		return cell;
	}

	/** pattern 행을 text 기준 offset 칸만큼 우측 정렬(미끄러짐 시각화). */
	#offsetPattern(offset) {
		if (this.#patternRow) {
			this.#patternRow.style.setProperty(
				"--offset",
				String(Math.max(0, offset)),
			);
		}
	}

	/**
	 * 한 스텝 상태를 반영한다. 변경 셀 class만 토글.
	 * @param {object} step
	 */
	render(step) {
		this.#clearStates();
		if (!step || step.type === StepType.LPS_BUILD) return;

		const { type, i, j, comparing, foundAt } = step;
		// pattern 행을 현재 정렬 위치로 이동: text의 i에서 pattern의 j를 뺀 만큼이 시작점
		const start = Math.max(0, (i ?? 0) - (j > 0 ? j : 0));
		this.#offsetPattern(start);

		if (comparing) {
			const [ti, pj] = comparing;
			this.#mark(this.#textCells[ti], "active");
			this.#mark(this.#patternCells[pj], "active");
		}

		if (type === StepType.MATCH) {
			this.#mark(this.#textCells[comparing?.[0]], "match");
			this.#mark(this.#patternCells[comparing?.[1]], "match");
		} else if (type === StepType.MISMATCH) {
			this.#mark(this.#textCells[comparing?.[0]], "mismatch");
			this.#mark(this.#patternCells[comparing?.[1]], "mismatch");
		} else if (type === StepType.JUMP) {
			this.#mark(this.#patternCells[comparing?.[1]], "jump");
		} else if (type === StepType.BACKTRACK) {
			this.#mark(this.#textCells[i], "jump");
		} else if (type === StepType.FOUND && foundAt != null) {
			for (let p = 0; p < this.#pattern.length; p++) {
				this.#mark(this.#textCells[foundAt + p], "found");
				this.#mark(this.#patternCells[p], "found");
			}
		}
	}

	#mark(cell, state) {
		if (!cell) return;
		cell.classList.add(STATE_CLASS[state]);
		this.#activeCells.push(cell); // 다음 #clearStates에서 이 셀만 해제
	}

	#clearStates() {
		// @MX:NOTE: 직전에 마크한 셀만 해제(O(활성 수)) — 전체 격자 순회 제거(step071 최적화).
		for (const cell of this.#activeCells) cell.classList.remove(...ALL_STATES);
		this.#activeCells = [];
	}
}
