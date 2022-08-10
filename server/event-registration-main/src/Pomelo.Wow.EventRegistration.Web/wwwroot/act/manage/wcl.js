component.data = function () {
    return {
        activity: null
    }
};

component.methods = {
    updateWCL: function () {
        qv.post('/api/charactor/batch', { realm: this.activity.realm, names: this.activity.registrations.map(x => x.name) });
        alert('已提交强制更新WCL数据，请等待1-2分钟后刷新即可看到最新WCL数据');
    }
};