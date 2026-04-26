(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var cors    = 'https://api.allorigins.win/raw?url=';
        
        function getProxyImg(url) {
            return 'https://images.weserv.nl/?url=' + encodeURIComponent(url);
        }

        this.create = function () {
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            this.activity.loader(true);
            
            network.silent(cors + encodeURIComponent(url), (data) => {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos && json.videos.length > 0) this.build(json.videos);
                    else this.empty('Видео не найдены');
                } catch(e) { this.empty('Ошибка данных'); }
            }, () => { this.empty('Сеть недоступна'); });

            return this.render();
        };

        this.build = function (videos) {
            videos.forEach(video => {
                var item = Lampa.Template.get('card', { title: video.title, release_year: video.length_min + ' min' });
                item.addClass('card--collection');
                var img = item.find('.card__img')[0];
                if (img) img.src = getProxyImg(video.default_thumb.src);

                item.on('hover:enter', () => {
                    Lampa.Player.play({ url: video.embed, title: video.title });
                });
                body.append(item);
            });
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.empty = function (msg) { body.append('<div class="empty">' + msg + '</div>'); this.activity.loader(false); };
        this.render = function () { scroll.append(body); return scroll.render(); };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => { Lampa.Controller.collectionSet(body); },
                left: () => { Lampa.Controller.toggle('menu'); },
                up: () => { Lampa.Controller.toggle('head'); },
                back: () => { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () { network.clear(); scroll.destroy(); };
    }

    function epornerEntry() {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var body   = $('<div class="category-full"></div>');
        var network = new Lampa.Reguest();
        var cors    = 'https://api.allorigins.win/raw?url=';

        this.create = function () {
            this.activity.loader(true);
            // Загружаем список всех категорий/жанров с сайта
            network.silent(cors + encodeURIComponent('https://www.eporner.com/api/v2/video/search/?per_page=1'), (data) => {
                // Основные фильтры
                var base = [
                    { title: 'Популярные', url: 'https://www.eporner.com/api/v2/video/search/?order=top-weekly' },
                    { title: 'Новинки', url: 'https://www.eporner.com/api/v2/video/search/?order=latest' },
                    { title: 'Топ дня', url: 'https://www.eporner.com/api/v2/video/search/?order=top-daily' }
                ];
                
                // Здесь можно было бы добавить парсинг жанров, но API Eporner 
                // отдает жанры только внутри видео. Поэтому добавим основные вручную:
                var genres = ['Teen', 'Milf', 'Amateur', 'Anal', 'Big Tits', 'Ebony', 'Hardcore', 'Japanese', 'Pornstar', 'Reality', 'Solo', 'Vintage'];
                
                base.forEach(i => this.addCategory(i));
                genres.forEach(g => {
                    this.addCategory({
                        title: g,
                        url: 'https://www.eporner.com/api/v2/video/search/?query=' + encodeURIComponent(g) + '&per_page=40'
                    });
                });
                
                this.activity.loader(false);
                this.activity.toggle();
            });

            return this.render();
        };

        this.addCategory = function(item) {
            var card = Lampa.Template.get('card', { title: item.title, release_year: '' });
            card.addClass('card--category');
            card.find('.card__img').attr('src', 'https://www.eporner.com/static/images/logo_top.png');
            card.on('hover:enter', () => {
                Lampa.Activity.push({
                    title: item.title,
                    url: item.url,
                    component: 'eporner_plugin',
                    page: 1
                });
            });
            body.append(card);
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => { Lampa.Controller.collectionSet(body); },
                back: () => { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function () { scroll.append(body); return scroll.render(); };
        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () { scroll.destroy(); };
    }

    function startPlugin() {
        Lampa.Component.add('eporner_plugin', epornerPlugin);
        Lampa.Component.add('eporner_entry', epornerEntry);

        var addMenu = function() {
            if ($('div[data-action="eporner"]').length > 0) return;
            var menu_item = $('<div class="menu__item selector" data-action="eporner">' +
                '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
                '<div class="menu__text">EPORNER Pro</div>' +
            '</div>');
            menu_item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'EPORNER Pro', component: 'eporner_entry' });
            });
            $('.menu .menu__list').first().append(menu_item);
        };

        addMenu();
        setTimeout(addMenu, 2000);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
