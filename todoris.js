#!/usr/bin/env node

var fs = require('fs'),
    rl_sync = require('readline-sync'),
    rl = require('readline'),
    chalk = require('chalk'),
    path = require('path'),
    readme = path.join(process.cwd(), 'README.md'); // test/README.md for testing

function createTodolist(todos, cb) {
  var data;

  if (todos.length > 0) {
    todos = todos.map(function(str){
      return '- [ ] ' + str;
    }).join('\n') + '\n\n';

    data = '\n# TODOs\n' + todos;
  } else {
    data = '\n# TODOs\n\n';
  }

  fs.appendFile(readme, data, function(err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
}

function hasTodolist(cb) {
  var read = rl.createInterface({
        input: fs.createReadStream(readme)
      }),
      headerFound = false,
      isTodolistHeader = function(str){
        if (/^#\stodo(s?)$/i.test(str)) {
          headerFound = true;
        }
      };

  read.on('line', function(line){
    isTodolistHeader(line);
  }).on('close', function(){
    cb(headerFound);
  });
}

function add(todos, cb) {
  var read = rl.createInterface({
        input: fs.createReadStream(readme)
      }),
      i = 0,
      todoHeaderIndex,
      inTodoList,
      text = '';

  read.on('line', function(line) {

    var isTodoHeader = /^#\stodo(s?)$/i.test(line);
    if (isTodoHeader) {
      todoHeaderIndex = i;
      inTodoList = true;
    }
    if (todoHeaderIndex && i > todoHeaderIndex && inTodoList) {

      if (!/^-/.test(line)) {
        todos.forEach(function(todo){
          text += '- [ ] ' + todo + '\n';
        });
        inTodoList = false;
      }
    }
    i++;
    text += line + '\n';

  }).on('close', function(){
    fyi('ok', todos.length + ' added');
    fs.createWriteStream(readme)
      .end(text, 'utf8', cb);
  });
}

function fetch(cb) {
  var todos = [],
      read = rl.createInterface({
        input: fs.createReadStream(readme)
      }),
      i = 0,
      todoHeaderIndex,
      inTodoList;

  read.on('line', function(line) {

    var isTodoHeader = /^#\stodo(s?)$/i.test(line);
    if (isTodoHeader) {
      todoHeaderIndex = i;
      inTodoList = true;
    }
    if (todoHeaderIndex && i > todoHeaderIndex && inTodoList) {
      var isTodoListItem = /^-/.test(line);
      if (isTodoListItem) {
        todos.push(line);
      }
      if (!/^-/.test(line)) {
        inTodoList = false;
      }
    }
    i++;

  }).on('close', function(){
    cb(todos);
  });
}

function toggle(todo) {
  var title = todo.substr(6);

  if (/\[x\]/.test(todo)) { // is done
    return '- [ ] ' + title;
  }
  if (/\[\s\]/.test(todo)) { // not done
    return '- [x] ' + title;
  }
}

function edit(todo, toggled, cb) {
  var reader = fs.createReadStream(readme),
      text = '';

  reader.on('data', function(chunk) {
    text += chunk;
  }).on('end', function() {
    text = text.replace(todo, toggled);

    fs.createWriteStream(readme)
      .end(text, 'utf8', cb);
  });
}

function list(arr) {
  try {
    var pkg = require(path.join(process.cwd(), 'package.json'));
    fyi('header', pkg.name);
  } catch(e) {
    fyi('header', 'todos');
  }

  if (arr && arr.length > 0) {
    var index = rl_sync.keyInSelect(arr, ">"), // 0 returns -1
        todo = arr[index];

    if (index >= 0) {
      var toggled = toggle(todo);
      edit(todo, toggled, function(){
        fetch(list);
      });
    } else {
      fyi('ok', 'exit');
    }
  } else {
    fyi('neutral', 'no items yet');
  }
}

function fyi(state, str) {
  if (state === 'err') {
    str = chalk.red(str);
  }
  if (state === 'ok') {
    str = chalk.green(str);
  }
  if (state === 'header') {
    str = '\n' + chalk.inverse(str);
  }
  console.log(str);
}

// init
fs.stat(readme, function(err, stat){
  if (err) {
    fyi('err', 'no readme found in ' + process.cwd());
  } else {
    var todos = process.argv.slice(2);

    hasTodolist(function(flag){
      if (!flag) {
        fyi('err', 'no todolist found in readme in ' + process.cwd());

        if (!rl_sync.keyInYN('Should I create one?')) {
          fyi('ok', 'exit');

        } else {
          createTodolist(todos, function(err){
            if (err) {
              return fyi('err', err);
            }

            fyi('ok', 'todolist added');
            fetch(list);
          });
        }

      } else {
        if (todos.length > 0) {
          add(todos, function(){
            fetch(list);
          });
        } else {
          fetch(list);
        }

      }
    });
  }
});
