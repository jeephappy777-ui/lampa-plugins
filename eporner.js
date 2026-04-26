(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        
        // Используем более мощный прокси для обхода блокировок в браузере
        var cors = 'https://api.allorigins.win/raw?url=';
        
        this.create = function () {
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            this.activity.loader(true);
            
            // Пытаемся получить данные
            network.silent(cors + encodeURIComponent(url), (data) => {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos && json.videos.length > 0) {
                        this.build(json.videos);
                    } else {
                        this.empty('Видео не найдены или API недоступно');
                    }
                } catch(e) {
                    this.empty('Ошибка обработки данных (JSON Error)');
                }
            }, () => {
                this.empty('Прокси-сервер не отвечает. Попробуйте обновить страницу.');
            });

            return this.render();
        };

        this.start = function () {
            Lampa.Controller.enable('content');
        };

        this.build = function (videos) {
            videos.forEach(video => {
                var item = Lampa.Template.get('card', {
                    title: video.title,
                    release_year: video.length_min + ' min'
                });
                item.addClass('card--collection');
                
                // Устанавливаем картинку
                var img = item.find('.card__img')[0];
                img.src = video.default_thumb.src;

                item.on('hover:enter', () => {
                    Lampa.Player.play({
                        url: video.embed,
                        title: video.title
                    });
                });
                body.append(item);
            });
            this.activity.loader(false);
            this.start();
        };

        this.empty = function (msg) {
            body.empty().append('<div class="empty">' + (msg || 'Контент не найден') + '</div>');
            this.activity.loader(false);
        };

        this.render = function () {
            scroll.append(body);
            return scroll.render();
        };

        this.back = function () { Lampa.Activity.backward(); };
        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () { network.clear(); scroll.destroy(); };
    }

    function startPlugin() {
        Lampa.Component.add('eporner_plugin', epornerPlugin);

        if ($('div[data-action="eporner"]').length > 0) return;

        var menu_item = $('<div class="menu__item selector" data-action="eporner">' +
            '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
            '<div class="menu__text">EPORNER Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                url: 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly',
                title: 'EPORNER Pro',
                component: 'eporner_plugin'
            });
        });

        $('.menu .menu__list').first().append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
