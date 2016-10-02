(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['b'], factory);
    } else {
        root.loadFont = factory(root.b);
    }
}(this, function (b) {
    var defaults = {
        cacheNamePrefix: 'loadFont_fontsLoaded__'
    };

    function load(fontList) {
        var fontPromiseArray,
            fontLoadingQuery;

        fontLoadingQuery = _makeFontQuery(fontList);
        fontPromiseArray = _loadFontQuery(fontLoadingQuery);

        return Promise.all(fontPromiseArray);
    }

    function _loadFontQuery(fontQuery) {
        var fontPromiseQuery = new Array(fontQuery.length);
        var i;

        for (i = 0; i < fontQuery.length; i++) {
            fontPromiseQuery[i] = _loadFontSequence(fontQuery[i])
        }

        return fontPromiseQuery;
    }

    function _loadFontSequence(fontNode) {
        var fontPromise;

        if (sessionStorage[fontNode.cacheKey]) {
            fontPromise = Promise.resolve();
        }
        else {
            fontPromise = fontNode.observer.load(null, fontNode.timeout || 3000);
        }

        fontPromise
            .then(function () {
                sessionStorage[fontNode.cacheKey] = true;
            })
            .catch(function () {
                sessionStorage[fontNode.cacheKey] = false;
            });

        if (fontNode.onload) {
            fontPromise.then(fontNode.onload);
        }

        if (fontNode.next) {
            fontPromise.then(function () {
               _loadFontSequence(fontNode.next);
            });
        }

        return fontPromise;
    }

    function _makeFontQuery(fontList) {
        var fontQuery = new Array(fontList.length);
        var i;

        for (i = 0; i < fontQuery.length; i++) {
            fontQuery[i] = _makeFontSequence(fontList[i]);
        }

        return fontQuery;
    }

    function _makeFontSequence(fontDefinition) {
        var fontSequence = {};

        fontSequence["observer"] = new FontFaceObserver(fontDefinition.name, fontDefinition.settings);
        fontSequence["cacheKey"] = defaults.cacheNamePrefix + fontDefinition.name.replace(/ /g, '_');

        if (fontDefinition.timeout) {
            fontSequence["timeout"] = fontDefinition.timeout;
        }

        if (fontDefinition.onload) {
            fontSequence["onload"] = fontDefinition.onload;
        }

        if (fontDefinition.next) {
            fontSequence["next"] = _makeFontSequence(fontSequence["next"]);
        }

        return fontSequence;
    }

    return {
        load: load
    };
}));