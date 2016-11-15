[![npm version](https://badge.fury.io/js/todoris.svg)](https://badge.fury.io/js/todoris)

# todoris
Edit todos in local README from the cli.

Note: Experimental. Use with caution. See requirements below. Not tested on Windows. Does not support nested lists.

# install
```
$ npm i todoris -g
```
Note: For local installs you need to include `scripts: todoris: todoris` in `package.json`, prepend the command with `npm run` and append `--` before args.

# api
```
# list and toggle by index
$ todoris

# add
$ todoris 'add tests' npm

# pipe
$ cat todosFile.txt | todoris
```

# requirements
- Always run from project root
- `README.md` must be in root and contain only *one* todolist (other lists are ok)
- *no* empty lines between header and listitems
- don't place your todolist at the end of the file
- todolist must look like this

```
Header (case-insensitive) -> # todos || # todo
Pending listitem -> - [ ] string 1
Finished listitem -> - [x] string 2
```

# todos
- [x] check readme in cwd
- [x] check readme has todos
- [x] publish
- [x] display project title
- [x] ask to add todolist to end of file if missing
- [x] fix bug #1
- [x] pipe data to todoris

# licence
MIT
