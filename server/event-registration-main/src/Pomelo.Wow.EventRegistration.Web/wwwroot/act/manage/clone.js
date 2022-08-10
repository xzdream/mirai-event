component.data = function () {
    return {
        activity: null,
        raids: [],
        selectedRaids: [],
        form: {
            name: null,
            description: null,
            begin: null,
            deadline: null,
            raids: '',
            rule: 0
        }
    }
};
component.created = async function () {
    await this.loadRaids();
    this.form.name = '克隆 - ' + this.activity.name;
    this.form.description = this.activity.description;
};

component.mounted = function () {
    this.selectedRaids = this.activity.raids.split(',').filter(x => x);
    $('#txt-clone-begin').val(app.moment(new Date()).format('YYYY/MM/DD HH:00'));
    $('#txt-clone-begin').datetimepicker();

    $('#txt-clone-deadline').val(app.moment(new Date()).format('YYYY/MM/DD HH:00'));
    $('#txt-clone-deadline').datetimepicker();
};

component.methods = {
    loadRaids: async function () {
        this.raids = (await qv.get('/api/raid')).data;
    },
    clone: async function () {
        this.raids = this.selectedRaids.toString();
        this.form.begin = new Date($('#txt-clone-begin').val()).toISOString();
        this.form.deadline = new Date($('#txt-clone-deadline').val()).toISOString();
        try {
            var result = await qv.post('/api/activity/clone', {
                originalActivityId: this.activity.id,
                name: this.form.name,
                description: this.form.description,
                begin: this.form.begin,
                deadline: this.form.deadline,
                raids: this.form.raids
            });
            app.open('/act?id=' + result.data.id);
        } catch (e) {
            if (e.responseJSON) {
                alert(e.responseJSON.message);
                return;
            }
            else {
                alert('克隆活动失败');
                return;
            }
        }
    }
};
