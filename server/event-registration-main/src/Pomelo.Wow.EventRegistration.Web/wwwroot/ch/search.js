component.data = function () {
    return {
        realm: null,
        name: null
    };
};

component.created = function () {
    app.active = 'ch';
    if (app.guildId) {
        this.realm = app.guild.realm;
    }
};

component.methods = {
    search: function () {
        if (!this.name) {
            alert('请输入角色名');
            return;
        }

        if (!this.realm) {
            alert('请输入服务器');
            return;
        }

        app.open(`/ch?id=${this.name}@${this.realm}`, { id: `${this.name}@${this.realm}` });
    }
};