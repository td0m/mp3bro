import * as db from './db.js'
import * as fs from 'node:fs/promises';
import {page, html} from './util.js'
import * as dl from './dl.js'

export async function handler(req, res) {
	let download = db.downloads.get(req.params.id)
	if (!download) throw "Download not found"
	download = await dl.withComputed(download)
	res.type("text/html").send(render({download}))
}

function formatTitle(title) {
	const [text] = title.split(" [", 1)
	return text
}

export function render({ download }) {
	return page({
		body: html`
		  <div id="row" style="margin: 2rem 0 0; display: flex; align-items: center; justify-content: space-between">
				<h2 class="p0 m0" id="title">${download.title ?? download.id}</h2>
		    <form id="edit-form" method="POST" action="/downloads/${download.id}:update" class="hidden">
					<input type="text" required value="${download.title ?? ""}" placeholder="Title" name="title" />
		      <button type="submit">Save</button>
		    </form>
		    <div><button onclick="startEditing(event)">Edit</button></div>
		  </div>
		  <div style="padding: 0.5rem 0.2rem; display: flex; font-size: 0.8rem">
		    <div class="badge status-${download.status}">
					${download.status}
				</div>
		  </div>
			<div style="display: flex; gap: 2rem">
				<a href="${download.url}">URL</a>
			</div>
			<h3>Files (${download.files.length})</h3>
			<p>
		    You can also download the entire folder from <a href="/downloads/${download.id}.zip">here</a>.
		  </p>
		  <ul>
		    $${download.files.map(f => 
					html`<li><a href="https://tdom.dev/media/${download.id}/${f}">${f.replace(".mp3", "")}</a></li>`
				).join("")}
		  </ul>
		  <h3>Actions</h3>
		  <form method=POST action="/downloads/${download.id}:restart">
				<button type=submit>Restart</button>
			</form>
		  <form method=POST action="/downloads/${download.id}:delete">
				<button type=submit>Delete</button>
			</form>
		  <script>
		    function startEditing(e) {
					const row = e.target.closest("#row")
					row.querySelector("#edit-form").classList.remove("hidden")
					row.querySelector("#title").classList.add("hidden")
				}
		  </script>
		`
	})
}
