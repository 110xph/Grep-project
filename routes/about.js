var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})
// define the home page route
router.get('/', function (req, res) {
    res.send('Birds home page')
})
// define the about route
router.get('/about', function (req, res) {
    res.send('About birds')
})

router.get('/server-graph', async function(req, res) {
    const cPath = process.cwd() + '/public/data/data/design/server-graph-nodes.gexf.xml';

    res.sendFile(cPath, "",function (err) {
        if (err) {
            //next(err)
            console.log(err)
        } else {
            console.log('Sent:', cPath)
        }
    })
});


router.get('/actual-graph', async function(req, res) {
    const cPath = process.cwd() + '/public/data/data/design/actual-graph-nodes.gexf.xml';

    res.sendFile(cPath, "",function (err) {
        if (err) {
            //next(err)
            console.log(err)
        } else {
            console.log('Sent:', cPath)
        }
    })
});

router.get('/simulate-graph', async function(req, res) {
    const cPath = process.cwd() + '/public/data/data/design/analog-graph-nodes.gexf.xml';

    //const cPath = process.cwd() + '/public/data/data/design/join-column-graph.gexf.xml';

    res.sendFile(cPath, "",function (err) {
        if (err) {
            //next(err)
            console.log(err)
        } else {
            console.log('Sent:', cPath)
        }
    })
});


module.exports = router
