import conf from '../conf.json' with { type: "json" }
import { join } from 'node:path'

export async function handler (req, res) {
  res.type("text/html").send(`home`)
}

const schema = {
}

export default (f) => {
  f.get("/", { schema }, handler)
}
