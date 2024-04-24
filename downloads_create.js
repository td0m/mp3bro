import {page, html} from './util.js'
import * as db from './db.js'
import * as dl from './dl.js'

export async function handler(req, res) {
	const { url } = req.body
	if (url.length < 4) throw "URL is too short"
	let download = db.downloads.insert({url})
	download = await dl.start(download)
	res.code(303).redirect(`/downloads/${download.id}`)
}
