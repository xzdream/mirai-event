component.data = function () {
    return {
        code: null
    };
};

component.created = function () {
    app.active = 'login';
};

component.mounted = function () {
    this.getQrCode();
};

component.methods = {
    getQrCode: async function () {
        this.code = (await qv.post(app.authHost + '/api/scan/generate', {})).data;
        var qrcode = new QRCode(document.getElementById("qrcode"));
        qrcode.makeCode(this.code);
        var self = this;
        setInterval(async function () {
            try {
                var result = await qv.post(app.authHost + '/api/scan/validate', { code: self.code });
                window.localStorage.setItem('token', result.data.token);
                window.localStorage.setItem('role', result.data.role);
                window.localStorage.setItem('username', result.data.username);
                app.user.token = result.data.token;
                app.user.role = result.data.role;
                app.user.username = result.data.username;
                window.location = '/';
            } catch (e) { }
        }, 3000);
    }
};