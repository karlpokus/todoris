var fs = require('fs'),    
    readline = require('readline'),
    Menu = require('terminal-menu'),
    todos = [];

function fetch() {
  // reset
  todos = [];
  
  var rd = readline.createInterface({
        input: fs.createReadStream('./test/README_test.md'),
        output: process.stdout,
        terminal: false
      }),
      i = 0,
      todoHeaderIndex,
      inTodoList;

  rd.on('line', function(line) {
    
    var isTodoHeader = /^#\stodos$/.test(line);
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
    //showMenu();
    todos.forEach(function(todo){
      console.log(todo);
    });
  });
}

function edit(label, toggled) {
  var fileName = './test/README_test.md',
      file = fs.createReadStream(fileName),
      text = '';

  file.on('data', function(chunk) {
    text += chunk.toString().replace(label, toggled);
  }).on('end', function () {
    fs.writeFile(fileName, text, function(err) {
      if (err) {
        return console.log(err);
      } else {
        //console.log('Updated!');
        fetch();
      }
    });
  });
}

function toggleLabel(label) {
  var title = label.substr(6);
  
  if (/\[x\]/.test(label)) { // is done
    return '- [ ] ' + title;
  }
  if (/\[\s\]/.test(label)) { // not done
    return '- [x] ' + title;
  }
}
            

function showMenu() {
  var menu = Menu({ width: 29, x: 4, y: 2 });

  menu.reset();
  menu.write('# todos\n');

  todos.forEach(function(todo){
    menu.add(todo);
  });
  menu.add('ADD');
  menu.add('EXIT');

  menu.on('select', function (label, index) {
    menu.close();
    
    if (label !== 'EXIT' && label !== 'ADD') {
      var toggled = toggleLabel(label);
      edit(label, toggled);
    }    
    
  });

  process.stdin.pipe(menu.createStream()).pipe(process.stdout);
  
  process.stdin.setRawMode(true);
  menu.on('close', function () {
    process.stdin.setRawMode(false);
    //process.stdin.end();
  });
}

// init
fetch();
