component.data = function () {
    return {
        activity: null,
        raidInfoString: null,
        characters: [],
        invalid: false,
        maintankOption: 0,
        mainassistOption: 0,
        grids: null,
        importing: false
    }
};
component.created = async function () {
};

component.mounted = function () {
};

component.methods = {
    createGrid: async function () {
        var container = this.$parent.$parent;
        var mode = this.characters.some(x => x.partyIndex > 2) ? 0 : 1;

        var grid = {
            name: '导入框架 - ' + new Date().getTime(),
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

        grid.pending = container.generatePendingCharactors(grid.grid);

        if (!container.grids.data) {
            container.grids.data = [];
        }

        for (var partyIndex = 0; partyIndex < 5; ++partyIndex) {
            var characters = this.characters.filter(x => x.partyIndex == (partyIndex + 1));
            for (var i = 0; i < Math.min(characters.length, 5); ++i) {
                try {
                    grid.grid[i][partyIndex] = this.activity.registrations.filter(x => x.name == characters[i].name)[0];
                } catch (e) {
                    console.error(e);
                }
            }
        }

        container.grids.data.push(grid);
        container.$forceUpdate();
        container.bindDragula();
        await qv.patch(`/api/activity/${this.activity.id}`, { extension1: JSON.stringify(container.grids) });
    },
    importRaidInfo: async function () {
        if (this.importing) {
            return;
        }
        this.importing = true;

        var self = this;
        var promises = [];

        for (var i = 0; i < this.characters.length; ++i) {
            var ch = this.characters[i];
            var role = 1;
            if (ch.role == 'MAINTANK') {
                if (this.maintankOption == 0) {
                    role = 0;
                } else {
                    role = 3;
                }
            }

            if (ch.role == "MAINASSIST") {
                if (this.mainassistOption == 0) {
                    role = 2;
                } else {
                    role = 3;
                }
            }

            if (!this.activity.registrations.some(x => x.name == ch.name)) {
                var p = this.register({
                    name: ch.name,
                    role: role,
                    class: ch.class,
                    hint: '临时补位'
                }).then(data => {
                    console.warn(data);
                    return self.setStatus(data.data.id, 4, role, '临时补位');
                });
                promises.push(p);
            } else {
                var reg = this.activity.registrations.filter(x => x.name == ch.name)[0];
                var p = this.setStatus(reg.id, 4, role, '替补出席');
                promises.push(p);
            }
        }

        var absences = this.activity.registrations.filter(x => x.status == 4 && !this.characters.some(y => y.name == x.name));
        for (var i = 0; i < absences.length; ++i) {
            var p = this.setStatus(this.activity.registrations[i].id, 5, 0, '缺席');
            promises.push(p);
        }


        await Promise.all(promises);
        await self.$parent.$parent.loadActivity();
        self.activity = self.$parent.$parent.activity;
        await self.createGrid();
        self.importing = false;
        alert('导入完成');

        try {
        } catch (e) {
            console.error(e);
            self.importing = false;
        }
    },
    parseCharacter: function (row) {
        var splited = row.split('=').map(x => x.trim());
        if (splited.length != 2) {
            return null;
        }

        var args = splited[1].split(',').map(x => x.trim());
        if (args.length != 3) {
            return null;
        }

        return {
            name: splited[0],
            role: args[2],
            partyIndex: parseInt(args[0]),
            class: app.getClassIndex(args[1])
        };
    },
    register: async function (ch) {
        return await qv.post(`/api/activity/${this.activity.id}/registrations`, {
            name: ch.name,
            role: ch.role,
            hint: ch.hint,
            class: ch.class
        });
    },
    setStatus: async function (id, status, role, hint) {
        await qv.patch('/api/activity/' + this.activity.id + '/registrations/' + id, { status: status, role: role, hint: hint });
    },
};

component.watch = {
    deep: true,
    raidInfoString: function () {
        try {
            var rows = this.raidInfoString.split('\n').map(x => x.trim()).filter(x => x);
            this.characters.splice(0, this.characters.length);
            for (var i = 0; i < rows.length; ++i) {
                this.characters.push(this.parseCharacter(rows[i]));
            }
            this.invalid = false;
        } catch (e) {
            this.invalid = true
            this.characters.splice(0, this.characters.length);
        }
    },
};
