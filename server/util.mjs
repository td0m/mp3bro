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
		if (typeof subst === 'object' && subst !== null) {
		  subst = JSON.stringify(subst);
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

export function page({head, body, title} = {}) {
	return html`
	  <!DOCTYPE HTML>
	  <html>
		  <head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta http-equiv="X-UA-Compatible" content="ie=edge" />
				<link rel="stylesheet" href="https://tdom.dev/poc.css" />
				<title>${title ?? "MP3BRO"}</title>
				<script src="https://cdn.jsdelivr.net/gh/gnat/css-scope-inline@main/script.js"></script>
				<link href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABHUlEQVQ4T6VSSw4BQRCtvgEXkHACJLNwBjuWNhKfBVvHYGnjEycwK1tbFhKcwMQFXKG916OZaR0jVFLpqu6qV+91t5K06USqnDNv+izSvY6WwzEuCqqi5ktGmSCmINXMjcFQJv2ujL4E0LpcedHDdAlqFiCTBRm8ANg8W8hEKdnhYAwvxQwlgiTGriwjYY2aBliE55NEyNm8BpAc9qaxi3wLkBBx0wFJXpJ5gQa8xZWycBcWpIg8wgCXhe+WtQ+EL0SGnxgYcpQzxZqzTCiFBjkPCamhbwzMfUCvMbwGG635/oZXwgUd1Gwtod3/Cs/KR0AWbCeIgm6YHXRFXEjk2V/VBUe+gdctSOZf9wBwqw1fEeRXAILk4bd/AAy5O6F0WxDB7iwZAAAAAElFTkSuQmCC" rel="icon" type="image/x-icon">
				$${head ?? ""}
				<style>
				  a {
					  color: inherit;
					}
				</style>
		  </head>
		  <body class="container">
				<div id="page">$${body}</body>
				<iframe hidden name=htmz onload="window.htmz(this)"></iframe>
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
			</body>
		</html>
		`
}

export function cls(classes = {}) {
	return Object.keys(classes)
	  .filter(k => classes[k])
	  .join(" ")
}
