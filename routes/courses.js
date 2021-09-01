const {Router} = require('express')
const Course = require('../models/course');
const {validationResult} = require('express-validator/check')
const auth = require('../middleware/auth');
const router = Router();
const {courseValidators} = require('../utils/validators.js');

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img')
    console.log(courses);
    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      csrf: req.csrfToken(),
      userId: req.user ? req.user._id.toString() : null,
      courses
    })
  } catch (err) {
    console.log(err);
  }

})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try {
    const course = await Course.findById(req.params.id);
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    })
  } catch (err) {
    console.log(err);
  }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const {id} = req.body;
    if(!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
  try {
    delete req.body.id;
    const course = await Course.findById(id);
    if(!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect('/courses')
  } catch (err) {
    console.log(err);
  }

})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id, userId: req.user._id})
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
    });
  } catch (err) {
    console.log(err);
  }

})

module.exports = router