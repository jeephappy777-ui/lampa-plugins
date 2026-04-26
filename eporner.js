(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var proxy   = 'https://api.allorigins.win/raw?url=';

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            
            network.silent(proxy + encodeURIComponent(url), function (data) {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos) _this.build(json.videos);
                    else _this.empty('Видео не найдены');
                } catch(e) { _this.empty('Ошибка сети'); }
            }, function () { _this.empty('Прокси не отвечает'); });

            return this.render();
        };

        this.build = function (videos) {
            var _this = this;
            videos.forEach(function (video) {
                var item = Lampa.Template.get('card', { title: video.title, release_year: video.length_min + ' min' });
                item.addClass('card--collection');
                item.find('.card__img').attr('src', 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb.src));
                item.on('hover:enter', function () { Lampa.Player.play({ url: video.embed, title: video.title }); });
                body.append(item);
            });
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.empty = function (msg) {
            this.activity.loader(false);
            body.append('<div class="empty">' + msg + '</div>');
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

    function epornerEntry() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');
        this.create = function () {
            var cats = [{t:'Популярные', q:'top-weekly'}, {t:'Новинки', q:'latest'}, {t:'Teen', q:'teen'}];
            cats.forEach(function (item) {
                var card = Lampa.Template.get('card', { title: item.t, release_year: '' });
                card.addClass('card--category');
                card.on('hover:enter', function () {
                    Lampa.Activity.push({ title: item.t, url: 'https://www.eporner.com/api/v2/video/search/?query=' + item.q, component: 'eporner_fixed' });
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

    Lampa.Component.add('eporner_fixed', epornerPlugin);
    Lampa.Component.add('eporner_entry', epornerEntry);

    function addMenu() {
        var item = $('<div class="menu__item selector" data-action="eporner"><div class="menu__text">EPORNER Pro</div></div>');
        item.on('hover:enter', function () { Lampa.Activity.push({ title: 'EPORNER Pro', component: 'eporner_entry' }); });
        $('.menu .menu__list').first().append(item);
    }

    if (window.appready) addMenu();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addMenu(); });
})();
