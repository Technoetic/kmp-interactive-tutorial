// @MX:NOTE: 진입점. DOM 준비 후 App을 만들고 비동기 init.
import "./styles/tokens.css";
import "./styles/app.css";
import { App } from "./ui/App.js";

// @MX:NOTE: 경량 클라이언트 모니터링(서버 없는 정적 앱). 전역 에러/거부를 한곳에서 로깅.
// @MX:NOTE: 외부 APM 없이 console + performance.mark만 사용 — 개발/운영 디버깅 + 학습용 투명성.
function reportError(kind, detail) {
	console.error(`[monitor:${kind}]`, detail);
}
window.addEventListener("unhandledrejection", (e) =>
	reportError("unhandledrejection", e.reason),
);
window.addEventListener("error", (e) => reportError("error", e.message ?? e));

async function bootstrap() {
	const root = document.getElementById("app");
	if (!root) return;
	performance.mark("app-init-start");
	const app = new App(root);
	try {
		await app.init();
		performance.mark("app-init-end");
		performance.measure("app-init", "app-init-start", "app-init-end");
		const m = performance.getEntriesByName("app-init")[0];
		if (m) console.info(`[monitor:init] ${Math.round(m.duration)}ms`);
	} catch (err) {
		// @MX:WARN: init 실패 시 화면이 비지 않도록 안내. @MX:REASON: 사용자가 빈 화면만 보면 안 됨.
		reportError("init-failed", err);
		root.innerHTML =
			'<p style="padding:24px">초기화에 실패했어요. 페이지를 새로고침해 주세요.</p>';
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootstrap);
} else {
	bootstrap();
}
