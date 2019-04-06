const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('./users-model.js')
const secret = require('../api/secrets.js').jwtSecret;
const { authenticate } = require('../auth/authenticate');

const generateToken = user => {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const options = {
    expiresIn: '2m'
  }
  return jwt.sign(payload, secret, options)
}

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body
  const hash = bcrypt.hashSync(user.password, 4);
  user.password = hash;

  Users.register(user)
  .then(saved => {
    res.status(201).json(saved);
  })
  .catch(err => {
    res.status(500).json(err)
  })
}

function login(req, res) {
  // implement user login
  let { username, password } =  req.body;

  Users.findBy({username})
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)){
      const token = generateToken(user)
      res.status(200).json({
        message: `Successfully logged in ${user.username}!`,
        token,
      })
    } else {
      res.status(401).json({ errorMessage: 'Invalid Credentials' })
    }
  })
  .catch(err => {
    res.status(500).json(err)
  })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
