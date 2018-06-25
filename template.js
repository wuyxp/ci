#!/usr/bin/env node


const fs = require('fs');
const gaze = require('gaze').Gaze;

var program = require('commander');

program
  .version('0.0.1')
  .option('-f, --file [type]')
  .option('-w, --watch [type]')
  .parse(process.argv);

console.log('要监听的文件是：', program.file);
console.log('是否进行监听文件：', program.watch);
program.on('--help', function() {});

var filename = program.file;
var files = filename.split(":");
var filewatch = program.watch;

var filesPath = files[0].replace(/[^/]*\.\w+$/, "");
if (!files[1]) {
  console.log('请输入正确的格式如product.tmp:product.html');
  return false;
}
var _path = '';

function _replace() {

  fs.readFile(_path + files[0], "utf8", function(err, data) {
    if (err) {
      console.log('输入文件名未找到，请重新输入');
      return false;
    } else {
      var _html = data;
      var reg = /<template.*?onload=(['"])([^'"]*?)\1.*?>/g;
      var _arr = [];
      while (_arr != null) {
        _arr = reg.exec(_html);
        if (_arr) {
          var _data = fs.readFileSync(_path + filesPath + _arr[2], "utf8");
          _html = _html.replace(_arr[0], _data);
        }
      }
      fs.writeFile(_path + files[1], _html, "utf8", function() {
        console.log('重新生成完成');
      })
    }
  })
}
_replace();
if (filewatch) {
  console.log('启动实时监听');
  console.log(_path + files[0]);
  var g = new gaze(_path + files[0]);
  g.on('all', function(event, filepath) {
    _replace();
  })
}
