// @MX:NOTE: Brute-force는 KMP와 결과가 항상 같아야 한다(교차 검증). 비교 횟수는 BF >= KMP.
import { describe, it, expect } from "vitest";
import {
	bruteForceSearch,
	bruteForceSteps,
} from "../src/algorithms/bruteForce.js";
import { kmpSearch, kmpSearchSteps } from "../src/algorithms/kmp.js";

describe("bruteForceSearch vs kmpSearch — 결과 동일성", () => {
	const pairs = [
		["abcab", "ab"],
		["aabaacaadaabaaba", "aaba"],
		["aaaaa", "aa"],
		["AAAAAAAAAB", "AAAB"],
		["ABC ABCDAB ABCDABCDABDE", "ABCDABD"],
		["abcdef", "xyz"],
		["점심 점심시간 점심", "점심"],
	];
	for (const [text, pattern] of pairs) {
		it(`("${text.slice(0, 12)}…","${pattern}") 두 알고리즘 결과 일치`, () => {
			expect(bruteForceSearch(text, pattern)).toEqual(kmpSearch(text, pattern));
		});
	}

	it("랜덤 입력 20쌍 교차 검증", () => {
		const alphabet = "AB";
		const rand = (n) =>
			Array.from(
				{ length: n },
				() => alphabet[Math.floor(Math.random() * alphabet.length)],
			).join("");
		for (let t = 0; t < 20; t++) {
			const text = rand(30);
			const pattern = rand(3);
			expect(bruteForceSearch(text, pattern)).toEqual(kmpSearch(text, pattern));
		}
	});
});

describe("비교 횟수 — KMP가 Brute-force보다 적거나 같다", () => {
	it("반복 패턴 최악 케이스에서 KMP < BF", () => {
		const text = "AAAAAAAAAB";
		const pattern = "AAAB";
		const kmpTotal = lastComparisons(kmpSearchSteps(text, pattern).steps);
		const bruteTotal = lastComparisons(bruteForceSteps(text, pattern).steps);
		expect(kmpTotal).toBeLessThan(bruteTotal);
	});
});

function lastComparisons(steps) {
	return steps.length ? steps[steps.length - 1].comparisons : 0;
}
