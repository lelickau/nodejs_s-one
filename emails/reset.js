const keys = require('../keys')

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Востановление доступа',
        html: `
            <h1>Для востановления пароля перейдите по ссылке ниже</h1>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Востановить доступ</a></p>
            <a href="${keys.BASE_URL}">Перейти на сайт ${email}</a>
        `,
    }
}