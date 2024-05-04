import { escape } from 'html-escaper'

export function html(
	literals,
	...substs
) {
	return literals.raw.reduce((acc, lit, i) => {
		let subst = substs[i - 1];
		if (Array.isArray(subst)) {
			subst = subst.join("");
		}
		if (literals.raw[i - 1] && literals.raw[i - 1].endsWith("$")) {
			// If the interpolation is preceded by a dollar sign,
		  // substitution is considered safe and will not be escaped
			acc = acc.slice(0, -1);
		} else if (subst === undefined || subst === null) {
			subst = `${subst}` // either this or ""
		} else {
			subst = escape(subst);
		}
		return acc + subst + lit;
	});
}

export function page({head, body}) {
	return html`
	  <!DOCTYPE HTML>
	  <html>
		  <head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="X-UA-Compatible" content="ie=edge">
				<meta name="theme-color" content="">
				<link rel="shortcut icon" href="">
				<link rel="stylesheet" href="">
				<title>Document</title>
				<script>
				function htmz(frame) {

					// Remove setTimeout to let the browser autoscroll content changes into view
					setTimeout(() =>
						document
						.querySelector(frame.contentWindow.location.hash || null)
						?.replaceWith(...frame.contentDocument.body.childNodes)
					);
				}
				</script>
				<iframe hidden onerror="alert('1')" name=htmz onload="window.htmz(this)"></iframe>
				<script src="https://cdn.jsdelivr.net/gh/gnat/css-scope-inline@main/script.js"></script>
		    <style>
		      body {
						margin: 0 auto;
						font-family: "Inter", sans-serif;
						padding: 0.5rem;
						width: 100%;
						max-width: 600px;
					}
					.p0 { padding: 0; }
					.m0 { margin: 0; }
	        .hidden { display: none; }
					
					.badge {
						border-radius: 8px;
						background: var(--c);
						padding: 0.1rem 0.3rem;
						font-family: monospace;
						border: solid 1px var(--text);
						color: var(--text);
					}

					.status-done {
						--c: #e1fae4;
						--text: #15401b;
					}
					.status-pending {
						--c: #f0e6bd;
						--text: #575915;
					}
	        * { box-sizing: border-box; }
		    </style>
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
		  </head>
		  <body id="body">
		  <nav>
		    <a href="/">Home</a>
		  </nav>
		  $${body}
			</body>
		</html>
		`
}

export function relativeDate(dateStr) {
	const now = new Date()
	const date = new Date(dateStr)

	const diff = (now - date) / 1_000 // in seconds

	if (diff < 0) return `future`
	if (diff < 60) return `just now`
	if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`
	if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`

	return `long time ago`
}
