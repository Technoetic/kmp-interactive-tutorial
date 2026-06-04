// @MX:NOTE: MatchEngine 단위 테스트. 입력 검증/시퀀스 생성/카운터/길이상한 계약 확인.
import { describe, it, expect } from "vitest";
import { MatchEngine, LIMITS } from "../src/core/MatchEngine.js";

describe("MatchEngine", () => {
	it("setInput + build 후 KMP/Brute 시퀀스를 만든다", async () => {
		const e = new MatchEngine();
		e.setInput("ABABABC", "ABABC");
		await e.build();
		expect(e.getKmp().steps.length).toBeGreaterThan(0);
		expect(e.getBrute().steps.length).toBeGreaterThan(0);
		expect(e.getKmp().lps).toEqual([0, 0, 1, 2, 0]);
	});

	it("KMP와 Brute의 matches 결과가 동일하다", async () => {
		const e = new MatchEngine();
		e.setInput("aabaacaadaabaaba", "aaba");
		await e.build();
		expect(e.getKmp().matches).toEqual(e.getBrute().matches);
		expect(e.getKmp().matches).toEqual([0, 9, 12]);
	});

	it("KMP 비교 횟수 <= Brute 비교 횟수", async () => {
		const e = new MatchEngine();
		e.setInput("AAAAAAAAAB", "AAAB");
		await e.build();
		const c = e.comparisons;
		expect(c.kmp).toBeLessThanOrEqual(c.brute);
	});

	it("길이 상한 초과 시 error 설정 + 빈 시퀀스", async () => {
		const e = new MatchEngine();
		e.setInput("a".repeat(LIMITS.text + 1), "a");
		await e.build();
		expect(e.error).toBeTruthy();
		expect(e.getKmp().steps).toEqual([]);
	});

	it("빈 패턴이면 매치 없음", async () => {
		const e = new MatchEngine();
		e.setInput("abc", "");
		await e.build();
		expect(e.getKmp().matches).toEqual([]);
		expect(e.totalSteps).toBe(0);
	});

	it("totalSteps는 두 트랙 중 더 긴 길이", async () => {
		const e = new MatchEngine();
		e.setInput("ABCDABCDABDE", "ABCDABD");
		await e.build();
		const t = Math.max(e.getKmp().steps.length, e.getBrute().steps.length);
		expect(e.totalSteps).toBe(t);
	});
});
