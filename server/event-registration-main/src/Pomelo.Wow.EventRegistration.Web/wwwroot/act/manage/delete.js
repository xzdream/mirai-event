component.data = function () {
    return {
        activity: null,
        confirm: ''
    }
};

component.methods = {
    deleteAct: async function () {
        if (this.confirm != '我确定') {
            alert('请输入“我确定”以删除这个活动！');
            return;
        }

        await qv.delete('/api/activity/' + this.activity.id);
        alert('已将该活动删除');
        app.open('/home');
    }
};