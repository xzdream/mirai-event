component.data = function () {
    return {
        id: null,
        charactor: null,
        notfound: false,
        active: 'dps',
        dps: [],
        hps: []
    };
};

component.created = function () {
    app.active = 'ch';
    this.loadCharactor();
};

component.methods = {
    loadCharactor: async function () {
        var name = this.id.split('@')[0];
        var realm = this.id.split('@')[1];
        try {
            this.charactor = (await qv.get(`/api/charactor/${realm}/${name}`)).data;
            if (this.charactor == null) {
                this.notfound = true;
            }

            $('title').html(`${name} - ${realm} - ${this.getClassName(this.charactor.class)} - ${this.charactor.highestItemLevel}装等`);

            this.dps = JSON.parse(this.charactor.dpsBossRanks);
            this.hps = JSON.parse(this.charactor.hpsBossRanks);
            this.charactor.items = [];

            var itemReq = { group: 0, ids: this.charactor.equipments.split(',').filter(x => x) };
            var self = this;
            qv.post('/api/item/batch', { queries: [itemReq] }).then(data => {
                try {
                    var fetched = data.data.filter(x => x.group == 0);
                    if (!fetched.length) {
                        return;
                    }

                    fetched = fetched[0];
                    self.charactor.items = fetched.items;
                } catch (e) {
                    console.error(e);
                }
                self.$forceUpdate();
            });
        } catch (e) {
            console.error(e);
            notfound = true;
            return;
        }
    },
    getClassName: function (classId) {
        if (classId == 1) {
            return '战士';
        } else if (classId == 2) {
            return '圣骑士';
        } else if (classId == 4) {
            return '猎人';
        } else if (classId == 8) {
            return '萨满祭司';
        } else if (classId == 16) {
            return '潜行者';
        } else if (classId == 32) {
            return '德鲁伊';
        } else if (classId == 64) {
            return '术士';
        } else if (classId == 128) {
            return '法师';
        } else if (classId == 256) {
            return '牧师';
        } else {
            return '未知';
        }
    },
    parseTimeSpan: function (str) {
        if (str.indexOf('00:') == 0) {
            return str.substr(3);
        } else {
            return str;
        }
    }
};