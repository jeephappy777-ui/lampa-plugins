(function () {
    'use strict';

    function eporner(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true, check_bottom: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        
        // Используем их проверенный прокси
        var cors = 'https://cors.lampa.mx/';

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            
            network.silent(cors + url, function (data) {
                if (data && data.videos && data.videos.length > 0) {
                    _this.build(data);
                } else {
                    _this.empty();
                }
            }, function () {
                _this.empty();
            });

            return this.render();
        };

        this.build = function (data) {
            var _this = this;
            
            data.videos.forEach(function (video) {
                var item = Lampa.Template.get('card', {
                    title: video.title,
                    release_year: video.length_min + ' min'
                });

                item.addClass('card--collection');
                
                // Картинки проксируем точно так же, как в рабочих плагинах
                item.find('.card__img').attr('src', 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb.src));

                item.on('hover:enter', function () {
                    Lampa.Player.play({
                        url: video.embed,
                        title: video.title
                    });
                });

                body.append(item);
                items.push(item);
            });

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.empty = function () {
            this.activity.loader(false);
            body.append('<div class="empty">Контент не найден. Проверьте VPN или прокси.</div>');
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
                    Lampa.Controller.follow('container');
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
            items.forEach(function (item) { item.removeAllListeners(); });
            body.remove();
        };
    }

    function eporner_categories() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');

        this.create = function () {
            // Весь список категорий, которые ты просил
            var genres = [
                {t: 'Популярные', q: 'top-weekly'}, {t: 'Новинки', q: 'latest'}, {t: 'Топ дня', q: 'top-daily'},
                {t: 'Teen', q: 'teen'}, {t: 'Milf', q: 'milf'}, {t: 'Amateur', q: 'amateur'},
                {t: 'Anal', q: 'anal'}, {t: 'Big Tits', q: 'big-tits'}, {t: 'Ebony', q: 'ebony'},
                {t: 'Japanese', q: 'japanese'}, {t: 'Hardcore', q: 'hardcore'}, {t: 'Reality', q: 'reality'},
                {t: 'Solo', q: 'solo'}, {t: 'Vintage', q: 'vintage'}, {t: 'POV', q: 'pov'},
                {t: 'BDSM', q: 'bdsm'}, {t: 'Massage', q: 'massage'}, {t: 'Public', q: 'public'}
            ];

            genres.forEach(function (item) {
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
                        component: 'eporner'
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
                    Lampa.Controller.follow('container');
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
        Lampa.Component.add('eporner', eporner);
        Lampa.Component.add('eporner_categories', eporner_categories);

        function add() {
            if ($('div[data-action="eporner"]').length > 0) return;
            var item = $('<div class="menu__item selector" data-action="eporner">' +
                '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
                '<div class="menu__text">EPORNER Pro</div>' +
            '</div>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({
                    title: 'EPORNER Pro',
                    component: 'eporner_categories'
                });
            });

            $('.menu .menu__list').first().append(item);
        }

        if (window.appready) add();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') add(); });
    }

    startPlugin();
})();
