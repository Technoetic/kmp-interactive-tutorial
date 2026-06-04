// @MX:NOTE: KMP의 핵심 불변식 — text 포인터 i는 절대 되돌아가지 않는다(단조 비감소). Brute는 backtrack 발생.
import { describe, it, expect } from "vitest";
import { kmpSearchSteps } from "../src/algorithms/kmp.js";
import { bruteForceSteps } from "../src/algorithms/bruteForce.js";
import { StepType } from "../src/algorithms/steps.js";

describe("kmpSearchSteps — text 포인터 단조 비감소", () => {
	it("ABCDABD 탐색에서 i가 감소하는 스텝이 없다", () => {
		const { steps } = kmpSearchSteps("ABC ABCDAB ABCDABCDABDE", "ABCDABD");
		let prevI = -1;
		for (const s of steps) {
			if (s.type === StepType.DONE) continue;
			expect(s.i).toBeGreaterThanOrEqual(prevI);
			prevI = s.i;
		}
	});

	it("lpsSteps와 lps를 함께 반환한다", () => {
		const { lps, lpsSteps } = kmpSearchSteps("ababc", "ababc");
		expect(lps).toEqual([0, 0, 1, 2, 0]);
		expect(lpsSteps.length).toBe(5);
	});
});

describe("bruteForceSteps — backtrack 스텝 존재", () => {
	it("불일치가 일어나는 입력에서 BACKTRACK 스텝이 적어도 1개", () => {
		const { steps } = bruteForceSteps("AAAAB", "AAB");
		const hasBacktrack = steps.some((s) => s.type === StepType.BACKTRACK);
		expect(hasBacktrack).toBe(true);
	});
});

describe("스텝 comparisons는 단조 비감소", () => {
	it("KMP 스텝의 comparisons가 증가만 한다", () => {
		const { steps } = kmpSearchSteps("ABABABC", "ABABC");
		let prev = 0;
		for (const s of steps) {
			expect(s.comparisons).toBeGreaterThanOrEqual(prev);
			prev = s.comparisons;
		}
	});
});
