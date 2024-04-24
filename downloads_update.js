import * as db from './db.js'
import {page, html} from './util.js'

export async function handler(req, res) {
	let download = db.downloads.get(req.params.id)
	if (!download) throw "Download not found"

	const { title } = req.body
	download = await db.downloads.update({ ...download, title })
	res.redirect(`/downloads/${download.id}`)
}

