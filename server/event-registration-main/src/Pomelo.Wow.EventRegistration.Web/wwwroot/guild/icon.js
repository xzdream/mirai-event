component.data = function () {
    return {};
};

component.methods = {
    selectLogo: function () {
        $('#uploader1').click();
    },
    selectCard: function () {
        $('#uploader2').click();
    },
    uploadLogo: function () {
        var val = $('#uploader1').val();
        if (!val) {
            return;
        }
        var file = $('#uploader1')[0].files[0];
        var formFile = new FormData();
        formFile.append("file", file);
        var self = this;
        $.ajax({
            url: "/api/blob/multi-part",
            data: formFile,
            type: "Post",
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                var url = '/api/blob/' + result.data.id;
                qv.patch(`/api/guild/${app.guildId}`, { guildLogoUrl: url });
                app.guild.guildLogoUrl = url;
            },
            error: function (XMLHttpRequest, textStatus, err) {
                alert('图片上传失败');
            }
        })
    },
    uploadCard: function () {
        var val = $('#uploader2').val();
        if (!val) {
            return;
        }
        var file = $('#uploader2')[0].files[0];
        var formFile = new FormData();
        formFile.append("file", file);
        var self = this;
        $.ajax({
            url: "/api/blob/multi-part",
            data: formFile,
            type: "Post",
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                var url = '/api/blob/' + result.data.id;
                qv.patch(`/api/guild/${app.guildId}`, { guildListImageUrl: url });
                app.guild.guildListImageUrl = url;
            },
            error: function (XMLHttpRequest, textStatus, err) {
                alert('图片上传失败');
            }
        })
    },

};