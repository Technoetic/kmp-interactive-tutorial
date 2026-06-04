// @MX:NOTE: 단계 설명 텍스트. aria-live=polite로 스크린리더가 현재 단계를 읽게 한다(접근성).
const TYPE_LABEL = {
	compare: "비교",
	match: "일치",
	mismatch: "불일치",
	jump: "LPS 점프",
	found: "발견",
	backtrack: "되돌림",
	"lps-build": "전처리",
	done: "완료",
};

export class CaptionView {
	#el;

	constructor(el) {
		this.#el = el;
		this.#el.setAttribute("aria-live", "polite");
		this.#el.setAttribute("role", "status");
	}

	render(step) {
		if (!step) {
			this.#el.textContent = "";
			return;
		}
		const label = TYPE_LABEL[step.type] ?? "";
		this.#el.innerHTML = `<span class="caption-tag">${label}</span> <span class="caption-text"></span>`;
		// @MX:NOTE: 캡션은 텍스트 노드로 넣어 XSS 방지(사용자 입력이 caption에 섞일 수 있음).
		this.#el.querySelector(".caption-text").textContent = step.caption ?? "";
	}
}
