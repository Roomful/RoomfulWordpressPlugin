function RoomfulEditor() {
    this.placeholder = 'https://my.roomful.net/#/room/55mx098565068t';

    this.type = 'iframe';
    this.host = 'my.roomful.net';
    this.room = '55mx098565068t';
    this.width = 960;
    this.height = 620;
    this.ytVideo = '';
    this.embedCode = '';
    this.shortCode = '';
    this.anchorText = 'Go to Roomful';
    this.autoPlay = false;
    this.needAuth = false;
    this.autoChat = false;

    this.addCode = function (type) {
        if (type === undefined) type = 'embedLink';

        this.generateFrameCode();

        try {
            if ((type === 'embedLink' && this.embedCode !== '') || (type === 'shortCode' && this.shortCode !== '')) {
                var code = type === 'embedLink' ? this.embedCode : this.shortCode;

                if (code.indexOf('[') !== -1) code = '<p>' + code + '</p>';

                if (window.tinyMCE !== null && window.tinyMCE.activeEditor !== null && !window.tinyMCE.activeEditor.isHidden()) {
                    if (typeof window.tinyMCE.execInstanceCommand !== 'undefined') {
                        window.tinyMCE.execInstanceCommand(window.tinyMCE.activeEditor.id, 'mceInsertContent', 0, code);
                    }
                    else {
                        send_to_editor(code);
                    }
                }
                else {
                    code = code.replace('<p>', '\n').replace('</p>', '\n');
                    if (typeof QTags.insertContent === 'function') {
                        QTags.insertContent(code);
                    }
                    else {
                        send_to_editor(code);
                    }
                }
                tb_remove();
            }
        }
        catch (error) {

        }
    }
}

RoomfulEditor.prototype.generateFrameCode = function () {
    var query = '';
    if (this.host.indexOf('.roomful.net') === -1) {
        this.embedCode = this.shortCode = '';
        return;
    }

    var mHost = this.host.split('.')[0];

    if (this.autoPlay) query += ((query === '') ? '?' : '&') + 'autoplay=1';
    if (this.needAuth) query += ((query === '') ? '?' : '&') + 'auth=1';
    if (this.ytVideo !== '') query += ((query === '') ? '?' : '&') + 'v=' + this.ytVideo;
    if (this.host !== 'my.roomful.net') query += ((query === '') ? '?' : '&') + 'light=1';

    query += ((query === '') ? '?' : '&') + 'w=' + this.width;
    query += ((query === '') ? '?' : '&') + 'h=' + this.height;

    this.embedCode = 'https://' + this.host + '/' + (query !== '' ? query + '/' : '')
        + '#/room/' + this.room + (this.autoChat ? '/chat' : '');

    console.warn(this.type);

    this.shortCode = '[roomful'
        + (this.type === 'image' ? ' type="image"' : '')
        + (mHost !== 'my' ? ' host="' + mHost + '"' : '')
        + (' room="' + this.room + '"')
        + (this.autoPlay ? ' autoPlay="true"' : '')
        + (mHost !== 'my' ? ' isLight="false"' : '')
        + (this.needAuth ? ' needAuth="true"' : '')
        + (this.autoChat ? ' autoChat="true"' : '')
        + (this.ytVideo ? ' ytVideo="' + this.ytVideo + '"' : '')
        + (' width="' + this.width + '"')
        + (' height="' + this.height + '"')
        + ']' + (this.type === 'text' ? this.anchorText + '[/roomful]' : '');
};

RoomfulEditor.prototype.update = function () {
    this.code = this.generateFrameCode();

    jQuery('#roomful-embed-code').value = this.embedCode;
    jQuery('#roomful-short-code').value = this.shortCode;
};

RoomfulEditor.OnOpenModalWindow = function () {
    RoomfulEditor.resizeModalAsync();

    jQuery('#roomful-width').value = this.width;
    jQuery('#roomful-height').value = this.height;

    jQuery('#roomful-anchor')[0].value = this.anchorText;

    jQuery('#roomful-autoplay-switch').checked = this.autoPlay;
    jQuery('#roomful-auth-switch').checked = this.needAuth;
    jQuery('#roomful-chat-switch').checked = this.autoChat;

    $('#roomful-editor-popup').removeClass('image').removeClass('iframe').removeClass('text').addClass(this.type);

    this.update();
};

RoomfulEditor.resizeModal = function () {
    var $e = jQuery(document).find('#TB_window');

    if ($e.find('#roomful-editor-popup')) {
        $e.width(780).height(470).css('margin-left', -780 / 2).css('margin-top', (window.innerHeight - 470) / 2);
        return false;
    }
};

RoomfulEditor.resizeModalAsync = function () {
    setTimeout(this.resizeModal, 20);
};

jQuery(document).on('ready', function () {
    if (window.location.toString().indexOf('https://') === 0) {
        window._EPYTA_.wpajaxurl = window._EPYTA_.wpajaxurl.replace('http://', 'https://');
    }

    var roomful = new RoomfulEditor();

    jQuery(window).on('resize', RoomfulEditor.resizeModalAsync);
    jQuery(document.body).on('click', '.roomful-wordpress-button', RoomfulEditor.OnOpenModalWindow.bind(roomful));

    jQuery(document.body).on('click', '#roomful-add-short-code', function () {
        roomful.addCode('shortCode');
    });
    jQuery(document.body).on('click', '#roomful-add-embed-link', function () {
        roomful.addCode('embedLink');
    });

    jQuery(document.body).on('click', '#roomful-width', function (event) {
        event.preventDefault();
        jQuery('#roomful-width').select();
    }.bind(roomful));

    jQuery(document.body).on('click', '#roomful-height', function (event) {
        event.preventDefault();
        jQuery('#roomful-height').select();
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-width', function (event) {
        event.preventDefault();
        this.width = jQuery('#roomful-width').value;
        this.update();
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-height', function (event) {
        event.preventDefault();
        this.height = jQuery('#roomful-height').value;
        this.update();
    }.bind(roomful));

    jQuery(document.body).on('focus', '#roomful-height', function (event) {
        event.preventDefault();
        jQuery('#roomful-height').attr('placeholder', '');
    }.bind(roomful));

    jQuery(document.body).on('blur', '#roomful-height', function (event) {
        event.preventDefault();
        jQuery('#roomful-height').attr('placeholder', '620');
    }.bind(roomful));

    jQuery(document.body).on('focus', '#roomful-width', function (event) {
        event.preventDefault();
        jQuery('#roomful-width').attr('placeholder', '');
    }.bind(roomful));

    jQuery(document.body).on('blur', '#roomful-width', function (event) {
        event.preventDefault();
        jQuery('#roomful-width').attr('placeholder', '960');
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-autoplay-switch', function (event) {
        event.preventDefault();
        this.autoPlay = jQuery('#roomful-autoplay-switch').checked;
        this.update();
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-auth-switch', function (event) {
        event.preventDefault();

        this.needAuth = jQuery('#roomful-auth-switch').checked;

        if (this.needAuth === false && this.autoChat === true) {
            jQuery('#roomful-auth-switch').checked = true;
        } else {
            this.update();
        }

    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-chat-switch', function (event) {
        event.preventDefault();
        this.autoChat = jQuery('#roomful-chat-switch').checked;

        if (this.autoChat === true && this.needAuth === false) {
            this.needAuth = true;
            jQuery('#roomful-auth-switch').checked = true;
        }

        this.update();

    }.bind(roomful));

    jQuery(document.body).on('focus', '#roomful-url', function (event) {
        event.preventDefault();
        jQuery('#roomful-url').attr('placeholder', '');
    }.bind(roomful));

    jQuery(document.body).on('blur', '#roomful-url', function (event) {
        event.preventDefault();
        jQuery('#roomful-url').attr('placeholder', this.placeholder);
    }.bind(roomful));

    // Important inputs
    jQuery(document.body).on('change', '#roomful-url', function (event) {
        event.preventDefault();

        try {
            var needUpdate = false;

            var value = jQuery('#roomful-url').value;

            if (value.trim() === '') {
                this.room = '55mx098565068t';
                this.host = 'my.roomful.net';
                this.update();

                return true;
            }

            var url = (new URL(value));
            if (url && url.hash) {
                var hash = url.hash.trim();
                var m = hash.match(/^#\/room\/(\w{14})?(?:[/?]|$)/);

                if (m && m[1]) {
                    this.room = m[1];
                    needUpdate = true;
                } else {
                    this.room = '55mx098565068t';
                    needUpdate = true;
                }
            }

            if (url && url.host !== this.host) {
                this.host = url.host;
                needUpdate = true;
            }

            if (needUpdate) this.update();
        } catch (e) {
        }
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-youtube', function (event) {
        event.preventDefault();

        var url = jQuery('#roomful-youtube').value;
        try {
            var needUpdate = false;
            var m = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);

            if (m && m[1]) {
                this.ytVideo = m[1];
                needUpdate = true;
            } else {
                this.ytVideo = '';
                needUpdate = true;
            }

            if (needUpdate) this.update();
        } catch (e) {
        }
    }.bind(roomful));

    jQuery(document.body).on('change', '#roomful-anchor', function (event) {
        event.preventDefault();

        var text = jQuery('#roomful-anchor')[0].value;
        console.log(text);
        try {
            var needUpdate = false;

            if (text.trim().length > 0) {
                this.anchorText = text.trim();
                needUpdate = true;
            } else {
                this.anchorText = 'Go to Roomful';
                needUpdate = true;
            }

            if (needUpdate) this.update();
        } catch (e) {
            console.warn(e);
        }
    }.bind(roomful));

    jQuery(document.body).on('click', '#roomful-editor-popup .button-switch', function (event) {
        event.preventDefault();

        if (event.currentTarget.className.split(' ').indexOf('iframe') >= 0) {
            this.type = 'iframe';
            $('#roomful-editor-popup .row.anchor-input').hide();
            $('#roomful-editor-popup .row.size-input, #roomful-editor-popup .embed-code').show();
        } else if (event.currentTarget.className.split(' ').indexOf('image') >= 0) {
            this.type = 'image';
            $('#roomful-editor-popup .row.anchor-input, #roomful-editor-popup .embed-code').hide();
            $('#roomful-editor-popup .row.size-input').show();
        } else {
            this.type = 'text';
            $('#roomful-editor-popup .row.size-input').hide();
            $('#roomful-editor-popup .row.size-input, #roomful-editor-popup .embed-code').hide();
            $('#roomful-editor-popup .row.anchor-input').show();
        }

        $('#roomful-editor-popup').removeClass('image').removeClass('iframe').removeClass('text').addClass(this.type);
        $('#roomful-editor-popup .button-switch').removeClass('active');
        $('#roomful-editor-popup .button-switch.' + this.type).addClass('active');
    }.bind(roomful));
});


