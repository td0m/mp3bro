import { sql, insertOne, one, many } from './util.mjs'

const cols = sql`pid, url, title, dir, status, created, updated`

export const get = (pid) => insertOne`
  SELECT ${cols}
	FROM processes
	WHERE pid = ${pid}
`

export const listPending = () => many`
  SELECT ${cols}
	FROM processes
	WHERE status='pending'
	ORDER BY created DESC
	LIMIT 100
`

export const list = () => many`
  SELECT ${cols}
	FROM processes
	ORDER BY created DESC
	LIMIT 100
`

export const update = ({pid, url, updated, status}) => insertOne`
  UPDATE processes
	SET
	  status = ${status}
	WHERE
	  (pid, updated) = (${pid}, ${updated})
  RETURNING ${cols}
`

export const create = ({pid, url, status, title = '', dir = ''}) => insertOne`
  INSERT INTO processes(pid, url, status, title, dir)
	VALUES(${pid}, ${url}, ${status}, ${title}, ${dir})
  RETURNING ${cols}
`
