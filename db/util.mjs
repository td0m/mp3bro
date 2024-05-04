import Sqlite from 'better-sqlite3'

let db

export function init(name) {
	db = new Sqlite(name)
}

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

export function exec(query) {
  db.exec(query)
}

class RawSQL {
	constructor(query) {
		this.query = query
	}
	toString() {
		return this.query
	}
}

export const sql = (literals, ...args) =>
	new RawSQL(literals.raw.reduce((acc, lit, i) => acc + (args[i-1] ?? '') + lit, ""))

