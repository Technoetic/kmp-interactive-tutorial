// @MX:NOTE: 표준 예제. Wikipedia 표준 예제(ABCDABD)와 반복 패턴(AAAB) 등 KMP 특징이 잘 드러나는 입력.
export const DEFAULT_TEXT = "ABC ABCDAB ABCDABCDABDE";
export const DEFAULT_PATTERN = "ABCDABD";

export const EXAMPLES = [
	{
		label: "교과서 예제 (ABCDABD)",
		text: "ABC ABCDAB ABCDABCDABDE",
		pattern: "ABCDABD",
	},
	{
		label: "반복 패턴 (AAAB) — KMP가 빛나는 최악 케이스",
		text: "AAAAAAAAAB",
		pattern: "AAAB",
	},
	{
		label: "겹치는 매치 (aa)",
		text: "aaaaa",
		pattern: "aa",
	},
	{
		label: "메신저 검색 느낌",
		text: "오늘 점심 뭐 먹지 점심 약속 점심시간",
		pattern: "점심",
	},
];
