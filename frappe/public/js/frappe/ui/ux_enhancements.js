// ─── UX Enhancements – Better interactions, focus, and feedback ──────────────

frappe.provide("frappe.ui.ux");

frappe.ui.ux = {
	init() {
		this.setup_keyboard_hints();
		this.setup_focus_ring();
		this.setup_ripple_buttons();
		this.setup_page_title_feedback();
		this.setup_online_status();
		this.setup_smooth_scroll();
		this.setup_copy_feedback();
	},

	// ─── Show keyboard shortcut hints on modifier hold ────────────────────
	setup_keyboard_hints() {
		let alt_pressed = false;
		$(document)
			.on("keydown", (e) => {
				if (e.key === "Alt" && !alt_pressed) {
					alt_pressed = true;
					$("body").addClass("alt-pressed");
				}
			})
			.on("keyup", (e) => {
				if (e.key === "Alt") {
					alt_pressed = false;
					$("body").removeClass("alt-pressed");
				}
			});
	},

	// ─── Accessible focus ring (show only on keyboard navigation) ─────────
	setup_focus_ring() {
		let mouse_active = false;
		document.addEventListener("mousedown", () => {
			mouse_active = true;
			document.body.classList.add("using-mouse");
		});
		document.addEventListener("keydown", () => {
			mouse_active = false;
			document.body.classList.remove("using-mouse");
		});
	},

	// ─── Ripple effect on primary buttons ────────────────────────────────
	setup_ripple_buttons() {
		$(document).on("click", ".btn-primary", function (e) {
			const btn = this;
			const rect = btn.getBoundingClientRect();
			const ripple = document.createElement("span");
			const size = Math.max(rect.width, rect.height);
			const x = e.clientX - rect.left - size / 2;
			const y = e.clientY - rect.top - size / 2;

			ripple.style.cssText = `
				position:absolute;
				width:${size}px;
				height:${size}px;
				top:${y}px;
				left:${x}px;
				background:rgba(255,255,255,0.3);
				border-radius:50%;
				transform:scale(0);
				animation:ripple-anim 0.5s linear;
				pointer-events:none;
			`;

			// Ensure button has overflow:hidden
			if (getComputedStyle(btn).position === "static") {
				btn.style.position = "relative";
			}
			btn.style.overflow = "hidden";
			btn.appendChild(ripple);
			setTimeout(() => ripple.remove(), 550);
		});

		// Inject ripple keyframe if not already present
		if (!document.getElementById("frappe-ripple-style")) {
			const style = document.createElement("style");
			style.id = "frappe-ripple-style";
			style.textContent = `
				@keyframes ripple-anim {
					to { transform: scale(2.5); opacity: 0; }
				}
				body.using-mouse *:focus { outline: none !important; box-shadow: none !important; }
			`;
			document.head.appendChild(style);
		}
	},

	// ─── Browser tab title feedback on dirty/saving state ─────────────────
	setup_page_title_feedback() {
		const original_title_setter = frappe.set_title || (() => {});
		$(document).on("dirty", () => {
			if (document.title && !document.title.startsWith("● ")) {
				document.title = "● " + document.title;
			}
		});
		$(document).on("save page-change", () => {
			document.title = document.title.replace(/^● /, "");
		});
	},

	// ─── Online / offline status banner ───────────────────────────────────
	setup_online_status() {
		const show_offline = () => {
			if ($("#frappe-offline-banner").length) return;
			const banner = $(`
				<div id="frappe-offline-banner" style="
					position:fixed; bottom:0; left:0; right:0; z-index:9990;
					background:#DC2626; color:#fff;
					padding:8px 20px; font-size:13px; font-weight:500;
					display:flex; align-items:center; justify-content:center; gap:8px;
					box-shadow:0 -2px 12px rgba(0,0,0,0.15);
				">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="1" y1="1" x2="23" y2="23"></line>
						<path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
						<path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
						<path d="M10.71 5.05A16 16 0 0 1 22.56 9"></path>
						<path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
						<path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
						<line x1="12" y1="20" x2="12.01" y2="20"></line>
					</svg>
					You are offline – changes may not be saved
				</div>
			`);
			$("body").append(banner);
		};

		const show_online = () => {
			const banner = $("#frappe-offline-banner");
			if (banner.length) {
				banner.css("background", "#059669").text("Back online!");
				setTimeout(() => banner.fadeOut(400, () => banner.remove()), 2000);
			}
		};

		window.addEventListener("offline", show_offline);
		window.addEventListener("online", show_online);
		if (!navigator.onLine) show_offline();
	},

	// ─── Smooth scroll for main section ───────────────────────────────────
	setup_smooth_scroll() {
		const main = document.querySelector(".main-section");
		if (main) main.style.scrollBehavior = "smooth";
	},

	// ─── "Copied!" feedback on copy operations ────────────────────────────
	setup_copy_feedback() {
		$(document).on("click", "[data-copy], .copy-btn", function () {
			const orig = $(this).text().trim();
			$(this).text("Copied!").addClass("text-success");
			setTimeout(() => {
				$(this).text(orig).removeClass("text-success");
			}, 1500);
		});
	},
};

// Boot UX enhancements after app is ready
$(document).on("app_ready", () => {
	frappe.ui.ux.init();
});
