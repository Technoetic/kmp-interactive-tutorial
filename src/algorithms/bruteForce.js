// @MX:NOTE: Brute-force(naive) 대비 트랙. KMP와 같은 입력에서 "되돌아가 재비교하는 낭비"를 스텝으로 노출.
// @MX:NOTE: text 포인터가 불일치 시 (시작+1)로 되돌아가는 backtrack이 핵심 — KMP와의 대비 학습용.
import { StepType, makeStep } from "./steps.js";

/**
 * Brute-force로 모든 매치 시작 인덱스를 반환한다. KMP와 결과가 항상 같아야 한다(교차 검증).
 * @param {string} text
 * @param {string} pattern
 * @returns {number[]}
 */
export function bruteForceSearch(text, pattern) {
	const matches = [];
	const n = text.length;
	const m = pattern.length;
	if (m === 0 || n === 0) return matches;
	for (let s = 0; s + m <= n; s++) {
		let j = 0;
		while (j < m && text[s + j] === pattern[j]) j++;
		if (j === m) matches.push(s);
	}
	return matches;
}

/**
 * Brute-force 탐색을 시각화 스텝으로 기록한다. 비교 횟수가 KMP보다 많음을 보여준다.
 * @returns {{ steps: object[], matches: number[] }}
 */
export function bruteForceSteps(text, pattern) {
	const steps = [];
	const matches = [];
	const n = text.length;
	const m = pattern.length;
	if (m === 0 || n === 0) return { steps, matches };

	// @MX:NOTE: 캡션 표시용 헬퍼 — 공백 문자를 가운뎃점+괄호로 치환. 로직에 사용 금지.
	const show = (c) => (c === " " ? "·(공백)" : c);

	let comparisons = 0;
	for (let s = 0; s + m <= n; s++) {
		let j = 0;
		while (j < m) {
			comparisons++;
			const i = s + j;
			if (text[i] === pattern[j]) {
				steps.push(
					makeStep(StepType.MATCH, {
						i,
						j,
						comparing: [i, j],
						comparisons,
						caption: `'${show(text[i])}' = '${show(pattern[j])}' 일치. 다음 글자 비교.`,
					}),
				);
				j++;
			} else {
				steps.push(
					makeStep(StepType.MISMATCH, {
						i,
						j,
						comparing: [i, j],
						comparisons,
						caption: `'${show(text[i])}' ≠ '${show(pattern[j])}' 불일치. 시작 위치를 ${s} → ${s + 1}로 옮겨 처음부터 다시!`,
					}),
				);
				break;
			}
		}
		if (j === m) {
			matches.push(s);
			steps.push(
				makeStep(StepType.FOUND, {
					i: s + m - 1,
					j: m,
					foundAt: s,
					comparisons,
					caption: `패턴 전체 일치! ${s}번 위치에서 발견.`,
				}),
			);
		}
		// 다음 시작 위치로 backtrack (KMP와 달리 text를 되돌림)
		if (s + 1 + m <= n) {
			steps.push(
				makeStep(StepType.BACKTRACK, {
					i: s + 1,
					j: 0,
					comparing: [s + 1, 0],
					comparisons,
					caption: `시작 위치 ${s + 1}로 되돌아가 pattern 첫 글자부터 다시 비교 — 이게 낭비예요.`,
				}),
			);
		}
	}
	steps.push(
		makeStep(StepType.DONE, {
			i: n,
			j: 0,
			comparisons,
			caption: `Brute-force 끝. 비교 ${comparisons}번 (KMP보다 보통 많아요).`,
		}),
	);
	return { steps, matches };
}
