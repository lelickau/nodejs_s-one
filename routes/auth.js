const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const keys = require('../keys');
const {validationResult} = require('express-validator/check')
const resetPassword = require('../emails/reset');
const regEmail = require('../emails/registrations');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const router = Router();
const {registerValidators} = require('../utils/validators');

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}));

// Авторизация общие настройки
router.get('/login', async (req, res) => {
    try {
        res.render('auth/login', {
            title: 'Авторизация',
            isLogin: true,
            loginErr: req.flash('loginErr'),
            regErr: req.flash('regErr'),
        })
    } catch (err) {
        console.log(err);
    }

});

// выйти из аккаунта
router.get('/logout', async (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/auth/login#login')
        })
    } catch (err) {
        console.log(err);
    }
});

// залогинится
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});
        if (candidate) {
            const areSome = await bcrypt.compare(password, candidate.password);
            if (areSome) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if(err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginErr', 'Неверный пароль')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginErr', 'Такой пользователь не зарегистрирован')
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err);
    }
})

// зарегистрироваться
router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            req.flash('regErr', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email, name, password: hashPassword, cart: {items: []}
        });
        await user.save();
        res.redirect('/auth/login#login');
        await transporter.sendMail(regEmail(email));

    } catch (err) {
        console.log(err);
    }
})

// востановить пароль общее страница email
router.get('/reset', (req, res) => {
    try {
        res.render('auth/reset', {
            title: 'Востановить пароль',
            error: req.flash('error')
        })
    } catch (err) {
        console.log(err);
    }

})

// востановить пароль
router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if(candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60*60*1000;
                await candidate.save();
                await transporter.sendMail(resetPassword(candidate.email, token));
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset');
            }
        })
    } catch (err) {
        console.log(err);
    }
})

// востановить пароль общее страница обновить пароль
router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if(!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Востановить доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (err) {
        console.log(err);
    }
})

// добавить новый пароль
router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Время смены пвроля истекло. Повторите попытку снова.');
            req.redirect('/auth/login');
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;