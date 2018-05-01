var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var spawn = require('child_process').spawn;

app.listen(8080);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

var sh = spawn('bash');

sh.stdout.on('data', function(data) {
    io.sockets.emit('out', data.toString('utf-8'));
});

sh.stderr.on('data', function(data) {
    io.sockets.emit('err', data.toString('utf-8'));
});

sh.on('exit', function (code) {
    io.sockets.emit('err', '** Shell exited: '+code.toString('utf-8')+' **');
});

io.on('connection', function (socket) {
    socket.on('input', function(data){
        sh.stdin.write(data+"\n");
        io.sockets.emit('cmd', data.toString('utf-8'));
    });
});
