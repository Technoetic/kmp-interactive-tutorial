// @MX:NOTE: 통합 테스트 — MatchEngine ↔ StepPlayer 인터페이스 연동(단위 미커버 갭 보강). step099.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MatchEngine, LIMITS } from "../src/core/MatchEngine.js";
import { StepPlayer } from "../src/core/StepPlayer.js";

describe("MatchEngine ↔ StepPlayer 통합", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("build → player.load → play로 끝까지 재생하면 마지막 스텝 인덱스에 도달", async () => {
		const engine = new MatchEngine();
		engine.setInput("ABABABC", "ABABC");
		await engine.build();
		const total = engine.totalSteps;
		const seen = [];
		const player = new StepPlayer({ onStep: (i) => seen.push(i) });
		player.load(total);
		player.setSpeed(16);
		player.play();
		vi.advanceTimersByTime(16 * (total + 2));
		expect(player.status).toBe("done");
		expect(player.currentIndex).toBe(total - 1);
		expect(seen[seen.length - 1]).toBe(total - 1);
	});

	it("길이 상한 초과(error) → totalSteps 0 → player는 done 상태", async () => {
		const engine = new MatchEngine();
		engine.setInput("a".repeat(LIMITS.text + 5), "a");
		await engine.build();
		expect(engine.error).toBeTruthy();
		expect(engine.totalSteps).toBe(0);
		const player = new StepPlayer({ onStep: () => {} });
		player.load(engine.totalSteps);
		expect(player.status).toBe("done"); // 0개면 done
		player.play(); // 재생해도 무동작
		vi.advanceTimersByTime(1000);
		expect(player.currentIndex).toBe(0);
	});

	it("입력 재설정 후 build → player.load 재호출하면 새 시퀀스 길이로 갱신", async () => {
		const engine = new MatchEngine();
		const player = new StepPlayer({ onStep: () => {} });

		engine.setInput("aaaaa", "aa");
		await engine.build();
		player.load(engine.totalSteps);
		const t1 = player.total;

		engine.setInput("ABCDABCDABDE", "ABCDABD");
		await engine.build();
		player.load(engine.totalSteps);
		const t2 = player.total;

		expect(t1).not.toBe(t2);
		expect(player.currentIndex).toBe(0); // load는 0으로 리셋
	});

	it("seek로 임의 스텝 이동 후 engine.stepAt 대응 인덱스가 범위 내", async () => {
		const engine = new MatchEngine();
		engine.setInput("ABC ABCDAB ABCDABCDABDE", "ABCDABD");
		await engine.build();
		const total = engine.totalSteps;
		let lastIdx = -1;
		const player = new StepPlayer({ onStep: (i) => (lastIdx = i) });
		player.load(total);
		player.seek(Math.floor(total / 2));
		expect(lastIdx).toBeGreaterThanOrEqual(0);
		expect(lastIdx).toBeLessThan(total);
		// engine의 kmp/brute 스텝 배열에서 해당 인덱스 접근 안전
		const kmp = engine.getKmp().steps;
		const idx = Math.min(lastIdx, kmp.length - 1);
		expect(kmp[idx]).toBeDefined();
	});
});
