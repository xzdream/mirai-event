component.data = function () {
    return {
        form: {
            username: '',
            password: '',
            confirm: '',
            email: '',
            displayName: ''
        }
    };
};

component.created = function () {
    app.active = 'reg';
};

component.methods = {
    reg: async function () {
        if (this.form.username.length < 3) {
            alert('用户名长度必须大于3');
            return;
        }

        if (this.form.password != this.form.confirm) {
            alert('两次密码输入不一致');
            return;
        }

        if (!this.form.displayName) {
            alert('请输入昵称');
            return;
        }

        if (!this.form.email) {
            alert('请输入电子邮箱地址');
            return;
        }

        try {
            var result = await qv.post('/api/user', this.form);
            alert('用户注册成功');
            app.open('/login');
        } catch (e) {
            console.error(e);
            alert('用户名注册失败！');
        }
    }
};