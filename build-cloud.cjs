'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.join(__dirname,'book-v12.pdf');
if(!fs.existsSync(target)){
 const dir=path.join(__dirname,'book-parts');
 if(!fs.existsSync(dir))throw Error('缺少完整古籍PDF或book-parts分片目录。');
 const files=fs.readdirSync(dir).filter(n=>/^part-\d+\.bin$/.test(n)).sort();
 if(files.length!==4)throw Error('古籍PDF分片不完整，应有4个。');
 const buffers=files.map(n=>fs.readFileSync(path.join(dir,n)));fs.writeFileSync(target,Buffer.concat(buffers));
}
const head=Buffer.alloc(4),fd=fs.openSync(target,'r');fs.readSync(fd,head,0,4,0);fs.closeSync(fd);if(head.toString()!=='%PDF')throw Error('古籍PDF构建失败。');
console.log('Cloud files ready; facsimile PDF available.');
