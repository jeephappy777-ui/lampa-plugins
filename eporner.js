(function () {
    'use strict';

    function redtubePlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        
        // Используем стандартный прокси Lampa
        var cors = 'https://cors.lampa.mx/';

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            
            // API RedTube
            var url = object.url || 'https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&size=40';
            
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
            body.empty();
            videos.forEach(function (obj) {
                var video = obj.video; // У RedTube данные вложены в объект video
                var item = Lampa.Template.get('card', {
                    title: video.title,
                    release_year: video.duration
                });

                item.addClass('card--collection');
                
                // Картинка
                var img = item.find('.card__img')[0];
                if (img) img.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb);

                item.on('hover:enter', function () {
                    Lampa.Player.play({
                        url: video.url, // Плеер подхватит ссылку
                        title: video.title
                    });
                });

                body.append(item);
            });

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.empty = function () {
            this.activity.loader(false);
            body.append('<div class="empty">Контент не найден. Попробуйте другую категорию.</div>');
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

    function redtubeEntry() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');

        this.create = function () {
            var cats = [
                {t: 'Популярные', q: 'stars'},
                {t: 'Новинки', q: 'newest'},
                {t: 'Гейша', q: 'Japanese'},
                {t: 'Аматоры', q: 'Amateur'},
                {t: 'Мильфы', q: 'MILF'},
                {t: 'Подростки', q: 'Teen'}
            ];

            cats.forEach(function (item) {
                var card = Lampa.Template.get('card', { title: item.t, release_year: '' });
                card.addClass('card--category');
                card.find('.card__img').attr('src', 'https://openclipart.org/download/218529/video-play-icon.svg');
                
                var url = 'https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&size=40&category=' + item.q;

                card.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: item.t,
                        url: url,
                        component: 'redtube_plugin'
                    });
                });
                body.append(card);
            });

            return this.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(body); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function () { scroll.append(body); return scroll.render(); };
        this.destroy = function () { scroll.destroy(); body.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('redtube_plugin', redtubePlugin);
        Lampa.Component.add('redtube_entry', redtubeEntry);

        var add = function() {
            if ($('div[data-action="redtube"]').length > 0) return;
            var item = $('<div class="menu__item selector" data-action="redtube">' +
                '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 .6-.03 1.29-.1 2.09-.06.8-.15 1.43-.28 1.9-.13.47-.35.83-.66 1.07-.31.24-.7.39-1.17.45-.47.06-1.1.11-1.9.15-.8.04-1.49.06-2.09.06L12 18c-.6 0-1.29-.02-2.09-.06-.8-.04-1.43-.09-1.9-.15-.47-.06-.86-.21-1.17-.45-.31-.24-.53-.6-.66-1.07-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L6 12c0-.6.03-1.29.1-2.09.06-.8.15-1.43.28-1.9.13-.47.35-.83.66-1.07.31-.24.7-.39 1.17-.45.47-.06 1.1-.11 1.9-.15.8-.04 1.49-.06 2.09-.06L12 6c.6 0 1.29.02 2.09.06.8.04 1.43.09 1.9.15.47.06.86.21 1.17.45.31.24.53.6.66 1.07z" fill="currentColor"/></svg></div>' +
                '<div class="menu__text">RedTube</div>' +
            '</div>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'RedTube', component: 'redtube_entry' });
            });

            $('.menu .menu__list').first().append(item);
        };

        if (window.appready) add();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') add(); });
    }

    startPlugin();
})();
