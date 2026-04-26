(function () {
    'use strict';

    function startPlugin() {
        // Регистрация компонента
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

        // Добавление в меню
        Lampa.Menu.add({
            id: 'eporner',
            title: 'EPORNER Pro',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>',
            component: 'eporner_plugin',
            url: 'https://www.eporner.com/api/v2/video/search/?per_page=40'
        });
    }

    // Запуск
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
