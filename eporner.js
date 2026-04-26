(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var body    = $('<div class="category-full"></div>');
        
        // Используем системный прокси Lampa для обхода блокировок
        var cors = 'https://cors.lampa.mx/';

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            
            network.silent(cors + url, function (data) {
                if (data && data.videos && data.videos.length > 0) {
                    _this.build(data.videos);
                } else {
                    _this.empty();
                }
            }, function () {
                _this.empty();
            });

            return this.render();
        };

        this.build = function (videos) {
            var _this = this;
            videos.forEach(function (video) {
                var item = Lampa.Template.get('card', {
                    title: video.title,
                    release_year: video.length_min + ' min'
                });

                item.addClass('card--collection');
                
                // Проксируем картинки через weserv (самый надежный вариант)
                var img = item.find('.card__img')[0];
                if (img) img.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb.src);

                item.on('hover:enter', function () {
                    Lampa.Player.play({
                        url: video.embed,
                        title: video.title
                    });
                });

                body.append(item);
                items.push(item);
            });

            _this.activity.loader(false);
            _this.activity.toggle();
        };

        this.empty = function () {
            this.activity.loader(false);
            body.append('<div class="empty">Контент не найден. Попробуйте сменить категорию или использовать VPN.</div>');
            this.activity.toggle();
        };

        this.render = function () {
            scroll.append(body);
            return scroll.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(body);
                },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () {
            network.clear();
            scroll.destroy();
            body.remove();
        };
    }

    function epornerEntry() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');

        this.create = function () {
            var categories = [
                {t: 'Популярные', q: 'top-weekly'}, {t: 'Новинки', q: 'latest'}, {t: 'Топ дня', q: 'top-daily'},
                {t: 'Teen', q: 'teen'}, {t: 'Milf', q: 'milf'}, {t: 'Amateur', q: 'amateur'},
                {t: 'Anal', q: 'anal'}, {t: 'Big Tits', q: 'big-tits'}, {t: 'Ebony', q: 'ebony'},
                {t: 'Japanese', q: 'japanese'}, {t: 'Hardcore', q: 'hardcore'}, {t: 'Reality', q: 'reality'},
                {t: 'Solo', q: 'solo'}, {t: 'Vintage', q: 'vintage'}, {t: 'Interracial', q: 'interracial'},
                {t: 'POV', q: 'pov'}, {t: 'Blonde', q: 'blonde'}, {t: 'Asian', q: 'asian'},
                {t: 'Latina', q: 'latina'}, {t: 'Redhead', q: 'redhead'}, {t: 'BDSM', q: 'bdsm'},
                {t: 'Massage', q: 'massage'}, {t: 'Public', q: 'public'}, {t: 'Pornstar', q: 'pornstar'}
            ];

            categories.forEach(function (item) {
                var card = Lampa.Template.get('card', { title: item.t, release_year: '' });
                card.addClass('card--category');
                card.find('.card__img').attr('src', 'https://www.eporner.com/static/images/logo_top.png');
                
                var url = (item.q.indexOf('top') >= 0 || item.q === 'latest') 
                    ? 'https://www.eporner.com/api/v2/video/search/?order=' + item.q 
                    : 'https://www.eporner.com/api/v2/video/search/?query=' + item.q;

                card.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: item.t,
                        url: url + '&per_page=40',
                        component: 'eporner_plugin'
                    });
                });
                body.append(card);
            });

            return this.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(body);
                },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function () {
            scroll.append(body);
            return scroll.render();
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () { scroll.destroy(); body.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('eporner_plugin', epornerPlugin);
        Lampa.Component.add('eporner_entry', epornerEntry);

        var addMenu = function() {
            if ($('div[data-action="eporner"]').length > 0) return;
            var item = $('<div class="menu__item selector" data-action="eporner">' +
                '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
                '<div class="menu__text">EPORNER Pro</div>' +
            '</div>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({
                    title: 'EPORNER Pro',
                    component: 'eporner_entry'
                });
            });

            $('.menu .menu__list').first().append(item);
        };

        if (window.appready) addMenu();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addMenu(); });
    }

    startPlugin();
})();
