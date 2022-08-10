component.data = function () {
    return {
        activity: null,
        ledgerString: null,
        ledger: {
            income: [],
            expense: [],
            other: []
        },
        busy: false
    }
};
component.created = async function () {
};

component.mounted = function () {
};

component.methods = {
    importLedger: async function () {
        if (this.busy) {
            return;
        }

        this.busy = true;
        this.ledger = await qv.post('/api/util/ledger', { string: this.ledgerString });
        await this.saveLedger();
        this.busy = false;
    },
    saveLedger: async function () {
        await qv.patch(`/api/activity/${this.activity.id}`, { extension3: JSON.stringify(this.ledger) });
        this.$parent.$parent.ledger = this.ledger;
        alert("账本导入成功");
    }
};

component.watch = {
};
