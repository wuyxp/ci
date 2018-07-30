// node 展示/usr/local/etc/nginx/servers/* 的所有文件

console.log('获取本机使用nginx所监听的所有端口列表');

const fs = require('fs');
const path = require('path');
const os = require('os');
const spawn = require('child_process').spawnSync;

const Table = require('cli-table');
const axios = require('axios');

const DIR = '/usr/local/etc/nginx/servers/';
const BRANCH1 = 'http://bm.f2e.net.cn/api/branch/getBranchs?type=1';
const BRANCH2 = 'http://bm.f2e.net.cn/api/branch/getBranchs?type=2';
const BRANCH3 = 'http://bm.f2e.net.cn/api/branch/getBranchs?type=3';

const err = err => console.error(err);
const log = msg => console.log(msg);

let IPv4;  
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

const tableHead = [
    'port', 
    'project directory', 
    'config directory',
    'svn',
    'req',
    'status',
    'name',
    'memo',
];
const table = new Table({
head: tableHead,
chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
        , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
});

const makeTable = (...args) => {
    table.push(args);
}


const fire = async _ => {
    const branch1 = await axios.get(BRANCH1);
    const branch2 = await axios.get(BRANCH2);
    const branch3 = await axios.get(BRANCH3);
    const branch = [...branch1.data.data, ...branch2.data.data, ...branch3.data.data].reduce((result, item) => {
        if(typeof item.branch === 'string'){
            result[item.branch] = {
                id: item.id,
                status: item.status
            }
        }else if(typeof item.branchhistory === 'string'){
            result[item.branchhistory] = {
                id: item.id,
                creatorName: item.creatorName,
                busiStatusName: item.busiStatusName,
                status: item.status,
                req: item.reqBranchRelations.map(r => ({req: r.req.req, memo: r.req.memo}))
            }
        }
        return result;
    }, {});

    await readdir(DIR, file => {
        const content = fs.readFileSync(file, 'utf-8');
        const listen = content.match(/listen\s*(\d+)/)[1];
        const dir = content.match(/root\s*([_a-zA-Z0-9\/\.]+)/)[1];
        const svninfo = spawn(`svn info`,[],{cwd:dir , encoding:'utf-8', shell:true}).output[1];
        const svnURL = svninfo.match(/\nURL:\s+([^\n]+)/)[1];
        const reg = new RegExp('^'+DIR,'i');
        const branchinfo = Object.assign({}, branch[svnURL]);
        const req = branchinfo.req && branchinfo.req.map(r => r.req) || '';
        const memo = branchinfo.req && branchinfo.req.map(r => r.memo) || '';
        const status = branchinfo.status || '0';
        const name = branchinfo.creatorName || '';
        makeTable(
            `http://${IPv4}:${listen}`, 
            dir, 
            file.replace(reg,''),
            svnURL,
            req,
            status,
            name,
            memo,
        );
    });
    log(`本机IP：http://${IPv4}`);
    log(`配置文件根目录：${DIR}`);
    log(table.toString());
}

fire();




