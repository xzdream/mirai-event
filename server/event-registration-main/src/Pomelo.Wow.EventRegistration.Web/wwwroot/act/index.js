component.data = function () {
    return {
        id: null,
        myCharactors: [],
        form: {
            newCharactor: {
                class: 1,
                name: '',
                realm: '',
                role: 0
            },
            newGrid: {
                name: null,
                mode: 0
            },
            newTaskGroup: {
                name: ''
            },
            newTask: {
                text: ''
            }
        },
        permission: {
            guildManager: false,
            guildOwner: false
        },
        activity: null,
        raids: [],
        bosses: [],
        inProgress: false,
        active: 'registration',
        activeLedger: 'summary',
        grids: { data: [] },
        tasks: { groups: [] },
        ledger: {},
        activeTask: null,
        taskString: '',
        activeTaskUI: 'normal',
        taskEdit: false,
        itemsets: null,
        mobile: {
            selectedReg: null,
            action: 'accept',
            ch: null
        },
        groups: [{ id: 0, name: '坦克', img: '/assets/images/tank.jpg' }, { id: 2, name: '治疗', img: '/assets/images/healer.jpg' }, { id: 1, name: '输出', img: '/assets/images/dps.jpg' }, { id: 3, name: '消费', img: '/assets/images/consumer.jpg' }]
    };
};

component.created = async function () {
    app.active = 'activity';
    try {
        this.myCharactors = JSON.parse(window.localStorage.getItem('my_charactors') || '[]');
    } catch (e) {
        this.myCharactors = [];
    }
    for (var i = 0; i < this.myCharactors.length; ++i) {
        if (this.myCharactors[i].role == 0 && !this.canTank(this.myCharactors[i].class)) {
            this.myCharactors[i].role = 1;
        }

        if (this.myCharactors[i].role == 2 && !this.canHeal(this.myCharactors[i].class)) {
            this.myCharactors[i].role = 1;
        }
    }
    this.getPermission();
    await this.loadItemSets();
};

component.mounted = async function () {
    await this.loadActivity();
    this.bindDragula();

    this.$container = new PomeloComponentContainer('#act-manage-container', app, this, function (view) {
    }, function () { });
    this.$container.open(`/act/manage`, { activity: this.activity, tasks: this.tasks, grids: this.grids });

    this.$container2 = new PomeloComponentContainer('#act-wa-container', app, this, function (view) {
    }, function () { });
    this.$container2.open(`/act/wa`, { activity: this.activity, tasks: this.tasks, grids: this.grids });
};

component.methods = {
    loadItemSets: async function () {
        this.itemsets = (await qv.get('/api/item/set')).data;
    },
    loadActivity: async function () {
        this.raids = (await qv.get('/api/raid')).data;
        var activity = (await qv.get('/api/activity/' + this.id)).data;

        if (app.guildId && activity.guildId != app.guildId && activity.domainGuildId != app.guildId) {
            window.location = `https://${activity.guildId}.mwow.org/act?id=${this.id}`;
        }

        $('title').html(activity.name);
        this.form.newCharactor.realm = activity.realm;
        this.bosses = this.getBossNames(activity.raids);
        for (let i = 0; i < activity.registrations.length; ++i) {
            activity.registrations[i].toggle = false;
            if (!activity.registrations[i].charactor) {
                continue;
            }
            var bossObj = activity.registrations[i].role == 2
                ? JSON.parse(activity.registrations[i].charactor.hpsBossRanks)
                : JSON.parse(activity.registrations[i].charactor.dpsBossRanks);
            activity.registrations[i].active = 'boss';
            activity.registrations[i].boss = bossObj;
            activity.registrations[i].bossPassed = this.getBossPassed(bossObj);
            activity.registrations[i].wcl = this.getWcl(bossObj);
            activity.registrations[i].items = [];
            activity.registrations[i].charactor.equipments = activity.registrations[i].charactor.equipments.split(',').map(x => x.trim());

            // Finding item set
            try {
                var sets = this.itemsets[activity.registrations[i].role.toString()];
                for (var j = 0; j < sets.length; ++j) {
                    try {
                        activity.registrations[i].setName = sets[j].name;
                        activity.registrations[i].setCount = 0;

                        for (var k = 0; k < sets[j].items.length; ++k) {
                            if (activity.registrations[i].charactor.equipments.some(x => x == sets[j].items[k])) {
                                ++activity.registrations[i].setCount;
                            }
                        }

                        if (activity.registrations[i].setCount > 0) {
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            } catch (e) {
            }
            
        }
        var itemReq = activity.registrations
            .filter(x => x.charactor && x.charactor.equipments)
            .map(x => { return { group: x.id, ids: x.charactor.equipments.filter(x => x) } });
        var self = this;
        qv.post('/api/item/batch', { queries: itemReq }).then(data => {
            for (var i = 0; i < activity.registrations.length; ++i) {
                try {
                    var fetched = data.data.filter(x => x.group == activity.registrations[i].id);
                    if (!fetched.length) {
                        continue;
                    }

                    fetched = fetched[0];
                    activity.registrations[i].items = fetched.items;
                } catch (e) {
                    console.error(e);
                }
            }
            self.$forceUpdate();
        });
        this.activity = activity;
        this.grids = JSON.parse(this.activity.extension1);

        if (!this.grids.data) {
            this.grids.data = [];
        }

        for (var i = 0; i < this.grids.data.length; ++i) {
            this.grids.data[i].pending = this.generatePendingCharactors(this.grids.data[i].grid);
        }

        this.updateGridStatus();

        this.tasks = JSON.parse(this.activity.extension2);
        if (!this.tasks.groups) {
            this.tasks.groups = [];
        }

        this.ledger = JSON.parse(this.activity.extension3);
        if (!this.ledger) {
            this.ledger = {};
        }
        if (!this.ledger.statistics) {
            this.ledger.statistics = {};
        }
        this.ledger.statistics.topConsumers = this.generateTopConsumers(this.ledger);
        this.ledger.statistics.summary = this.generateLedgerSumamry(this.ledger);
        if (this.ledger.income) {
            this.ledger.income.sort((a, b) => b.price - a.price);
        }
        if (this.ledger.other) {
            this.ledger.other.sort((a, b) => b.price - a.price);
        }
        if (this.ledger.expense) {
            this.ledger.expense.sort((a, b) => b.price - a.price);
        }
    },
    loadItemFor: async function (items, itemId) {
        items.push((await qv.get('/api/item/' + itemId)).data);
    },
    getItemColor: function (bossName, itemLevel) {
        for (var i = 0; i < this.raids.length; ++i) {
            if (this.raids[i].bossList.indexOf(bossName) >= 0) {
                if (itemLevel < this.raids[i].itemLevelEntrance) {
                    return 'gray';
                } else if (itemLevel < this.raids[i].itemLevelPreference && itemLevel >= this.raids[i].itemLevelEntrance) {
                    return 'green';
                } else if (itemLevel < this.raids[i].itemLevelGraduated && itemLevel >= this.raids[i].itemLevelPreference) {
                    return 'blue';
                } else if (itemLevel < this.raids[i].itemLevelFarm && itemLevel >= this.raids[i].itemLevelGraduated) {
                    return 'purple';
                } else {
                    return 'orange';
                }
            }
        }

        return 'gray';
    },
    getWcl: function (bossObj) {
        var wcl = 0.0;
        for (var i = 0; i < this.bosses.length; ++i) {
            if (bossObj.filter(x => x.Name == this.bosses[i]).length) {
                wcl += bossObj.filter(x => x.Name == this.bosses[i])[0].Parse;
            }
        }
        return wcl / this.bosses.length * 1.0;
    },
    getBossPassed: function (bossObj) {
        var passed = 0;
        for (var i = 0; i < this.bosses.length; ++i) {
            if (bossObj.filter(x => x.Name == this.bosses[i]).length) {
                ++passed;
            }
        }
        return passed;
    },
    getBossNames: function (raids) {
        var splited = raids.split(',').map(x => x.trim());
        var ret = [];
        for (var i = 0; i < splited.length; ++i) {
            var raid = this.raids.filter(x => x.id == splited[i]);
            if (!raid.length) {
                continue;
            }
            raid = raid[0];
            var splited2 = raid.bossList.split(',').map(x => x.trim());
            for (var j = 0; j < splited2.length; ++j) {
                ret.push(splited2[j]);
            }
        }
        return ret;
    },
    addCharactor: function () {
        if (!this.form.newCharactor.name) {
            alert('请输入角色名！');
        }

        if (this.form.newCharactor.role == 0 && !this.canTank(this.form.newCharactor.class)) {
            this.form.newCharactor.role = 1;
        }

        if (this.form.newCharactor.role == 2 && !this.canHeal(this.form.newCharactor.class)) {
            this.form.newCharactor.role = 1;
        }

        this.myCharactors.push(JSON.parse(JSON.stringify(this.form.newCharactor)));
        window.localStorage.setItem('my_charactors', JSON.stringify(this.myCharactors));
        this.form.newCharactor = {
            class: 1,
            name: '',
            realm: this.activity ? this.activity.realm : '',
            role: 0
        };
    },
    deleteCharactor: function (ch, i) {
        if (confirm(`你确定要删除角色"${ch.name}"吗？`)) {
            this.myCharactors.splice(i, 1);
            window.localStorage.setItem('my_charactors', JSON.stringify(this.myCharactors));
        }
    },
    register: async function (ch) {
        this.inProgress = true;
        await qv.post(`/api/activity/${this.id}/registrations`, {
            name: ch.name,
            role: ch.role,
            hint: ch.hint,
            class: ch.class
        });
        await this.loadActivity();
        this.inProgress = false;
        window.localStorage.setItem('my_charactors', JSON.stringify(this.myCharactors));
    },
    openItem: function (id) {
        window.open('https://cn.tbc.wowhead.com/item=' + id);
    },
    leave: async function (ch, takeLeave = true) {
        var reg = this.activity.registrations.filter(x => x.name == ch.name)[0];
        reg.status = takeLeave ? 3 : 0;
        await qv.patch('/api/activity/' + this.id + '/registrations/' + reg.id, { status: reg.status, role: reg.role });
        await this.loadActivity();
    },
    setStatus: async function (id, status, role) {
        await qv.patch('/api/activity/' + this.id + '/registrations/' + id, { status: status, role: role });
        await this.loadActivity();
    },
    deleteReg: async function (id) {
        if (!confirm("你确定要删除这个报名的角色吗？")) {
            return;
        }

        await qv.delete('/api/activity/' + this.id + '/registrations/' + id);
        await this.loadActivity();
    },
    createGrid: function (name, mode) {
        if (!name) {
            alert("请填写框架名称");
            return;
        }

        var grid = {
            name: name,
            mode: mode,
            grid: mode == 0 ? [
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null]
            ] : [[null, null], [null, null], [null, null], [null, null], [null, null]],
            pending: []
        };

        grid.pending = this.generatePendingCharactors(grid.grid);

        if (!this.grids.data) {
            this.grids.data = [];
        }

        this.grids.data.push(grid);
        this.$forceUpdate();
        this.bindDragula();
    },
    generatePendingCharactors: function (grid) {
        var existed = [];
        for (var i = 0; i < grid.length; ++i) {
            for (var j = 0; j < grid[i].length; ++j) {
                if (grid[i][j] != null) {
                    existed.push(grid[i][j].name);
                }
            }
        }

        var pending = [];
        for (var i = 0; i < this.activity.registrations.length; ++i) {
            if (existed.some(x => x == this.activity.registrations[i].name)) {
                continue;
            }

            pending.push(this.activity.registrations[i]);
        }

        return pending;
    },
    bindDragula: async function () {
        if (!app.user.token) {
            return;
        }
        await sleep(1);
        for (var i = 0; i < this.grids.data.length; ++i) {
            var arr = [document.querySelector('#grid-pending-of-' + i)];
            for (a = 0; a < 5; ++a) {
                for (b = 0; b < 5; ++b) {
                    arr.push(document.querySelector(`#grid-${i}-${a}-${b}`));
                }
            }

            var self = this;
            dragula(arr, {
                accepts: function (el, target, source, sibling) {
                    if ($(target).hasClass('grid-out-ch-outer')) {
                        return true;
                    }
                    return $(target).find('[data-reg-id]').length == 0;
                },
            })
                .on('drag', function (el) {
                }).on('drop', function (el, target, source) {
                }).on('over', function (el, container) {
                }).on('out', function (el, container) {
                });
        }
    },
    updateGridData: function () {
        for (var i = 0; i < this.grids.data.length; ++i) {
            for (var r = 0; r < this.grids.data[i].grid.length; ++r) {
                for (var c = 0; c < this.grids.data[i].grid[r].length; ++c) {
                    var id = `#grid-${i}-${r}-${c}`;
                    var dom = $(`${id} [data-reg-id]`);
                    if (dom.length) {
                        this.grids.data[i].grid[r][c] = this.activity.registrations.filter(x => x.id == dom.attr('data-reg-id'))[0];
                    } else {
                        this.grids.data[i].grid[r][c] = null;
                    }
                }
            }
        }
    },
    updateGridStatus: function () {
        for (var i = 0; i < this.grids.data.length; ++i) {
            for (var r = 0; r < this.grids.data[i].grid.length; ++r) {
                for (var c = 0; c < this.grids.data[i].grid[r].length; ++c) {
                    try {
                        var regId = this.grids.data[i].grid[r][c].id;
                        var latest = this.activity.registrations.filter(x => x.id == regId);
                        if (!latest.length) {
                            this.grids.data[i].grid[r][c] = null;
                        } else {
                            this.grids.data[i].grid[r][c] = latest[0];
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    },
    saveGrids: function () {
        this.updateGridData();
        qv.patch(`/api/activity/${this.id}`, { extension1: JSON.stringify(this.grids) });
        alert("团队框架保存成功");
    },
    canDps: function () {
        return true;
    },
    canTank: function (cls) {
        return !!(35 & cls);
    },
    canHeal: function (cls) {
        return !!(298 & cls);
    },
    createTaskGroup: function (name) {
        this.tasks.groups.push({
            name: name,
            tasks: []
        });
        this.form.newTaskGroup.name = '';
        this.$forceUpdate();
    },
    createTask: function (group, event) {
        var text = $(event.target).prev().val();
        group.tasks.push({
            text: text,
            players: []
        });
        $(event.target).prev().val('');
        this.$forceUpdate();
    },
    findTask: function () {
        var splited = this.activeTask.split(',');
        var idx1 = parseInt(splited[0]);
        var idx2 = parseInt(splited[1]);
        return this.tasks.groups[idx1].tasks[idx2];
    },
    toggleTaskPlayer: function (regId) {
        var task = this.findTask();
        var idx = task.players.indexOf(regId);
        if (idx < 0) {
            task.players.push(regId);
        } else {
            task.players.splice(idx);
        }
        this.$forceUpdate();
    },
    getPlayer: function (regId) {
        var reg = this.activity.registrations.filter(x => x == regId);
        if (reg.length) {
            return reg[0];
        }

        return null;
    },
    saveTasks: function () {
        qv.patch(`/api/activity/${this.id}`, { extension2: JSON.stringify(this.tasks) });
        alert("任务保存成功");
    },
    importExportTasks: function () {
        this.taskString = JSON.stringify(this.tasks);
        this.activeTaskUI = 'string';
    },
    importTasks: function () {
        this.tasks = JSON.parse(this.taskString);
        this.activeTaskUI = 'normal';
    },
    mobileSelectRegisitration: function (reg) {
        if (!app.guildPermission.guildManager) {
            return;
        }

        this.mobile.selectedReg = reg;
    },
    mobileCloseDialog: function () {
        this.mobile.selectedReg = null;
    },
    mobileSetReg: function () {
        if (this.mobile.action == 'accept') {
            this.setStatus(this.mobile.selectedReg.id, 4, this.mobile.selectedReg.role);
        } else if (this.mobile.action == 'reject') {
            this.setStatus(this.mobile.selectedReg.id, 1, this.mobile.selectedReg.role);
        } else if (this.mobile.action == 'standby') {
            this.setStatus(this.mobile.selectedReg.id, 2, this.mobile.selectedReg.role);
        } else if (this.mobile.action == 'dps') {
            this.setStatus(this.mobile.selectedReg.id, this.mobile.selectedReg.status, 1);
        } else if (this.mobile.action == 'hps') {
            this.setStatus(this.mobile.selectedReg.id, this.mobile.selectedReg.status, 2);
        } else if (this.mobile.action == 'tank') {
            this.setStatus(this.mobile.selectedReg.id, this.mobile.selectedReg.status, 0);
        } else if (this.mobile.action == 'consumer') {
            this.setStatus(this.mobile.selectedReg.id, this.mobile.selectedReg.status, 3);
        } else if (this.mobile.action == 'delete') {
            this.deleteReg(this.mobile.selectedReg.id);
        }

        this.mobileCloseDialog();
        this.mobile.action = 'accept';
    },
    mobileReg: async function () {
        this.active = 'registration';
        var ch = this.mobile.ch;
        this.mobile.ch = null;
        await this.register(ch);
    },
    mobileDeleteCh: function () {
        this.deleteCharactor(this.mobile.ch, this.myCharactors.indexOf(this.mobile.ch));
        this.mobile.ch = null;
    },
    mobileLeave: function (takeLeave) {
        this.active = 'registration';
        this.leave(this.mobile.ch, takeLeave);
        this.mobile.ch = null;
    },
    mobileBack: function () {
        if (app.guildId) {
            app.open('/home');
        } else {
            app.open('/guild');
        }
    },
    generateTopConsumers: function (ledger) {
        if (!ledger.income) {
            return null;
        }

        var ret = [];
        var tmp = {};

        for (var i = 0; i < ledger.income.length; ++i) {
            if (!ledger.income[i].player || ledger.income[i].player == '-') {
                continue;
            }

            var player = ledger.income[i].player;
            if (!tmp[player]) {
                tmp[player] = 0;
            }

            tmp[player] += ledger.income[i].price;
        }

        var keys = Object.getOwnPropertyNames(tmp);
        for (var i = 0; i < keys.length; ++i) {
            ret.push({ player: keys[i], price: tmp[keys[i]] });
        }

        ret.sort((a, b) => b.price - a.price);
        return ret;
    },
    generateLedgerSumamry: function (ledger) {
        if (!ledger.income) {
            return null;
        }

        var ret = {
            total: 0,
            expense: 0,
            profit: 0,
            split: 0,
            per: 0
        };

        for (var i = 0; i < ledger.income.length; ++i) {
            ret.total += ledger.income[i].price;
        }

        for (var i = 0; i < ledger.other.length; ++i) {
            ret.total += ledger.other[i].price;
        }

        for (var i = 0; i < ledger.expense.length; ++i) {
            ret.expense += ledger.expense[i].price;
        }

        ret.profit = ret.total - ret.expense;

        if (ledger.statistics && ledger.statistics.split) {
            ret.split = ledger.statistics.split;
            ret.per = parseInt(ret.profit / ret.split);
        }

        return ret;
    },
    getPermission: async function () {
        this.permission = (await qv.get('/api/user/permission')).data;
    }
};

component.watch = {
    deep: true,
    'form.newCharactor.class': function () {
        if (!canTank(this.form.newCharactor.class) && this.form.newCharactor.role == 0) {
            this.form.newCharactor.role = 1;
        }

        if (!canHeal(this.form.newCharactor.class) && this.form.newCharactor.role == 2) {
            this.form.newCharactor.role = 1;
        }
    },
    'mobile.ch': function () {
        if (this.mobile.ch == null) return;

        if (!this.canTank(this.mobile.ch.class) && this.mobile.ch.role == 0) {
            this.mobile.ch.role = 1;
        }

        if (!this.canHeal(this.mobile.ch.class) && this.mobile.ch.role == 2) {
            this.mobile.ch.role = 1;
        }
    }
};