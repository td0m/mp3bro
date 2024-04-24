import Sqlite from 'better-sqlite3'

const db = new Sqlite("app.db")

function init() {
	db.exec(`
		create table if not exists downloads(
			id text primary key,
			url text not null unique,
			pid text unique,
			status text not null check(status='new' or status='pending' or status='done') default 'new',
			title text check (length(title) > 1),
		  created text not null default current_timestamp,
		  updated text not null default current_timestamp
		) strict;
		create trigger if not exists after update on downloads
		begin
		  update downloads
		  set updated = current_timestamp
		  where id = NEW.id;
		end;
	`)
}
init()

function buildQuery(literals, args) {
	let unsafeArgs = []
	const query = literals.raw.reduce((acc, lit, i) => {
		let arg = args[i-1]
		if (arg instanceof RawSQL) {
			arg = arg.toString()
		} else if (i === 0) {
			arg = ''
		} else {
			unsafeArgs.push(arg)
			arg = '?'
		}
		return acc + arg + lit
	}, "")
	console.log(query)

	return [query, unsafeArgs]
}

export function insertOne(literals, ...args) {
	const [query, unsafeArgs] = buildQuery(literals, args)
	return db.prepare(query).get(unsafeArgs)
}

export function one(literals, ...args) {
	const [query, unsafeArgs] = buildQuery(literals, args)
	return db.prepare(query).get(unsafeArgs)
}

export function many(literals, ...args) {
	const [query, unsafeArgs] = buildQuery(literals, args)
	return db.prepare(query).all(unsafeArgs)
}

export function run(literals, ...args) {
	const [query, unsafeArgs] = buildQuery(literals, args)
	return db.prepare(query).run(unsafeArgs)
}

class RawSQL {
	constructor(query) {
		this.query = query
	}
	toString() {
		return this.query
	}
}

const sql = (literals, ...args) =>
	new RawSQL(literals.raw.reduce((acc, lit, i) => acc + (args[i-1] ?? '') + lit, ""))

const downloadColumns = sql`id, url, pid, status, created, updated, title`

export const downloads = {
	listPendingPids: () => many`
	  SELECT ${downloadColumns}
	  FROM downloads
	  WHERE status='pending'
	`,
  list: () => many`
	  SELECT ${downloadColumns}
	  FROM downloads
	  ORDER BY updated DESC
	  LIMIT 100
	`,
	delete: ({id}) => run`
	  DELETE FROM downloads
	  WHERE id = ${id}
	`,
	update: ({id, pid, status, title, updated}) => insertOne`
	  UPDATE downloads
	  SET
	    pid = ${pid},
	    status = ${status},
		  title = ${title}
	  WHERE (id, updated) = (${id}, ${updated})
		RETURNING ${downloadColumns}
  `,
	get: (id) => one`
		SELECT ${downloadColumns}
		FROM downloads
		WHERE id=${id}
	`,
	insert: ({url}) => insertOne`
	  INSERT INTO downloads(id, url)
	  VALUES(lower(hex(randomblob(2))), ${url})
		RETURNING ${downloadColumns}
  `,
}
