let express = require('express');
let proxy = require('http-proxy-middleware');
let fs = require('fs');
let app = express();
let searchData = require('./mock');
let path = require('path');
let xlsx = require('node-xlsx');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static('public'));
app.get('/',function (req, res) {
    res.setHeader('Content-Type','text/html;charset=utf-8');
    fs.createReadStream('down.html').pipe(res);
});
app.post('/search',urlencodedParser,(req,res)=>{
    //let filePath = path.join(__dirname,'public/css/msg.docx');
    console.log(`id=${req.body.id}`);
    const data = searchData[`tabel${req.body.id}`];
    let buffer = xlsx.build([{name: `mySheetName${req.body.id}`, data: data}]);
    fs.writeFile(`./public/assets/mySheetName${req.body.id}.xlsx`, buffer, function(err) {
        if (err) throw err;
        console.log('has finished');
    });
    res.send({fileName:`mySheetName${req.body.id}.xlsx`});

});
app.post('/exist',urlencodedParser,(req, res)=>{
    let filePath = path.join(__dirname,'public','assets',req.body.fileName)
    if(fs.existsSync(filePath)){
       /* res.setHeader('Content-Type','application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=mySheetName${req.query.id}.xlsx`);
        fs.createReadStream(filePath).pipe(res);*/
        //直接返回文件的url，给浏览器自己下载（对于txt，pdf等文件不适用，浏览器会预览）
        //res.send({url:path.join('assets',req.body.fileName),flag:0})
        //返回一个url，前台再请求，
        res.send({fileName:req.body.fileName,flag:0})
    }
    else {
        res.send({flag:1})
    }
});
app.get('/getDown',(req,res) => {//文件生成好了 在返回流文件
    let filePath = path.join(__dirname,'public','assets',req.query.fileName);
    res.setHeader('Content-Type','application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=mySheetName${req.query.fileName}.xlsx`);
    fs.createReadStream(filePath).pipe(res);
});
app.post('/del',urlencodedParser,(req, res)=>{
    let dirPath = path.join(__dirname,'public','assets');
    let files = [];
    if(fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath);
        files.forEach(function(file, index) {
            var curPath = dirPath + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
               // deleteall(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        //fs.rmdirSync(dirPath);
    }
    res.send('删除完成')
});

app.get('/down/xlsx',(req,res)=>{
    const data = searchData[`tabel${req.query.id}`];
    let buffer = xlsx.build([{name: `mySheetName${req.query.id}`, data: data}]);
    console.log(buffer)
    res.setHeader('Content-Type','application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=mySheetName${req.query.id}.xlsx`);
    res.send(buffer)
});
app.listen(3000,() => {
    console.log(`服务器启动`)
});
