(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var cors    = 'https://api.allorigins.win/raw?url=';
        
        this.create = function () {
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            this.activity.loader(true);
            network.silent(cors + encodeURIComponent(url), (data) => {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos) this.build(json.videos);
                    else this.empty();
                } catch(e) { this.empty(); }
            }, () => { this.empty(); });
            return this.render();
        };

        this.build = function (videos) {
            videos.forEach(video => {
                var item = Lampa.Template.get('card', { title: video.title, release_year: video.length_min + ' min' });
                item.addClass('card--collection');
                item.find('.card__img').attr('src', video.default_thumb.src);
                item.on('hover:enter', () => { Lampa.Player.play({ url: video.embed, title: video.title }); });
                body.append(item);
            });
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => { Lampa.Controller.collectionSet(body); Lampa.Controller.follow('container'); },
                left: () => { Lampa.Controller.toggle('menu'); },
                up: () => { Lampa.Controller.toggle('head'); },
                back: () => { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.empty = function () { body.append('<div class="empty">Контент не найден</div>'); this.activity.loader(false); };
        this.render = function () { scroll.append(body); return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); };
    }

    function epornerEntry() {
        this.create = function () {
            var menu = [
                { title: 'Популярные', url: 'https://www.eporner.com/api/v2/video/search/?order=top-weekly' },
                { title: 'Новинки', url: 'https://www.eporner.com/api/v2/video/search/?order=latest' },
                { title: 'Топ дня', url: 'https://www.eporner.com/api/v2/video/search/?order=top-daily' }
            ];
            var body = $('<div class="category-full"></div>');
            menu.forEach(item => {
                var card = Lampa.Template.get('card', { title: item.title, release_year: '' });
                card.addClass('card--category');
                card.on('hover:enter', () => {
                    Lampa.Activity.push({ title: item.title, url: item.url, component: 'eporner_plugin' });
                });
                body.append(card);
            });
            return body;
        };
        this.start = function () { 
            Lampa.Controller.add('content', { toggle: () => { Lampa.Controller.collectionSet($('.category-full')); Lampa.Controller.follow('container'); } }); 
            Lampa.Controller.toggle('content'); 
        };
    }

    function addMenuItem() {
        if ($('div[data-action="eporner"]').length > 0) return; // Чтобы не дублировать

        var menu_item = $('<div class="menu__item selector" data-action="eporner">' +
            '<div class="menu__ico"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg></div>' +
            '<div class="menu__text">EPORNER Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({ title: 'EPORNER Pro', component: 'eporner_entry' });
        });

        $('.menu .menu__list').first().append(menu_item);
    }

    function startPlugin() {
        Lampa.Component.add('eporner_plugin', epornerPlugin);
        Lampa.Component.add('eporner_entry', epornerEntry);
        
        // Пытаемся добавить пункт меню сразу
        addMenuItem();
        
        // И еще раз через 2 секунды на случай, если меню Lampa еще не отрисовалось
        setTimeout(addMenuItem, 2000);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
