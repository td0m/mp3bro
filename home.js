import * as db from './db.js'
import * as dl from './dl.js'
import {html, page, relativeDate} from './util.js'

export async function handler(req, res) {
	let downloads = db.downloads.list()
	downloads = await Promise.all(downloads.map(d => dl.withComputed(d)))
	res.type("text/html").send(render({downloads}))
}

export function render({downloads}) {
	return page({
		body: html`
		  <h1>Download</h1>
		  <form target=_self method=POST action="/downloads">
		    <input required autofocus type=text name=url placeholder="URL" />
		    <select name=format>
		      <option value=video>Video</option>
		      <option selected value=audio>Audio</option>
		    </select>
		    <button type=submit>Start</button>
		  </form>
		  <h1>Past Downloads</h1>
		  $${downloads.map(d => html`
				<div>
				  <style>
				    me {
							padding: 0.4rem 0.1rem;
						}
						me a {
							font-size: 1.2rem;
						}
				  </style>
				  <a href="/downloads/${d.id}">${d.title ?? d.id}</a>
					<div style="padding: 0.2rem 0; display: flex; font-size: 0.8rem; align-items: center; gap: 0.4rem;">
						<div class="badge status-${d.status}">
							${d.status}
						</div>
						<div>${relativeDate(d.updated)}</div>
				</div>
			`).join("")}
		`,
	})
}

