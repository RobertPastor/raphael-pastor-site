const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const routes = require('./routes/index');
const bodyParser = require('body-parser');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies


routes(app);

// 404 error handling
app.use(function (err, req, res, next) {

  // respond with html page
  if (req.accepts('html')) {
    res.render('error', { url: req.url, message: err.message, error: { status: err.status, stack: err.stack } });
    return;
  }

  // respond with json
  // if (req.accepts('json')) {
  //   res.send({ error: 'Not found' });
  //   return;
  // }

  // default to plain-text. send()
  res.type('txt').send('Not found ' + req.url);

});

app.listen(PORT, () => {
  console.log('Listening on port= ' + String(PORT));
});



