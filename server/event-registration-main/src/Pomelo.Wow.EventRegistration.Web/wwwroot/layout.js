component.data = function () {
    return {
        active: 'activity'
    };
};

component.created = function () {
};

component.mounted = async function () {
    var container = new PomeloComponentContainer('#main', app, this, function (view) {
    }, function () { });
    this.$container = container;

    await sleep(1);

    if (window.location.pathname != '/') {
        app.open(window.location.pathname + window.location.search);
    } else {
        if (app.guildId) {
            app.open('/home');
        } else {
            app.open('/guild');
        }
    }
};