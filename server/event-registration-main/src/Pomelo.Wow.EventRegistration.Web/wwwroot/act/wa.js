component.data = function () {
    return {
        active: 'group-member',
        activity: null,
        grids: null,
        tasks: null
    };
};

component.mounted = function () {
    this.$container = new PomeloComponentContainer('#act-wa-inner-container', app, this, function (view) {
    }, function () { });
    this.open(this.active);
};

component.methods = {
    open: function (view) {
        this.active = view;
        this.$container.open('/act/wa/' + view, { activity: this.activity, tasks: this.tasks, grids: this.grids });
    }
};