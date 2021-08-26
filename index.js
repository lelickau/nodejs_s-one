const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const addRoutes = require('./routes/add');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const varMiddleware = require('./middleware/variables');

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('61262864948f9e00c011acd5');
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false
}));
app.use(varMiddleware);


app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3050;

async function start() {
    try {
      const url = 'mongodb+srv://lelickau:XbNZYGi9rNEShmtk@clustercourses.cle9b.mongodb.net/shop'
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false
      });
      const candidate = await User.findOne();
      if(!candidate) {
        const user = new User({
          email: 'lelickau@yandex.ru',
          name: 'Elena',
          cart: {
            items: []
          },
        });
        await user.save();
      }

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    } catch (e) {
      console.log(e)
    }
  }

start()



