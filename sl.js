// node 展示/usr/local/etc/nginx/servers/* 的所有文件

console.log('获取本机使用nginx所监听的所有端口列表');

const fs = require('fs');
const path = require('path');
const os = require('os');  
var Table = require('cli-table');

const dir = '/usr/local/etc/nginx/servers/';

const err = err => console.error(err);
const log = msg => console.log(msg);

let IPv4;  
hostName=os.hostname();  
for(var i=0;i<os.networkInterfaces().en0.length;i++){  
    if(os.networkInterfaces().en0[i].family=='IPv4'){  
        IPv4=os.networkInterfaces().en0[i].address;  
    }  
}

const  readdir = (dir, callback) => {
    const stat = fs.lstatSync(dir);
    if(stat === undefined) return;
    if(stat.isDirectory()){
        let childDir = fs.readdirSync(dir);
        childDir.forEach(child => readdir(path.resolve(dir,child), callback))
    }
    else if(stat.isFile()){
        callback && callback(dir);
    }
    else {
       err('查找目录失败--->', dir); 
    }
}

const table = new Table({
head: ['port', 'project directory', 'config directory'],
chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
        , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
});

const makeTable = (listen, dir, file) => {
    table.push([listen, dir, file]);
}


readdir(dir, file => {
    const content = fs.readFileSync(file, 'utf-8');
    const listen = content.match(/listen\s*(\d+)/)[1];
    const dir = content.match(/root\s*([a-zA-Z0-9\/\.]+)/)[1];
    makeTable(`http://${IPv4}:${listen}`, dir, file);
});
console.log(table.toString());




