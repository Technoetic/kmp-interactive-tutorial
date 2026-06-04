// @MX:NOTE: KMP 단위 테스트. LPS/검색 검증값은 step016 조사(Wikipedia/CP-Algorithms/GeeksforGeeks) 수집값.
import { describe, it, expect } from "vitest";
import { buildLPS, kmpSearch } from "../src/algorithms/kmp.js";

describe("buildLPS — 실패함수 (step016 검증값)", () => {
	const cases = [
		["AAAA", [0, 1, 2, 3]],
		["ABCDE", [0, 0, 0, 0, 0]],
		["aabaaac", [0, 1, 0, 1, 2, 2, 0]],
		["abcdabca", [0, 0, 0, 0, 1, 2, 3, 1]],
		["abcabcd", [0, 0, 0, 1, 2, 3, 0]],
		["ababc", [0, 0, 1, 2, 0]],
		["AABAACAABAA", [0, 1, 0, 1, 2, 0, 1, 2, 3, 4, 5]],
		["AAACAAAAAC", [0, 1, 2, 0, 1, 2, 3, 3, 3, 4]],
		["AAABAAA", [0, 1, 2, 0, 1, 2, 3]],
	];
	for (const [pattern, expected] of cases) {
		it(`"${pattern}" → [${expected}]`, () => {
			expect(buildLPS(pattern)).toEqual(expected);
		});
	}

	it("빈 패턴 → []", () => {
		expect(buildLPS("")).toEqual([]);
	});

	it("불변식: lps[0]===0, 0<=lps[i]<=i", () => {
		const lps = buildLPS("AABAACAABAA");
		expect(lps[0]).toBe(0);
		lps.forEach((v, i) => {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThanOrEqual(i);
		});
	});
});

describe("kmpSearch — 모든 매치 인덱스 (step016 검증값)", () => {
	it('("abcab","ab") → [0,3]', () => {
		expect(kmpSearch("abcab", "ab")).toEqual([0, 3]);
	});
	it('("aabaacaadaabaaba","aaba") → [0,9,12]', () => {
		expect(kmpSearch("aabaacaadaabaaba", "aaba")).toEqual([0, 9, 12]);
	});
	it('겹치는 매치 ("aaa","aa") → [0,1]', () => {
		expect(kmpSearch("aaa", "aa")).toEqual([0, 1]);
	});
	it("빈 패턴 → []", () => {
		expect(kmpSearch("abc", "")).toEqual([]);
	});
	it("빈 텍스트 → []", () => {
		expect(kmpSearch("", "ab")).toEqual([]);
	});
	it("매치 없음 → []", () => {
		expect(kmpSearch("abcdef", "xyz")).toEqual([]);
	});
});
