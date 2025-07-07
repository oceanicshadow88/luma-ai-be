const { DEFAULT_LOCALE } = require('../../../dist/src/config');
const { default: UserModel } = require('../../../dist/src/models/user');

class UserBuilder {
    constructor() {
        this.user = {
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            password: '!passwordD123',
            email: 'john@example.com',
            avatarUrl: '',
            locale: DEFAULT_LOCALE,
            active: true,
            refreshToken: undefined,
            loginAttempts: 0,
            lockUntil: null,
        };
        return this;
    }

    withFirstName(firstName) {
        this.user.firstName = firstName;
        return this;
    }

    withLastName(lastName) {
        this.user.lastName = lastName;
        return this;
    }

    withUsername(username) {
        this.user.username = username;
        return this;
    }

    withPassword(password) {
        this.user.password = password;
        return this;
    }

    withEmail(email) {
        this.user.email = email;
        return this;
    }

    withAvatarUrl(avatarUrl) {
        this.user.avatarUrl = avatarUrl;
        return this;
    }

    withLocale(locale) {
        this.user.locale = locale;
        return this;
    }

    withActive(active) {
        this.user.active = active;
        return this;
    }

    withRefreshToken(refreshToken) {
        this.user.refreshToken = refreshToken;
        return this;
    }

    withLoginAttempts(loginAttempts) {
        this.user.loginAttempts = loginAttempts;
        return this;
    }

    withLockUntil(lockUntil) {
        this.user.lockUntil = lockUntil;
        return this;
    }

    build() {
        return this.user;
    }

    save() {
        return new UserModel(this.user).save();
    }
}

module.exports = UserBuilder;