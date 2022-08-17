const app = getApp();

Component({
    data: {
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        result: null,
        search: null,
        page: 1
    },
    
    methods: {
        loadGuilds: function(search, page) {
            let qv = require("../../utils/qv");
            let self = this;
            return qv.get(`${app.globalData.host}/api/guild?name=${encodeURI(search || '')}&page=${page}`)
                .then(result => {
                    self.setData({
                        result: result.data
                    });
                });
        },
        onSearchTextChanged: function() {
            this.loadGuilds(this.data.search, 1);
        },

        

        openGuild: function(event) {
            let id = event.currentTarget.dataset.id;
            wx.$root.navigateToGuild(id);
        }
    },

    watch: {
        search: function(val) {
          this.loadGuilds(val, 1);
        }
    },

    lifetimes: {
        attached: function() {
            this.loadGuilds('', 1);
        }
    }
})
