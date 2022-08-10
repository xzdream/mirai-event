component.data = function () {
    return {
        form: {
            username: '',
            password: ''
        }
    };
};

component.created = function () {
    app.active = 'login';
};

component.methods = {
    login: async function () {
        try {
            var result = await qv.post('/api/user/' + this.form.username + '/session', { password: this.form.password });
            window.localStorage.setItem('token', result.data.token);
            window.localStorage.setItem('role', result.data.role);
            window.localStorage.setItem('username', this.form.username);
            app.user.token = result.data.token;
            app.user.role = result.data.role;
            app.user.username = this.form.username;
            window.location = '/';
        } catch (e) {
            alert('用户名或密码错误！');
        }
    }
};