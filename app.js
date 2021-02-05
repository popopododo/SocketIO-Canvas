
var express = require('express');
var socketio = require('socket.io');
var http = require('http');
var ejs = require('ejs');
var fs = require('fs');
const { res } = require('express');
// var session = require('express-session');


var app = express();
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.set('port',process.env.port || 3000);
/*var server = http.createServer(app);
server.listen(3000, function () {
    console.log('3000번 포트 대기중');
});

*/
var server = app.listen(app.get('port'),function(){
    console.log(server.address().port+"번 포트에서 실행 중!!")
})

var io = socketio.listen(server);
io.set('log level', 2);


app.get('/', function (req, res) {
    fs.readFile('mainPage.html', function (error, data) {
        res.send(data.toString());
    });
});

app.get('/canvas/:room', function (req, res) {
    fs.readFile('Canvas.html', 'utf8', function (error, data) {
        res.send(ejs.render(data, {
            room: req.param('room')
        }));
    });
});
app.get('/canvas/:room',function(req,res){
    fs.readFile('Canvas.html','utf8',function(error,data){
        res.writeHead(200,{'Content-Type': 'text/html'});
        res.end(data);
    });
});
app.get('/room', function (request, response) {
    response.send(io.sockets.manager.rooms);
});

io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        socket.join(data);
        socket.set('room', data);
    });

    socket.on('draw', function (data) {
        socket.get('room', function (error, room) {
            io.sockets.in(room).emit('line', data);
            io.sockets.in(room).emit('Erase',data);
        });
    });
    socket.on('createroom', function (data) {
        io.sockets.emit('createroom', data.toString());
    });
    
});

