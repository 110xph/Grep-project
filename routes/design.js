var express = require('express');
var router = express.Router();

var path = process.cwd();
var child_process = require('child_process');
var spawn = child_process.spawn;
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('design', { title: 'Express' });
});

router.get('/ajax', async function(req, res, next) {
    let method = req.query.method;
    let arch = req.query.arch;
    let instance = req.query.instance;

    const filename = path + "/public/data/args.json";
    var result = {};
    if (fs.existsSync(filename)) {
    	result = JSON.parse(fs.readFileSync(filename));         
    } else {
        result['server'] = '0';
        result['data'] = '0';
        result['workload'] = '0'; 
    }  
    result['method'] = method;
	result['arch'] = arch;
	result['instance'] = instance;
	fs.writeFileSync(filename, JSON.stringify(result));
    console.log('method:', method);
    console.log('arch:', arch);
    console.log('instance:', instance);
    // do something here. for example, you can call python function

    const cPath = path + '/public/data/code/hello_world.py';
    console.log(cPath);

    let data = await new Promise((resolve, reject) => {
        const ls = spawn('python', [cPath, method, arch, instance]);
        let result = '';
        ls.stdout.on('data', (data) => {
            result += data;
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if (result !== '') resolve(result);
        });
    });

    console.log(data);

    res.send({
      'data': data
    })
});

router.get('/workload', async function(req, res, next) {
    let workload = req.query.workload;

    const filename = path + "/public/data/args.json";
    var result = {};
    if (fs.existsSync(filename)) {
    	result = JSON.parse(fs.readFileSync(filename));         
    } else {
        result['server'] = '0';
        result['data'] = '0';
    }  
    result['workload'] = workload;
	fs.writeFileSync(filename, JSON.stringify(result));
    console.log('workload:', workload);
    // essential part
    res.send({
      'workload': workload
    })
});

router.get('/data', async function(req, res, next) {
    let data = req.query.data;

    const filename = path + "/public/data/args.json";
    var result = {};
    if (fs.existsSync(filename)) {
    	result = JSON.parse(fs.readFileSync(filename));         
    } else {
        result['server'] = '0';
        result['workload'] = '0';
    }  
    result['data'] = data;
	fs.writeFileSync(filename, JSON.stringify(result));
    console.log('data:', data);

    res.send({
      'data': data
    })
});

router.get('/server', async function(req, res, next) {
    let server = req.query.server;

    const filename = path + "/public/data/args.json";
    var result = {};
    if (fs.existsSync(filename)) {
    	result = JSON.parse(fs.readFileSync(filename));         
    } else {
        result['data'] = '0';
        result['workload'] = '0';
    }  
    result['server'] = server;
	fs.writeFileSync(filename, JSON.stringify(result));
    console.log('server:', server);

    res.send({
      'server': server
    })
});

module.exports = router;
