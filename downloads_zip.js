import * as db from './db.js'
import * as dl from './dl.js'

export async function handler(req, res) {
	let download = db.downloads.get(req.params.id)
	if (!download) throw "Download not found"
	await dl.zip(download.id)
	res.redirect(`https://tdom.dev/media/${download.id}.zip`)
}
