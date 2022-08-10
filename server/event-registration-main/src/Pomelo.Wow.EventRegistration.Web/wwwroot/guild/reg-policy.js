component.data = function () {
    return {};
};

component.methods = {
    save: async function () {
        await qv.patch('/api/guild/' + app.guildId + '/reg-policy', {
            registerPolicy: app.guild.registerPolicy
        });
        alert('新的报名策略已经生效');
    }
};