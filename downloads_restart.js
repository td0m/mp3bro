import * as db from './db.js'
import * as dl from './dl.js'

export async function handler(req, res) {
	let download = db.downloads.get(req.params.id)
	if (!download) throw "Download not found"
	await dl.start(download)
	res.redirect(`/downloads/${download.id}`)
}
