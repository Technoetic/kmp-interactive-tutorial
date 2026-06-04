// @MX:NOTE: KMP 핵심. buildLPS = 실패함수(접두사=접미사 최장 길이) 전처리, kmpSearchSteps = 시각화 스텝 기록.
// @MX:NOTE: KMP의 직관 포인트 — text 포인터 i는 절대 되돌아가지 않는다(단조 비감소). pattern 포인터 j만 LPS로 점프.
import { StepType, makeStep } from "./steps.js";

/**
 * 실패함수(LPS: Longest Proper Prefix which is also Suffix) 배열을 만든다.
 * lps[i] = pattern[0..i]에서 "자기 자신이 아닌 가장 긴 접두사 == 접미사"의 길이.
 * @MX:ANCHOR buildLPS — kmpSearch / kmpSearchSteps / LpsTable / 테스트가 소비 (fan_in >= 3).
 * @MX:REASON KMP 전체가 이 표 하나에 의존하므로 단일 정의·단일 검증.
 * @param {string} pattern
 * @returns {number[]}
 */
export function buildLPS(pattern) {
	const m = pattern.length;
	const lps = new Array(m).fill(0);
	let k = 0; // 직전까지 일치한 접두사 길이
	for (let i = 1; i < m; i++) {
		while (k > 0 && pattern[k] !== pattern[i]) k = lps[k - 1];
		if (pattern[k] === pattern[i]) k++;
		lps[i] = k;
	}
	return lps;
}

/**
 * LPS를 만드는 과정을 시각화 스텝으로 기록한다(전처리 애니메이션용).
 * @param {string} pattern
 * @returns {{ lps: number[], lpsSteps: object[] }}
 */
function buildLPSSteps(pattern) {
	const m = pattern.length;
	const lps = new Array(m).fill(0);
	const lpsSteps = [];
	if (m === 0) return { lps, lpsSteps };
	lpsSteps.push(
		makeStep(StepType.LPS_BUILD, {
			i: 0,
			k: 0,
			value: 0,
			caption: `lps[0]은 항상 0 — 글자 하나("${pattern[0]}")는 접두사=접미사가 없어요.`,
		}),
	);
	let k = 0;
	for (let i = 1; i < m; i++) {
		while (k > 0 && pattern[k] !== pattern[i]) k = lps[k - 1];
		if (pattern[k] === pattern[i]) k++;
		lps[i] = k;
		lpsSteps.push(
			makeStep(StepType.LPS_BUILD, {
				i,
				k,
				value: k,
				comparing: [k > 0 ? k - 1 : 0, i],
				caption:
					k > 0
						? `"${pattern.slice(0, k)}"가 접두사이자 접미사 → lps[${i}] = ${k}`
						: `여기까지는 겹치는 접두사=접미사가 없어요 → lps[${i}] = 0`,
			}),
		);
	}
	return { lps, lpsSteps };
}

/**
 * KMP로 모든 매치 시작 인덱스를 반환한다(겹침 포함). 빈 패턴 → [].
 * @param {string} text
 * @param {string} pattern
 * @returns {number[]}
 */
export function kmpSearch(text, pattern) {
	const matches = [];
	const n = text.length;
	const m = pattern.length;
	if (m === 0 || n === 0) return matches;
	const lps = buildLPS(pattern);
	let j = 0;
	for (let i = 0; i < n; i++) {
		while (j > 0 && pattern[j] !== text[i]) j = lps[j - 1];
		if (pattern[j] === text[i]) j++;
		if (j === m) {
			matches.push(i - m + 1);
			j = lps[j - 1];
		}
	}
	return matches;
}

/**
 * KMP 탐색을 시각화 스텝으로 기록한다.
 * @returns {{ steps: object[], matches: number[], lps: number[], lpsSteps: object[] }}
 */
export function kmpSearchSteps(text, pattern) {
	const steps = [];
	const matches = [];
	const n = text.length;
	const m = pattern.length;
	const { lps, lpsSteps } = buildLPSSteps(pattern);
	if (m === 0 || n === 0) return { steps, matches, lps, lpsSteps };

	// @MX:NOTE: 캡션 표시용 헬퍼 — 공백 문자를 가운뎃점+괄호로 치환. 로직에 사용 금지.
	const show = (c) => (c === " " ? "·(공백)" : c);

	let j = 0;
	let comparisons = 0;
	for (let i = 0; i < n; i++) {
		// 불일치 시 LPS로 pattern 포인터만 점프 (text i는 그대로!)
		while (j > 0 && pattern[j] !== text[i]) {
			comparisons++;
			const prev = j;
			j = lps[j - 1];
			steps.push(
				makeStep(StepType.JUMP, {
					i,
					j,
					comparing: [i, prev],
					lps: lps[prev - 1],
					comparisons,
					caption: `'${show(text[i])}' ≠ '${show(pattern[prev])}' → pattern을 lps[${prev - 1}]=${lps[prev - 1]}만큼 당겨요. text는 그대로(${i}).`,
				}),
			);
		}
		comparisons++;
		if (pattern[j] === text[i]) {
			j++;
			steps.push(
				makeStep(StepType.MATCH, {
					i,
					j,
					comparing: [i, j - 1],
					comparisons,
					caption: `'${show(text[i])}' = '${show(pattern[j - 1])}' 일치! 둘 다 한 칸 전진.`,
				}),
			);
		} else {
			steps.push(
				makeStep(StepType.MISMATCH, {
					i,
					j,
					comparing: [i, j],
					comparisons,
					caption: `'${show(text[i])}' ≠ '${show(pattern[j])}' 불일치. (j=0이라 text만 한 칸 전진)`,
				}),
			);
		}
		if (j === m) {
			const at = i - m + 1;
			matches.push(at);
			steps.push(
				makeStep(StepType.FOUND, {
					i,
					j,
					foundAt: at,
					comparisons,
					caption: `패턴 전체 일치! ${at}번 위치에서 발견. lps로 이어서 탐색.`,
				}),
			);
			j = lps[j - 1];
		}
	}
	steps.push(
		makeStep(StepType.DONE, {
			i: n,
			j,
			comparisons,
			caption: `탐색 끝. 총 ${matches.length}곳 발견, 비교 ${comparisons}번.`,
		}),
	);
	return { steps, matches, lps, lpsSteps };
}
