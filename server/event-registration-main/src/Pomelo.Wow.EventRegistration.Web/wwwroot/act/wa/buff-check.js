component.data = function () {
    return {
        activity: null,
        waString: null,
        arguments: [
            { Key: "OWNER_MAGE_1", Value: null },
            { Key: "OWNER_MAGE_2", Value: null },
            { Key: "OWNER_MAGE_3", Value: null },
            { Key: "OWNER_MAGE_4", Value: null },
            { Key: "OWNER_MAGE_5", Value: null },
            { Key: "OWNER_DRUID_1", Value: null },
            { Key: "OWNER_DRUID_2", Value: null },
            { Key: "OWNER_DRUID_3", Value: null },
            { Key: "OWNER_DRUID_4", Value: null },
            { Key: "OWNER_DRUID_5", Value: null },
            { Key: "OWNER_PRIEST_1", Value: null },
            { Key: "OWNER_PRIEST_2", Value: null },
            { Key: "OWNER_PRIEST_3", Value: null },
            { Key: "OWNER_PRIEST_4", Value: null },
            { Key: "OWNER_PRIEST_5", Value: null },
            { Key: "OWNER_PALADIN_1", Value: null },
            { Key: "OWNER_PALADIN_2", Value: null },
            { Key: "OWNER_PALADIN_3", Value: null },
            { Key: "BUFF_1_SWITCH", Value: "false" },
            { Key: "BUFF_2_SWITCH", Value: "false" },
            { Key: "BUFF_3_SWITCH", Value: "false" },
            { Key: "BUFF_4_SWITCH", Value: "false" },
            { Key: "BUFF_5_SWITCH", Value: "false" },
            { Key: "BUFF_6_SWITCH", Value: "false" },
        ],
        tasks: { groups: [] },
        taskIndex: null
    }
};

component.created = async function () {
};

component.mounted = function () {
    if (!this.tasks.groups.some(x => x.wa == 'buff-check')) {
        this.tasks.groups.push({
            name: 'WeakAuras - 团队BUFF',
            tasks: [
                {
                    text: '1队智力',
                    players: []
                },
                {
                    text: '2队智力',
                    players: []
                },
                {
                    text: '3队智力',
                    players: []
                },
                {
                    text: '4队智力',
                    players: []
                },
                {
                    text: '5队智力',
                    players: []
                },
                {
                    text: '1队爪子',
                    players: []
                },
                {
                    text: '2队爪子',
                    players: []
                },
                {
                    text: '3队爪子',
                    players: []
                },
                {
                    text: '4队爪子',
                    players: []
                },
                {
                    text: '5队爪子',
                    players: []
                },
                {
                    text: '1队耐力',
                    players: []
                },
                {
                    text: '2队耐力',
                    players: []
                },
                {
                    text: '3队耐力',
                    players: []
                },
                {
                    text: '4队耐力',
                    players: []
                },
                {
                    text: '5队耐力',
                    players: []
                },
                {
                    text: '全团拯救/猎人力量',
                    players: []
                },
                {
                    text: '全团回蓝',
                    players: []
                },
                {
                    text: '全团王者',
                    players: []
                }
            ],
            wa: 'buff-check'
        });

        if (app.guildPermission.guildManager) {
            this.saveTasks();
        }
    }

    this.taskIndex = this.findIndex();

    this.generate();
};

component.methods = {
    findIndex: function () {
        for (var i = 0; i < this.tasks.groups.length; ++i) {
            if (this.tasks.groups[i].wa == 'buff-check') {
                return i;
            }
        }
        return -1;
    },
    generate: async function () {
        if (!this.activity || this.taskIndex < 0) {
            alert('无法生成WA字符串');
            return;
        }

        if (app.guildPermission.guildManager) {
            this.saveTasks();
        }
        this.waString = '正在生成...';

        var tasks = this.tasks.groups[this.taskIndex].tasks;
        for (var i = 0; i < 18; ++i) {
            if (tasks[i].players.length) {
                var reg = this.activity.registrations.filter(x => x.id == tasks[i].players[0]);
                if (!reg.length) {
                    this.arguments[i].Value = '';
                    continue;
                }
                reg = reg[0];
                this.arguments[i].Value = reg.name;
            }
        }

        this.arguments[18].Value =
            (this.arguments[0].Value || this.arguments[1].Value || this.arguments[2].Value || this.arguments[3].Value || this.arguments[4].Value)
                ? 'true' : 'false';
        this.arguments[19].Value =
            (this.arguments[5].Value || this.arguments[6].Value || this.arguments[7].Value || this.arguments[8].Value || this.arguments[9].Value)
                ? 'true' : 'false';
        this.arguments[20].Value =
            (this.arguments[10].Value || this.arguments[11].Value || this.arguments[12].Value || this.arguments[13].Value || this.arguments[14].Value)
                ? 'true' : 'false';
        if (this.arguments[15].Value) {
            this.arguments[21].Value = 'true';
        }
        if (this.arguments[16].Value) {
            this.arguments[22].Value = 'true';
        }
        if (this.arguments[17].Value) {
            this.arguments[23].Value = 'true';
        }

        this.waString = await qv.post('//wa.mwow.org/api/wa/templates/buff-check',
            {
                arguments: this.arguments
            }, 'text');
    },
    saveTasks: function () {
        qv.patch(`/api/activity/${this.activity.id}`, { extension2: JSON.stringify(this.tasks) });
    }
};