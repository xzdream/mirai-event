component.data = function () {
    return {
        activity: null,
        whisper: app.guildId || '123',
        members: '',
        waString: null,
        scope: 0
    }
};

component.created = async function () {
};

component.mounted = function () {
    this.generate();
};

component.methods = {
    generate: async function () {
        if (!this.activity) {
            alert('无法生成WA字符串');
            return;
        }

        this.waString = '正在生成...';

        var ret = "";
        if (this.scope == 0) {
            var reg = this.activity.registrations.filter(x => x.status == 4 || x.status == 2);
        } else {
            var reg = this.activity.registrations.filter(x => x.status == 4);
        }
        for (var i = 0; i < reg.length; ++i) {
            ret += reg[i].name + "(" + app.getClassName(reg[i].class) + "),";
        }
        ret = ret.substr(0, ret.length - 1);
        this.members = ret;

        this.waString = await qv.post('//wa.mwow.org/api/wa/templates/group-member',
            {
                arguments: [
                    { "key": "WHISPER_MSG", value: this.whisper },
                    { "key": "MEMBER_LIST", value: this.members }
                ]
            }, 'text');
    }
};