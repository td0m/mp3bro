import J from 'joi'
import { page, html } from './util.mjs'
import conf from '../conf.json' with { type: "json" }
import * as downloader from '../downloader/index.mjs'

export const schema = {
  query: J.object({
		url: J.string().required(),
		title: J.string(),
		folder: J.string(),
	}),
}

// TODO: can this be a vulnerability?
export async function handler (req, res) {
  const { url, folder, title } = req.query
	if (!folder) {
	  const dirs = await downloader.listDirs()
	  return res.type("text/html").send(page({
		  body: html`
			  <form action="/add" method="GET">
				  <p>${title}</p>
				  <p><code>${url}</code></p>
				  <input type="hidden" name="url" value="${url}" />
				  <input type="hidden" name="title" value="${title}" />
				  <select name="folder">
					  $${dirs.map(d => html`
						  <option value="${d}">${d}</option>
						`)}
					</select>
				  <button type=submit>Submit</button>
				</form>
			`
		}))
	} else {
		await downloader.start(url, folder, title)
		res.code(303).redirect("/")
	}
}

export default (f) => {
  f.get("/add", { schema }, handler)
}
