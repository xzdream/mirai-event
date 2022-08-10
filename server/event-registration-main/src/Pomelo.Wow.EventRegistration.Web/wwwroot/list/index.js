component.data = function () {
    return {
        status: 0,
        result: null
    };
};

component.created = function () {
    app.active = 'activity';
    this.load();
};

component.methods = {
    load: async function () {
        this.result = await qv.get(`/api/activity?page=1&status=${this.status}`);
    },
    next: async function () {
        ++this.result.currentPage;
        var result = await qv.get(`/api/activity?page=${this.result.currentPage + 1}&status=${this.status}`);
        for (var i = 0; i < result.data.length; ++i) {
            this.result.data.push(result.data[i]);
        }
    },
};

component.watch = {
    status: function () {
        this.load();
    }
};