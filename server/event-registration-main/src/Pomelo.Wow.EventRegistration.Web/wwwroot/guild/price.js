component.data = function () {
    return {
        active: 'price',
        prices: [],
        form: {
            createPrice: {
                name: '',
                data: '[]'
            },
            createGroup: {
                name: ''
            },
            createItem: {
                itemId: null,
                initial: null,
                cap: null
            }
        },
        working: false,
        price: {},
        status: 0
    };
};

component.methods = {
    loadPrices: async function () {
        this.prices = (await qv.get(`/api/guild/${app.guildId}/price`)).data;
    },
    createPrice: async function () {
        try {
            await qv.post(`/api/guild/${app.guildId}/price`, this.form.createPrice);
            this.loadPrices();
            alert('价目表创建成功');
        } catch (e) {
            alert('价目表创建失败');
        }
    },
    openPrice: async function (id) {
        var price = (await qv.get(`/api/guild/${app.guildId}/price/${id}`)).data;
        price.data = JSON.parse(price.data);
        this.price = price;
        this.$forceUpdate();
        this.active = 'price-detail'
    },
    createGroup: function () {
        this.price.data.push({
            name: this.form.createGroup.name,
            items: []
        });

        this.form.createGroup.name = '';
    },
    createItem: async function (group) {
        this.working = true;
        try {
            var result = await qv.get('/api/item/' + this.form.createItem.itemId);
            var item = result.data;
            item.initial = this.form.createItem.initial;
            item.cap = this.form.createItem.cap;
            group.items.push(item);
            this.working = false;

            this.form.createItem = {
                itemId: null,
                initial: null,
                cap: null
            };
        } catch (e) {
            console.error(e);
            alert('物品添加失败');
            this.working = false;
        }
    },
    openItem: function (id) {
        window.open('https://cn.tbc.wowhead.com/item=' + id);
    },
    removeItem: function (group, i) {
        group.items.splice(i, 1);
    },
    patchPrice: async function () {
        try {
            await qv.patch(`/api/guild/${app.guildId}/price/${this.price.id}`, {
                name: this.price.name,
                data: JSON.stringify(this.price.data)
            });
            alert('价目表保存成功');
        } catch (e) {
            console.error(e);
            alert('价目表保存失败');
        }
    }
};

component.created = function () {
    this.loadPrices();
};