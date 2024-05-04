import { init, exec } from './util.mjs'

export * as processes from './processes.mjs'

export default () => {
  init("app.db")
	exec(`
		create table if not exists processes(
			pid text primary key,
			url text not null,
			status text not null check(status='pending' or status='done'),
			title text not null default '',
			dir text not null default '',
		  created text not null default current_timestamp,
		  updated text not null default current_timestamp
		) strict;
		create trigger if not exists after update on processes
		begin
		  update processes
		  set updated = current_timestamp
		  where pid = NEW.pid;
		end;
	`)
}
