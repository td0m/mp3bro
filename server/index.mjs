import Fastify from 'fastify'
import formBody from '@fastify/formbody'

// import home from './home.mjs'

const fastify = Fastify({})
fastify.register(formBody)

fastify.addHook('onRequest', async (req, res) => {
	if (req.url !== '/health') console.log(`${req.method} ${req.url}`)
})

const startedAt = new Date();
fastify.get('/health', async (req, res) => ({ startedAt }))

fastify.setErrorHandler((err, req, res) => {
	res.status(500).type("text/html").send(`
		<body>
			<h1>Ooops!</h1>
		  <pre><code>${err.stack ?? err}</code></pre>
		</body>
	`)
});

fastify.setValidatorCompiler(({schema}) => {
  return data => schema?.validate(data)
});

(await import('./add.mjs')).default(fastify);
(await import('./home.mjs')).default(fastify);

export default async function listen(port) {
	await fastify.listen({ port })
}
