component.data = function () {
    return {
        result: null,
        form: {
            guild: ''
        }
    };
};

component.created = function () {
    app.active = 'guild';
    this.load();
};

component.watch = {
    deep: true,
    'form.guild': function () {
        this.result = null;
        this.load();
    }
};

component.methods = {
    load: async function () {
        var page = 1;
        if (this.result) {
            page = this.result.currentPage + 2;
        }
        this.result = await qv.get(`/api/guild?name=${encodeURI(this.form.guild)}&page=${page}`);
    }
};