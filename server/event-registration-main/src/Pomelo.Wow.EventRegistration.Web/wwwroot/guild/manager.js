component.data = function () {
    return {
        managers: [],
        form: {
            username: null
        }
    };
};

component.methods = {
    loadManagers: async function () {
        this.managers = (await qv.get(`/api/guild/${app.guildId}/manager`)).data;
    },
    createManager: async function () {
        await qv.put(`/api/guild/${app.guildId}/manager/${this.form.username}`, {});
        await this.loadManagers();
        this.form.username = null;
    },
    deleteManager: async function (username) {
        if (app.user.name == username) {
            alert('您不能将自己取消管理员！');
            return;
        }
        await qv.delete(`/api/guild/${app.guildId}/manager/${username}`, {});
        await this.loadManagers();
    }
};

component.created = function () {
    this.loadManagers();
};