component.data = function () {
    return {
        form: {
            id: '',
            name: '',
            realm: '',
            faction: 'Alliance'
        }
    };
};

component.created = function () {
    app.active = 'create-guild';
};

component.methods = {
    create: async function () {
        if (!this.form.id) {
            alert('请输入公会英文简称');
            return;
        }

        if (!this.form.name) {
            alert('请输入公会名称');
            return;
        }

        if (!this.form.realm) {
            alert('请输入公会所在服务器');
            return;
        }

        if (!/^[0-9a-zA-Z-_]{4,16}$/.test(this.form.id)) {
            alert('公会网址不合法，请使用英文字母、数字、连字符，并保证长度大于4');
            return;
        }

        try {
            var result = await qv.post('/api/guild', this.form);
            alert('公会创建成功');
            window.location = 'https://' + this.form.id + '.mwow.org';
        } catch (e) {
            console.error(e);
            alert('公会创建失败！');
        }
    }
};