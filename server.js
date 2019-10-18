const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback');
const sslRedirect = require('heroku-ssl-redirect');

const app = express();

app.use(history());

app.use(sslRedirect(['development', 'production']));

app.use(express.static(path.join(__dirname, '/dist/spa-mat')));

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), () => {
  console.log(`Server launched on ${process.env.port || 8080}`);
});
