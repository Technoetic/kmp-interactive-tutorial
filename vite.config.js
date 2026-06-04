import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// @MX:NOTE: 단일 페이지 학습 앱. singlefile 플러그인으로 JS/CSS를 index.html에 인라인 →
// @MX:NOTE: dist/index.html 1개 파일로 file:// 프로토콜에서도 바로 열림(TOPIC "단일 HTML/번들" 제약 충족).
export default defineConfig({
	base: "./",
	plugins: [viteSingleFile()],
	build: {
		target: "es2020",
		outDir: "dist",
	},
});
