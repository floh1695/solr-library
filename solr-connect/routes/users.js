var express = require('express');
var router = express.Router();

const solr = require('solr-node');

var client = new solr({
  host: 'localhost',
  port: '8983',
  core: 'collection1',
  protocol: 'http'
});

router.get('/add/:name/:key', (req, res) => {
  const name = req.params.name.toLowerCase();
  const key = req.params.key.toLowerCase();
  const document = {
    id: `(name:${name},key:${key})`,
    name_t: name,
    key_t: key,
  };

  client.update(document)
    .then(result => {
      console.log(`update: good: ${result.response}`);
      return client.commit();
    })
    .then(result => {
      console.log(`commit: good: ${result.response}`);
      res.send(document);
    })
    .catch(error => {
      console.error(`update: bad: ${error}`);
      res.send(error);
    });
});

router.get('/get/:name/:key', (req, res) => {
  const name = req.params.name.toLowerCase();
  const key = req.params.key.toLowerCase();
  
  const query = client.query().q(`name_t:${name}~ AND key_t:${key}~`);
  client.search(query)
    .then(result => {
      console.log(`search results: ${result}`);
      res.send(result);
    })
    .catch(error => {
      console.error(`update: bad: ${error}`);
      res.send(error);
    });
});

module.exports = router;
