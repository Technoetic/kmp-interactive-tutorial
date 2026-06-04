// @MX:NOTE: 비교 횟수 카운터. 숫자 배지 + 가로 막대로 KMP vs Brute 차이를 직관적으로 대비(O(n+m) vs O(k·n)).
export class CounterView {
	#el;
	#kmpBar = null;
	#bruteBar = null;
	#kmpNum = null;
	#bruteNum = null;
	#maxRef = 1;

	constructor(el) {
		this.#el = el;
		this.#build();
	}

	#build() {
		this.#el.innerHTML = `
      <div class="counter-row">
        <span class="counter-label">KMP</span>
        <span class="counter-bar"><span class="counter-fill counter-fill--kmp"></span></span>
        <span class="counter-num counter-num--kmp">0</span>
      </div>
      <div class="counter-row">
        <span class="counter-label">Brute</span>
        <span class="counter-bar"><span class="counter-fill counter-fill--brute"></span></span>
        <span class="counter-num counter-num--brute">0</span>
      </div>`;
		this.#kmpBar = this.#el.querySelector(".counter-fill--kmp");
		this.#bruteBar = this.#el.querySelector(".counter-fill--brute");
		this.#kmpNum = this.#el.querySelector(".counter-num--kmp");
		this.#bruteNum = this.#el.querySelector(".counter-num--brute");
	}

	/** 막대 기준 최대값(전체 brute 비교 총합)을 설정해 비율을 고정한다. */
	setMax(maxComparisons) {
		this.#maxRef = Math.max(1, maxComparisons);
	}

	render({ kmp, brute }) {
		this.#kmpNum.textContent = String(kmp);
		this.#bruteNum.textContent = String(brute);
		this.#kmpBar.style.width = `${Math.min(100, (kmp / this.#maxRef) * 100)}%`;
		this.#bruteBar.style.width = `${Math.min(100, (brute / this.#maxRef) * 100)}%`;
	}
}
