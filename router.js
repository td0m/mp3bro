import Fastify from 'fastify'
import formBody from '@fastify/formbody'

import * as downloadsGet from './downloads_get.js'
import * as downloadsCreate from './downloads_create.js'
import * as downloadsUpdate from './downloads_update.js'
import * as downloadsRestart from './downloads_restart.js'
import * as downloadsDelete from './downloads_delete.js'
import * as downloadsZip from './downloads_zip.js'
import * as home from './home.js'

const fastify = Fastify({})
fastify.register(formBody)

fastify.addHook('onRequest', async (req, res) => {
	if (req.url !== '/health') console.log(`${req.method} ${req.url}`)
})

const startedAt = new Date();
fastify.get('/health', async (req, res) => {
  return {
    startedAt,
  }
})

fastify.setErrorHandler((err, req, res) => {
	res.status(500).type("text/html").send(`
		<body>
			<h1>Ooops!</h1>
		  <pre><code>${err.stack ?? err}</code></pre>
		</body>
	`)
})

fastify.post('/downloads/:id(.*)::delete', downloadsDelete.handler)
fastify.get('/downloads/:id(.*).zip', downloadsZip.handler)
fastify.post('/downloads/:id(.*)::restart', downloadsRestart.handler)
fastify.post('/downloads/:id(.*)::update', downloadsUpdate.handler)
fastify.post('/downloads', downloadsCreate.handler)
fastify.get('/downloads/:id', downloadsGet.handler)
fastify.get('/', home.handler)


export default async function listen() {
	try {
		await fastify.listen({ port: 10004 })
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}
