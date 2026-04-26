(function () {
    'use strict';

    function eporner(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        
        // Используем более надежный прокси для обхода "Сеть недоступна"
        var proxy = 'https://api.allorigins.win/raw?url=';

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            
            network.silent(proxy + encodeURIComponent(url), function (data) {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos) _this.build(json.videos);
                    else _this.empty();
                } catch(e) { _this.empty(); }
            }, function () {
                _this.empty();
            });
            return this.render();
        };

        this.build = function (videos) {
            var _this = this;
            videos.forEach(function (video) {
                var item = Lampa.Template.get('card', { title: video.title, release_year: video.length_min + ' min' });
                item.addClass('card--collection');
                item.find('.card__img').attr('src', 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb.src));
                item.on('hover:enter', function () {
                    Lampa.Player.play({ url: video.embed, title: video.title });
                });
                body.append(item);
            });
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.empty = function () {
            this.activity.loader(false);
            body.append('<div class="empty">Контент не найден. Проверьте VPN.</div>');
            this.activity.toggle();
        };

        this.render = function () { scroll.append(body); return scroll.render(); };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(body); },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () { network.clear(); scroll.destroy(); body.remove(); };
    }

    function eporner_cats() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');
        this.create = function () {
            var genres = [{t:'Популярные', q:'top-weekly'}, {t:'Новинки', q:'latest'}, {t:'Teen', q:'teen'}];
            genres.forEach(function (item) {
                var card = Lampa.Template.get('card', { title: item.t, release_year: '' });
                card.addClass('card--category');
                card.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: item.t,
                        url: 'https://www.eporner.com/api/v2/video/search/?per_page=40&query=' + item.q,
                        component: 'eporner_mod'
                    });
                });
                body.append(card);
            });
            return this.render();
        };
        this.start = function () {
            Lampa.Controller.add('content', { toggle: function () { Lampa.Controller.collectionSet(body); }, back: function () { Lampa.Activity.backward(); } });
            Lampa.Controller.toggle('content');
        };
        this.render = function () { scroll.append(body); return scroll.render(); };
        this.destroy = function () { scroll.destroy(); body.remove(); };
    }

    // Регистрация
    Lampa.Component.add('eporner_mod', eporner);
    Lampa.Component.add('eporner_cats', eporner_cats);

    function addMenu() {
        var item = $('<div class="menu__item selector" data-action="eporner">' +
            '<div class="menu__text">EPORNER Pro</div>' +
        '</div>');
        item.on('hover:enter', function () {
            Lampa.Activity.push({ title: 'EPORNER Pro', component: 'eporner_cats' });
        });
        $('.menu .menu__list').first().append(item);
    }

    if (window.appready) addMenu();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addMenu(); });
})();
