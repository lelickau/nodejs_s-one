const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const csrf = require('csurf');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const addRoutes = require('./routes/add');
const authRoutes = require('./routes/auth');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const MONGODB_URL = 'mongodb+srv://lelickau:XbNZYGi9rNEShmtk@clustercourses.cle9b.mongodb.net/shop';
const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});

const store = new MongoStore({
  collection: 'session',
  uri: MONGODB_URL,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false,
  store
}));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);


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
      /* const candidate = await User.findOne();
      if(!candidate) {
        const user = new User({
          email: 'lelickau@yandex.ru',
          name: 'Elena',
          cart: {
            items: []
          },
        });
        await user.save();
      } */

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    } catch (e) {
      console.log(e)
    }
  }

start()



