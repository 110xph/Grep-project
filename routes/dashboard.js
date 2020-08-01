var express = require('express');
var router = express.Router();

/**
 * 调用python文件依赖的包
 */
const spawn = require('child_process').spawn;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Express' });
});

router.get('/visualization', async function(req, res, next) {
    let table = req.query.table;
    let arg = req.query.arg;
    console.log('table:', table);
    console.log('arg:', arg);
    // do something here. for example, you can call python function

    const cPath = process.cwd() + '/public/data/code/hello_world.py';

    let data = await new Promise((resolve, reject) => {
        const ls = spawn('python3', [cPath, table, arg]);
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

module.exports = router;
