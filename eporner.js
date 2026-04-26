(function () {
    'use strict';

    function epornerPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var cors    = 'https://api.allorigins.win/raw?url='; // Запасной прокси внутри
        
        this.create = function () {
            var url = object.url || 'https://www.eporner.com/api/v2/video/search/?per_page=40&order=top-weekly';
            this.activity.loader(true);
            
            // Используем прямой CORS-прокси
            network.silent('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url), (data) => {
                try {
                    var json = typeof data === 'string' ? JSON.parse(data) : data;
                    if (json && json.videos) this.build(json.videos);
                    else this.empty('Видео не найдены');
                } catch(e) { this.empty('Ошибка парсинга'); }
            }, () => { this.empty('Сеть недоступна (попробуйте VPN)'); });

            return this.render();
        };

        this.build = function (videos) {
            videos.forEach(video => {
                var item = Lampa.Template.get('card', { title: video.title, release_year: video.length_min + ' min' });
                item.addClass('card--collection');
                
                var img = item.find('.card__img')[0];
                if (img) img.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(video.default_thumb.src);

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
                toggle: () => { Lampa.Controller.collectionSet(body); Lampa.Controller.follow('container'); },
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

        this.create = function () {
            var categories = [
                {t: 'Популярные', q: 'top-weekly'}, {t: 'Новинки', q: 'latest'}, {t: 'Топ дня', q: 'top-daily'},
                {t: 'Teen', q: 'teen'}, {t: 'Milf', q: 'milf'}, {t: 'Amateur', q: 'amateur'},
                {t: 'Anal', q: 'anal'}, {t: 'Big Tits', q: 'big-tits'}, {t: 'Ebony', q: 'ebony'},
                {t: 'Japanese', q: 'japanese'}, {t: 'Hardcore', q: 'hardcore'}, {t: 'Reality', q: 'reality'},
                {t: 'Solo', q: 'solo'}, {t: 'Vintage', q: 'vintage'}, {t: 'Interracial', q: 'interracial'},
                {t: 'POV', q: 'pov'}, {t: 'Blonde', q: 'blonde'}, {t: 'Asian', q: 'asian'},
                {t: 'Latina', q: 'latina'}, {t: 'Redhead', q: 'redhead'}, {t: 'BBW', q: 'bbw'},
                {t: 'BDSM', q: 'bdsm'}, {t: 'Handjob', q: 'handjob'}, {t: 'Creampie', q: 'creampie'},
                {t: 'Cumshot', q: 'cumshot'}, {t: 'Squirt', q: 'squirt'}, {t: 'Massage', q: 'massage'},
                {t: 'Nurse', q: 'nurse'}, {t: 'Public', q: 'public'}, {t: 'Brunette', q: 'brunette'},
                {t: 'Babysitter', q: 'babysitter'}, {t: 'Big Butt', q: 'big-butt'}, {t: 'Double Penetration', q: 'double-penetration'},
                {t: 'Facial', q: 'facial'}, {t: 'Fetish', q: 'fetish'}, {t: 'Fingering', q: 'fingering'},
                {t: 'Gangs', q: 'gangbang'}, {t: 'Goth', q: 'goth'}, {t: 'Hairy', q: 'hairy'},
                {t: 'Hidden Cam', q: 'hidden-cam'}, {t: 'Lingerie', q: 'lingerie'}, {t: 'Masturbation', q: 'masturbation'},
                {t: 'Office', q: 'office'}, {t: 'Old/Young', q: 'old-young'}, {t: 'Outdoor', q: 'outdoor'},
                {t: 'Pornstar', q: 'pornstar'}, {t: 'Small Tits', q: 'small-tits'}, {t: 'Socks', q: 'socks'},
                {t: 'Stockings', q: 'stockings'}, {t: 'Striptease', q: 'striptease'}, {t: 'Tattoo', q: 'tattoo'},
                {t: 'Threesome', q: 'threesome'}, {t: 'Toys', q: 'toys'}, {t: 'Uniform', q: 'uniform'}
            ];

            categories.forEach(item => {
                var card = Lampa.Template.get('card', { title: item.t, release_year: '' });
                card.addClass('card--category');
                card.find('.card__img').attr('src', 'https://www.eporner.com/static/images/logo_top.png');
                
                var url = (item.q.includes('top') || item.q === 'latest') 
                    ? 'https://www.eporner.com/api/v2/video/search/?order=' + item.q 
                    : 'https://www.eporner.com/api/v2/video/search/?query=' + item.q;

                card.on('hover:enter', () => {
                    Lampa.Activity.push({ title: item.t, url: url + '&per_page=40', component: 'eporner_plugin' });
                });
                body.append(card);
            });
            return this.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => { Lampa.Controller.collectionSet(body); },
                back: () => { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function () { scroll.append(body); return scroll.render(); };
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
