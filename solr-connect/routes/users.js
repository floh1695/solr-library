var express = require('express');
var router = express.Router();

const solr = require('solr-node');

var client = new solr({
  host: 'localhost',
  port: '8983',
  core: 'collection1',
  protocol: 'http'
});

const randomNumber = (start, end) =>
  start + Math.floor(Math.random() * (end + 1 - start));

const updateUser = user => {
  const name = user.name.toLowerCase();
  const key = user.key;

  const solrUser = {
    id: `(name:${name},key:${key})`,
    name_t: name,
    key_i: key,
  };

  return client.update(solrUser)
    .then(result => {
      console.log(`update: user: ${result.response}`);
      return client.commit();
    })
    .then(result => {
      console.log(`commite: update: user: ${result.response}`);
      return solrUser;
    })
    .catch(error => {
      console.error(`update: user: fail: ${error}`);
      res.send(error);
    });
};

router.get('/add/:name/:key', (req, res) => {
  const name = req.params.name;
  const key = parseInt(req.params.key);

  const document = {
    name: name,
    key: key,
  };

  updateUser(document)
    .then(solrUser => res.send(solrUser));
});

router.get('/addTestData', (req, res) => {
  const firstNames = [
    'charles',
    'nicholas',
    'alexander',
    'dean',
    'william',
    'christopher',
    'mechele',
    'shenole',
    'angus',
    'mickey',
  ];
  const lastNames = [
    'bayley',
    'vilela',
    'turetsky',
    'mouse',
    'latimer',
    'smith',
  ];

  const fullNames = firstNames
    .map(firstName => lastNames
      .map(lastName => `${firstName} ${lastName}`))
    .reduce((acc, next) => acc.concat(next), []);

  const users = fullNames
    .map(name => ({ 
      name, 
      key: randomNumber(1, 5), 
    }));

  const updates = users.map(updateUser);

  Promise.all(updates)
    .then(response => res.send(response));
});

router.get('/get/:name/:key', (req, res) => {
  const name = req.params.name.toLowerCase();
  const key = parseInt(req.params.key);
  
  const query = client.query().q(`name_t:"${name}"~ AND key_t:"${key}"~`);
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
