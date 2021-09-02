const {body} = require('express-validator/check');
const User = require('../models/user');

exports.registerValidators = [
    body('email').isEmail()
        .withMessage('Email не корректный')
        .custom(async(value, {req}) => {
            try {
                const user = await User.findOne({email: value});
                if(user) {
                    return Promise.reject('Такой email занят')
                }
            } catch (err) {
                console.log(err);
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль должен состоять минимум из 6 символов (цифр и букв)')
        .isLength({min:6, max:56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true;
        })
        .trim(),
    body('name').isLength({min:3}).withMessage('Имя должно состоять минимум из 3 символов').trim()
]

exports.courseValidators = [
    body('title')
        .isLength({min:3})
        .withMessage('Название должно состоять минимум из 3х символов')
        .trim(),
    body('img', 'Введите корректный Url картинки').isURL(),
    body('price').isNumeric().withMessage('Цена не корректная')
]