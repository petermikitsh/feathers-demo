import feathers from 'feathers'
import hooks from 'feathers-hooks'
import memory from 'feathers-memory'
import socketio from 'feathers-socketio'
import webpack from 'webpack'
import WebpackDevConfig from './webpack/dev.client'
import util from 'util'

const compiler = webpack(WebpackDevConfig);

// Create a feathers instance.
const app = feathers()
  .configure(socketio(function (io) {
    io.on('connection', function(socket) {
      socket.feathers.query = {tenantId: socket.handshake.headers.host};
    });
  }))
  .configure(hooks());

// Create an in-memory Feathers service
app.use('/messages', memory({
  paginate: {
    default: 50,
    max: 100
  }
}));

const messagesService = app.service('/messages');

messagesService.before({
  create(hook) {
    hook.data.tenantId = hook.params.query.tenantId;
  }
});

messagesService.filter(function(data, connection) {
  if (data.tenantId != connection.query.tenantId) {
    return false;
  } else {
    return data;
  }
});

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: WebpackDevConfig.output.publicPath,
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*'},
  noInfo: true,
  historyApiFallback: true
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function (req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id='app'></div>
        <script src='/build/bundle.js'></script>
      <body>
    </html>
    `);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
