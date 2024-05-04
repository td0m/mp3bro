import {spawn} from 'node:child_process'
import { readdir, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import conf from '../conf.json' with { type: "json" }
import * as db from '../db/index.mjs'

export async function start(url, folder, title) {
  const dir = join(conf.dir, folder)
  try {
		await mkdir(dir)
	} catch(err) {
	  console.log(err)
	}
	const name = ["-o", `%(title)s.%(ext)s`]
	let args = [...name, "--download-archive", "archive.txt", "--extract-audio", "--audio-format", "mp3", "--playlist-end", "100", url]
	const proc = spawn("yt-dlp", args, { detached: true, cwd: dir })
	let download = db.processes.create({ pid: proc.pid.toString(), url, status: "pending", title, dir: folder })
	proc.stdout.on('data', data => {
	  console.log('>', data.toString())
	})
	proc.stderr.on('data', data => {
	  console.log('>', data.toString())
	})
	proc.on('close', code => {
	  console.log('done', code)
		download = db.processes.get(proc.pid)
		download = db.processes.update({pid: proc.pid, status: "done" })
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
		const pending = db.processes.listPending()
		for (let d of pending) {
			if (!pidIsRunning(d.pid)) {
				d = db.processes.get(d.pid)
				db.processes.update({...d, status: "done"})
			}
		}
	} catch(err) {
		console.log(err)
	}
}


export async function listDirs() {
  let dirs = (await readdir(conf.dir, { recursive: true, withFileTypes: true }))
	  .filter(f => f.isDirectory())
	  .map(d => join(d.parentPath, d.name).slice(conf.dir.length+1));
	
	dirs.sort()
	return dirs
}

export default function daemon() {
	setTimeout(clearStopped, 0)
	setInterval(clearStopped, 10_000)
}
