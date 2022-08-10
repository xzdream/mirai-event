component.data = function () {
    return {
        members: [],
        days: 30
    };
};

component.created = function () {
    this.loadMembers();
};

component.watch = {
    days: function () {
        this.loadMembers();
    }
};

component.methods = {
    loadMembers: async function () {
        var members = (await qv.get('/api/guild/' + app.guildId + '/members?days=' + this.days)).data;
        for (var i = 0; i < members.length; ++i) {
            members[i].charactors.splice(3);
        }
        this.members = members;
    }
};