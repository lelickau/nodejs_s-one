const keys = require('../keys')

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Аккаунт создан',
        html: `
            <h1>Добро пожаловать в CourseApp!</h1>
            <p>Ваш логин ${email}</p>
            <a href="${keys.BASE_URL}">Перейти на сайт ${email}</a>
        `,
    }
}