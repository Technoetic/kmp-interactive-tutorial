// @MX:NOTE: text/pattern 입력 + 예제 드롭다운. 입력 변경은 debounce(250ms)로 묶어 과도한 재생성 방지.
import { EXAMPLES } from "../data/examples.js";

export class InputForm {
	#el;
	#onChange;
	#textInput = null;
	#patternInput = null;
	#select = null;
	#errorEl = null;
	#timer = null;

	/**
	 * @param {HTMLElement} el
	 * @param {{ onChange: (text:string, pattern:string)=>void }} deps
	 */
	constructor(el, { onChange }) {
		this.#el = el;
		this.#onChange = onChange;
		this.#build();
		this.#bind();
	}

	#build() {
		const opts = EXAMPLES.map(
			(e, idx) => `<option value="${idx}">${e.label}</option>`,
		).join("");
		this.#el.innerHTML = `
      <div class="field">
        <label for="in-text">텍스트 (찾을 대상)</label>
        <input id="in-text" class="text-input" type="text" autocomplete="off" spellcheck="false" />
      </div>
      <div class="field">
        <label for="in-pattern">패턴 (찾을 것)</label>
        <input id="in-pattern" class="text-input" type="text" autocomplete="off" spellcheck="false" />
      </div>
      <div class="field field--row">
        <label for="in-example">예제</label>
        <select id="in-example" class="select">${opts}</select>
      </div>
      <p class="input-error" role="alert"></p>`;
		this.#textInput = this.#el.querySelector("#in-text");
		this.#patternInput = this.#el.querySelector("#in-pattern");
		this.#select = this.#el.querySelector("#in-example");
		this.#errorEl = this.#el.querySelector(".input-error");
	}

	#bind() {
		const onInput = () => this.#debouncedChange();
		this.#textInput.addEventListener("input", onInput);
		this.#patternInput.addEventListener("input", onInput);
		this.#select.addEventListener("change", () => {
			const ex = EXAMPLES[Number(this.#select.value)];
			if (ex) this.setValue(ex.text, ex.pattern, true);
		});
	}

	#debouncedChange() {
		if (this.#timer) clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.#onChange(this.#textInput.value, this.#patternInput.value);
		}, 250);
	}

	setValue(text, pattern, fire = false) {
		this.#textInput.value = text;
		this.#patternInput.value = pattern;
		if (fire) this.#onChange(text, pattern);
	}

	showError(msg) {
		this.#errorEl.textContent = msg ?? "";
	}
}
