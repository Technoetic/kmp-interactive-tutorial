// @MX:NOTE: StepPlayer 단위 테스트. fake timer로 재생/일시정지/스텝/seek/상태머신 검증.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StepPlayer } from "../src/core/StepPlayer.js";

describe("StepPlayer", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	function make() {
		const calls = [];
		const player = new StepPlayer({ onStep: (i) => calls.push(i) });
		return { player, calls };
	}

	it("load 후 idle 상태, index 0", () => {
		const { player, calls } = make();
		player.load(5);
		expect(player.status).toBe("idle");
		expect(player.currentIndex).toBe(0);
		expect(calls).toEqual([0]);
	});

	it("총 0개면 done", () => {
		const { player } = make();
		player.load(0);
		expect(player.status).toBe("done");
	});

	it("play하면 타이머마다 index 증가, 끝에서 done", () => {
		const { player } = make();
		player.load(3);
		player.play();
		expect(player.status).toBe("playing");
		vi.advanceTimersByTime(300); // 1틱
		expect(player.currentIndex).toBe(1);
		vi.advanceTimersByTime(300); // 2틱 → 마지막
		expect(player.currentIndex).toBe(2);
		expect(player.status).toBe("done");
	});

	it("pause하면 타이머 정지", () => {
		const { player } = make();
		player.load(10);
		player.play();
		vi.advanceTimersByTime(300);
		player.pause();
		const idx = player.currentIndex;
		vi.advanceTimersByTime(900);
		expect(player.currentIndex).toBe(idx); // 더 안 움직임
		expect(player.status).toBe("paused");
	});

	it("stepForward / stepBack", () => {
		const { player } = make();
		player.load(5);
		player.stepForward();
		player.stepForward();
		expect(player.currentIndex).toBe(2);
		player.stepBack();
		expect(player.currentIndex).toBe(1);
	});

	it("seek는 범위 클램프", () => {
		const { player } = make();
		player.load(5);
		player.seek(99);
		expect(player.currentIndex).toBe(4);
		expect(player.status).toBe("done");
		player.seek(-3);
		expect(player.currentIndex).toBe(0);
	});

	it("reset은 0으로 복귀", () => {
		const { player } = make();
		player.load(5);
		player.seek(3);
		player.reset();
		expect(player.currentIndex).toBe(0);
		expect(player.status).toBe("idle");
	});

	it("setSpeed 변경 후에도 재생 동작", () => {
		const { player } = make();
		player.load(4);
		player.play();
		player.setSpeed(100);
		vi.advanceTimersByTime(100);
		expect(player.currentIndex).toBe(1);
	});
});
