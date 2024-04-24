import * as db from './db.js'
import * as dl from './dl.js'

export async function handler(req, res) {
	const download = db.downloads.get(req.params.id)
	if (!download) throw "Download not found"

	db.downloads.delete(download)
	await dl.stop({pid: download.pid})
	await dl.removeFiles({id: download.id})

	res.code(303).redirect("/")
}
