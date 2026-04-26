(function () {
    'use strict';

    function startPlugin() {
        // Проверка: если пункт уже есть, не добавляем второй раз
        if ($('div[data-action="eporner_pro"]').length > 0) return;

        // Регистрируем компонент
        Lampa.Component.add('eporner_plugin', function (object) {
            var network = new Lampa.Reguest();
            var scroll  = new Lampa.Scroll({mask: true, over: true});
            var body    = $('<div class="category-full"></div>');
            
            this.create = function () {
                var url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(object.url);
                network.silent(url, (data) => {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json.videos) {
                        json.videos.forEach(video => {
                            var item = Lampa.Template.get('card', {title: video.title, release_year: video.length_min + ' min'});
                            item.addClass('card--collection');
                            item.find('.card__img').attr('src', video.default_thumb.src);
                            item.on('hover:enter', () => {
                                Lampa.Player.play({url: video.embed, title: video.title});
                            });
                            body.append(item);
                        });
                        this.activity.loader(false);
                        Lampa.Controller.enable('content');
                    }
                }, () => { this.activity.loader(false); });
                return this.render();
            };

            this.render = function () {
                scroll.append(body);
                return scroll.render();
            };
            
            this.back = function () { Lampa.Activity.backward(); };
            this.destroy = function () { network.clear(); scroll.destroy(); };
        });

        // ПРИНУДИТЕЛЬНОЕ ДОБАВЛЕНИЕ В МЕНЮ
        var menu_item = $('<div class="menu__item selector" data-action="eporner_pro">' +
            '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
            '<div class="menu__text">EPORNER Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                url: 'https://www.eporner.com/api/v2/video/search/?per_page=40',
                title: 'EPORNER Pro',
                component: 'eporner_plugin'
            });
        });

        // Вставляем пункт в меню после того, как оно отрисуется
        $('.menu .menu__list').prepend(menu_item);
        
        // Показываем уведомление, что плагин загружен (для теста)
        Lampa.Noty.show('EPORNER Pro успешно загружен!');
    }

    // Запуск через разные интервалы, чтобы точно поймать готовность меню
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                setTimeout(startPlugin, 100);
                setTimeout(startPlugin, 1000); // Повтор через секунду, если меню не успело
            }
        });
    }
})();
