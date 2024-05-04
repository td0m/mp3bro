import serve from './server/index.mjs'
import initDB from './db/index.mjs'
import downloadDaemon from './downloader/index.mjs'

initDB()

downloadDaemon()

try {
	await serve(10004)
} catch(err) {
  console.log(err)
	process.exit(1)
}
