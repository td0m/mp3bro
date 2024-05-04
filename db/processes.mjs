import { sql, insertOne, one, many } from './util.mjs'

const cols = sql`pid, status, created, updated`

export const get = (pid) => insertOne`
  SELECT ${cols}
	FROM processes
	WHERE pid = ${pid}
`

export const listPending = () => many`
  SELECT ${cols}
	FROM processes
	WHERE status='pending'
	LIMIT 100
`

export const update = ({pid, updated, status}) => insertOne`
  UPDATE processes
	SET
	  status = ${status}
	WHERE
	  (pid, updated) = (${pid}, ${updated})
  RETURNING ${cols}
`

export const create = ({pid, status}) => insertOne`
  INSERT INTO processes(pid, status)
	VALUES(${pid}, ${status})
  RETURNING ${cols}
`
