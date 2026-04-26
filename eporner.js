(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var cors    = 'https://corsproxy.io/?'; 
        
        this.create = function () {
            this.display(object.url);
            return this.render();
        };

        this.display = function(url) {
            this.activity.loader(true);
            body.empty();
            items = [];

            network.silent(cors + encodeURIComponent(url), (data) => {
                if (data.videos && data.videos.length) {
                    this.build(data.videos);
                } else {
                    this.empty();
                }
            }, () => {
                this.empty();
            });
        };

        this.build = function (videos) {
            videos.forEach(video => {
                // Отображаем качество в карточке (например, 1080p или 4K)
                var quality = video.keywords.toLowerCase().includes('4k') ? '4K' : (video.keywords.toLowerCase().includes('1080p') ? '1080p' : 'HD');
                
                var item = Lampa.Template.get('card', {
                    title: video.title,
                    release_year: video.length_min + ' min / ' + quality
                });

                item.addClass('card--collection');
                item.find('.card__img').attr('src', video.default_thumb.src);

                item.on('hover:enter', () => {
                    // Меню при выборе видео
                    var menu = [
                        { title: 'Смотреть (Авто)', quality: 'auto' },
                        { title: 'Выбрать качество (в плеере)', quality: 'manual' },
                        { title: 'В Избранное', action: 'fav' }
                    ];

                    Lampa.Select.show({
                        title: video.title,
                        items: menu,
                        onSelect: (m) => {
                            if (m.action === 'fav') {
                                var favs = Lampa.Storage.get('eporner_favorites', '[]');
                                favs.push(video);
                                Lampa.Storage.set('eporner_favorites', favs);
                                Lampa.Noty.show('Добавлено!');
                            } else {
                                // Запуск плеера
                                Lampa.Player.play({
                                    url: video.embed,
                                    title: video.title
                                });
                            }
                        }
                    });
                });

                body.append(item);
                items.push(item);
            });
            this.activity.loader(false);
            Lampa.Controller.enable('content');
        };

        this.empty = function () {
            body.append('<div class="empty">Ничего не найдено</div>');
            this.activity.loader(false);
        };

        this.render = function () {
            scroll.append(body);
            html.append(scroll.render());
            return html;
        };

        this.back = function () { Lampa.Activity.backward(); };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('eporner_plugin', epornerPlugin);

        function showGenres() {
            var genres = [
                { title: '4K Ultra HD', query: '4k' },
                { title: 'VR 360', query: 'vr' },
                { title: 'Amateur', query: 'amateur' },
                { title: 'Anal', query: 'anal' },
                { title: 'Asian', query: 'asian' },
                { title: 'Bigger is Better', query: 'big' },
                { title: 'Hardcore', query: 'hardcore' },
                { title: 'POV', query: 'pov' },
                { title: 'Teen (18+)', query: 'teen' }
            ];

            Lampa.Select.show({
                title: 'Жанры',
                items: genres,
                onSelect: (g) => {
                    Lampa.Activity.push({
                        url: 'https://www.eporner.com/api/v2/video/search/?query=' + g.query + '&per_page=40',
                        title: g.title,
                        component: 'eporner_plugin'
                    });
                }
            });
        }

        function showMain() {
            var main_menu = [
                { title: 'Поиск', action: 'search' },
                { title: 'Жанры / Категории', action: 'genres' },
                { title: 'Популярное', url: 'https://www.eporner.com/api/v2/video/search/?order=top-weekly' },
                { title: 'Избранное', action: 'favorites' }
            ];

            Lampa.Select.show({
                title: 'EPORNER Ultimate',
                items: main_menu,
                onSelect: (item) => {
                    if (item.action === 'search') {
                        Lampa.Input.edit({ title: 'Поиск видео' }, (value) => {
                            if (value) Lampa.Activity.push({
                                url: 'https://www.eporner.com/api/v2/video/search/?query=' + encodeURIComponent(value),
                                title: value,
                                component: 'eporner_plugin'
                            });
                        });
                    } else if (item.action === 'genres') {
                        showGenres();
                    } else if (item.action === 'favorites') {
                        var favs = Lampa.Storage.get('eporner_favorites', '[]');
                        // Для избранного вызываем тот же компонент, но передаем массив
                        Lampa.Noty.show('Функция просмотра избранного в разработке');
                    } else {
                        Lampa.Activity.push({
                            url: item.url,
                            title: item.title,
                            component: 'eporner_plugin'
                        });
                    }
                }
            });
        }

        Lampa.Menu.add({
            title: 'EPORNER Pro',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>',
            component: 'eporner_entry'
        });

        Lampa.Component.add('eporner_entry', function() {
            this.create = function() { showMain(); return $('<div></div>'); };
            this.render = function() { return $('<div></div>'); };
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
