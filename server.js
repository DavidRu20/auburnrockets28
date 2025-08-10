const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

mongoose.connect('mongodb://localhost:27017/users', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// Create account or log in
app.post('/auth', async (req, res) => {
  const { mode, name, email, password } = req.body;
  if (!email || !password) return res.send('Missing fields');

  if (mode === 'signup') {
    if (!name) return res.send('Name is required for signup');
    const hashed = await bcrypt.hash(password, 10);
    try {
      await User.create({ name, email, password: hashed });
      res.send('Account created, you can log in now!');
    } catch (err) {
      res.send('Error: Email already in use');
    }
  } else if (mode === 'login') {
    const user = await User.findOne({ email });
    if (!user) return res.send('User not found');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Incorrect password');
    req.session.userId = user._id;
    res.send('Login successful');
  }
});

// Check login status
app.get('/auth/check', async (req, res) => {
  if (!req.session.userId) return res.json({ loggedIn: false });
  const user = await User.findById(req.session.userId).select('name email');
  res.json({ loggedIn: true, user });
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.send('Logged out'));
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
