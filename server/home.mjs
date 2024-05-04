import conf from '../conf.json' with { type: "json" }
import { join } from 'node:path'
import * as db from '../db/index.mjs'
import { html, page } from './util.mjs'

export async function handler (req, res) {
  const processes = db.processes.list()
  res.type("text/html").send(page({
	  body: html`
			<h1>Downloads</h1>
		  $${processes.map(p => html`
			  <div>
				  <style>
					  me .title {
						  font-size: 1.2rem;
						}
					  me .info {
						  padding: 0.2rem 0;
						  display: flex;
							gap: 0.4rem;
							align-items: center;
							font-size: 0.8rem;
						}
						me .url {
						  font-size: 0.8rem;
							opacity: 0.8;
						}
					  me .status {
							border-radius: 8px;
							background: var(--c);
							padding: 0.1rem 0.3rem;
							font-family: var(--font-mono);
							border: solid 1px var(--text);
							color: var(--text);
						}
						.status.done {
							--c: #e1fae4;
							--text: #15401b;
						}
						.status.pending {
							--c: #f0e6bd;
							--text: #575915;
						}
					</style>
					<div class="title"><a href="${dirLink(p.dir)}">${p.title}</a></div>
					<div class="url"><a href="${p.url}">${p.url}</a></div>
					<div class="info">
						<div class="status ${p.status}">${p.status}</div>
						<div class="created">${p.created}</div>
					</div>
				</div>
			`)}
		`
	}))
}

function dirLink(dir) {
  return `${conf.publicUrl}${dir}`
}

const schema = {
}

export default (f) => {
  f.get("/", { schema }, handler)
}
