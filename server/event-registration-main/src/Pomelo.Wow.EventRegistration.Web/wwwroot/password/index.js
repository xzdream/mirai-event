component.data = function () {
    return {
        form: {
            old: '',
            new: '',
            confirm: ''
        }
    };
};

component.created = function () {
    app.active = 'password';
};

component.methods = {
    resetPassword: async function () {
        if (this.form.new != this.form.confirm) {
            alert('两次密码不一致');
        }

        if (!this.form.new) {
            alert('密码不能为空');
        }

        try {
            await qv.post('/api/user/' + app.user.username + '/password', this.form);
            this.form = {
                old: '',
                new: '',
                confirm: ''
            };
            alert('新密码已生效');
        } catch (e) {
            alert('密码修改失败');
        }
    }
};