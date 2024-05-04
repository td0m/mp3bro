import * as fs from 'node:fs/promises';
import {spawn} from 'node:child_process'
import {exec as execCallback} from 'node:child_process'
import {promisify} from 'node:util'
import * as db from './db.js'

const exec = promisify(execCallback)

function dir(id) {
	return `/srv/www/media/${id}`
}

export async function withComputed(download) {
	const outdir = dir(download.id)
	let files = []
	try {
		files = (await fs.readdir(outdir))
		  .filter(f => f !== "archive.txt")
	} catch(err) {
		console.log("withComputed, getting dir", err)
	}
	const ctl = new AbortController()
	setTimeout(() => ctl.abort(),  1_000)
	try {
		const stdout = await exec(`yt-dlp --print '%(title)s' "${download.url}"`, {signal: ctl.signal})
	} catch(err) {}
	return {
		...download,
		fileCount: files.length,
		files,
	}
}

export async function removeFiles({id}) {
	const outdir = dir(id)
	fs.rm(outdir, {recursive: true, force: true})
}

export async function stop({pid}) {
	try {
		process.kill(pid);
	} catch(e) {
		console.log(e)
	}
}

export async function zip(id) {
	const outdir = dir(id)

	const ctl = new AbortController()
	setTimeout(() => ctl.abort(), 60_000)
	try {
		const stdout = await exec(`rm ${outdir}.zip; zip -r ${outdir}.zip .`, {signal: ctl.signal, cwd: outdir})
	} catch(err) {
		console.log(err)
	}
}

export async function start(download) {
	const outdir = dir(download.id)
	download = db.downloads.update({...download, status: "pending"})
	try {
	  await fs.mkdir(outdir)
	} catch(err) {
		console.log(err)
	}
	const name = ["-o", `%(title)s.%(ext)s`]
	let args = [...name, "--download-archive", "archive.txt", "--extract-audio", "--audio-format", "mp3", "--playlist-end", "100", download.url]
	const proc = spawn("yt-dlp", args, {detached: true, cwd: `/srv/www/out/media/${download.id}`})
	download = db.downloads.update({...download, pid: proc.pid.toString()})
	proc.stdout.on('data', data => {
		console.log(`out: ${data}`)
	})
	proc.stderr.on('data', data => {
		console.log(`err: ${data}`)
	})
	proc.on("close", (code) => {
		console.log("exited", code)
		download = db.downloads.get(download.id)
		download = db.downloads.update({...download, status: "done"})
	})
	return download
}

function pidIsRunning(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch(e) {
		return false;
	}
}

async function clearStopped() {
	try {
		const pending = db.downloads.listPendingPids()
		console.log("pending", pending.length)
		for (let d of pending) {
			if (!pidIsRunning(d.pid)) {
				d = db.downloads.get(d.id)
				db.downloads.update({...d, status: "done"})
			}
		}
	} catch(err) {
		console.log(err)
	}
}

export function cleaner() {
	setTimeout(clearStopped, 0)
	setInterval(clearStopped, 10_000)
}
