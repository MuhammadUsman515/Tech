// Top page-loading progress bar – shows on every route change
// Injects a thin bar at the top of the viewport during navigation.

frappe.provide("frappe.ui.page_progress");

frappe.ui.page_progress = (() => {
	let bar = null;
	let timer = null;
	let current = 0;
	let running = false;

	function ensure_bar() {
		if (!bar) {
			bar = document.createElement("div");
			bar.id = "frappe-page-progress";
			bar.style.cssText = [
				"position:fixed",
				"top:0",
				"left:0",
				"height:3px",
				"width:0%",
				"z-index:9998",
				"background:linear-gradient(90deg,#2563EB,#7C3AED)",
				"border-radius:0 2px 2px 0",
				"transition:width 0.25s ease,opacity 0.4s ease",
				"pointer-events:none",
				"opacity:0",
			].join(";");
			document.body.appendChild(bar);
		}
		return bar;
	}

	function set(pct) {
		const b = ensure_bar();
		current = Math.min(pct, 99);
		b.style.width = current + "%";
		b.style.opacity = "1";
	}

	function inc() {
		// Trickle: slow down as we approach 95%
		const remaining = 100 - current;
		const step = remaining * (0.08 + Math.random() * 0.04);
		set(current + step);
	}

	function start() {
		if (running) return;
		running = true;
		current = 0;
		set(5);
		timer = setInterval(inc, 300);
	}

	function done() {
		clearInterval(timer);
		timer = null;
		running = false;
		const b = ensure_bar();
		b.style.transition = "width 0.2s ease,opacity 0.5s ease 0.15s";
		b.style.width = "100%";
		setTimeout(() => {
			b.style.opacity = "0";
			setTimeout(() => {
				b.style.width = "0%";
				b.style.transition = "width 0.25s ease,opacity 0.4s ease";
			}, 500);
		}, 150);
	}

	// Hook into frappe router
	$(document).on("page-change", () => start());
	$(document).on("page-load-complete page-ready", () => done());

	// Fallback: cap at 95% and complete after 5s if nothing fires
	$(document).on("page-change", () => {
		setTimeout(() => { if (running) done(); }, 5000);
	});

	return { start, done, set };
})();
