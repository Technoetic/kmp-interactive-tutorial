// @MX:NOTE: LPS(실패함수) 테이블 패널. 패턴 각 글자 아래 lps 값을 표로 보여주고, 전처리 스텝 하이라이트.
export class LpsTable {
	#el;
	#charCells = [];
	#valueCells = [];

	constructor(el) {
		this.#el = el;
	}

	setLps(pattern, lps) {
		this.#charCells = [];
		this.#valueCells = [];
		this.#el.textContent = "";

		if (!pattern.length) {
			this.#el.textContent = "패턴을 입력하면 실패함수(LPS) 표가 나타나요.";
			return;
		}

		const table = document.createElement("div");
		table.className = "lps-grid";

		const idxRow = this.#row("lps-row--idx", pattern.length, (k) => `${k}`);
		const charRow = this.#row("lps-row--char", pattern.length, (k) =>
			pattern[k] === " " ? "·" : pattern[k],
		);
		const valRow = this.#row(
			"lps-row--val",
			pattern.length,
			(k) => `${lps[k]}`,
		);

		this.#charCells = [...charRow.children];
		this.#valueCells = [...valRow.children];

		this.#labeledLine(table, "i", idxRow);
		this.#labeledLine(table, "글자", charRow);
		this.#labeledLine(table, "lps", valRow);
		this.#el.appendChild(table);
	}

	#row(cls, n, fn) {
		const row = document.createElement("div");
		row.className = `lps-row ${cls}`;
		for (let k = 0; k < n; k++) {
			const c = document.createElement("span");
			c.className = "lps-cell";
			c.textContent = fn(k);
			row.appendChild(c);
		}
		return row;
	}

	#labeledLine(parent, label, row) {
		const line = document.createElement("div");
		line.className = "lps-line";
		const lab = document.createElement("span");
		lab.className = "lps-label";
		lab.textContent = label;
		line.appendChild(lab);
		line.appendChild(row);
		parent.appendChild(line);
	}

	/** lps-build 스텝이면 해당 인덱스 강조, 아니면 강조 해제. */
	render(step) {
		for (const c of this.#valueCells) c.classList.remove("lps-cell--active");
		for (const c of this.#charCells) c.classList.remove("lps-cell--active");
		if (step && step.type === "lps-build" && step.i >= 0) {
			this.#valueCells[step.i]?.classList.add("lps-cell--active");
			this.#charCells[step.i]?.classList.add("lps-cell--active");
		}
	}
}
