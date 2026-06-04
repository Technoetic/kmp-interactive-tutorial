// @MX:NOTE: Step 객체는 algorithms(생성) ↔ ui(렌더) 사이 불변 계약. type별 의미가 시각화 색/글리프와 1:1.
// @MX:ANCHOR: makeStep / StepType — Engine, GridView, CaptionView, StepPlayer가 모두 소비 (fan_in >= 3).
// @MX:REASON: 한 곳에서만 Step 모양을 정의해 트랙(KMP/Brute) 양쪽이 동일 스키마를 쓰게 강제.

export const StepType = {
	COMPARE: "compare", // i,j 위치 비교 중
	MATCH: "match", // 문자 일치
	MISMATCH: "mismatch", // 문자 불일치
	JUMP: "jump", // 실패함수(LPS)로 pattern 포인터 점프
	FOUND: "found", // 패턴 전체 매치 발견
	BACKTRACK: "backtrack", // (brute-force) text 포인터 되돌림 — 낭비 시각화
	LPS_BUILD: "lps-build", // 전처리: LPS 테이블 채우기 단계
	DONE: "done", // 탐색 종료
};

/**
 * 시각화 스텝 1개를 만든다.
 * @param {string} type StepType 값
 * @param {object} fields { i, j, comparing, lps, foundAt, comparisons, caption, k, value }
 * @returns {object} Step
 */
export function makeStep(type, fields = {}) {
	return {
		type,
		i: fields.i ?? -1, // text 포인터
		j: fields.j ?? -1, // pattern 포인터
		comparing: fields.comparing ?? null, // [textIdx, patternIdx]
		lps: fields.lps ?? null, // jump 시 적용된 lps 값
		foundAt: fields.foundAt ?? null, // found 시 매치 시작 인덱스
		comparisons: fields.comparisons ?? 0, // 누적 비교 횟수
		caption: fields.caption ?? "", // 초보자용 한국어 설명
		k: fields.k ?? null, // lps-build 시 접두/접미 길이
		value: fields.value ?? null, // lps-build 시 확정된 lps[i] 값
	};
}
