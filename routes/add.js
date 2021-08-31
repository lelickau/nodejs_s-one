const { Router } = require("express");
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, (req, res) => {
    try {
        res.render('add', {
            title: 'Добавить курс',
            isAdd: true,
        })
    } catch (err) {
        console.log(err);
    }

})

router.post('/', auth, async (req, res) => {
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user._id
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (err) {
        console.log(err);
    }


})

module.exports = router;