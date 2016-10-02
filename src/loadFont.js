(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['FontFaceObserver'], factory);
    } else {
        root.loadFont = factory(root.FontFaceObserver);
    }
}(this, function (FontFaceObserver) {
    var defaults = {
        cacheNamePrefix: 'loadFont_fontsLoaded__',
        timeout: 3000
    };

    /**
     * load fonts
     * @param fontList
     * @returns {*}
     */
    function load(fontList) {
        var fontPromiseArray,
            fontLoadingQuery;

        fontLoadingQuery = _makeFontNodes(fontList);
        fontPromiseArray = _loadFontList(fontLoadingQuery);

        return Promise.all(fontPromiseArray);
    }

    /**
     * load fonts from font-nodes list
     * @param fontQuery
     * @returns {Array}
     * @private
     */
    function _loadFontList(fontQuery) {
        var fontPromiseQuery = new Array(fontQuery.length);
        var i;

        for (i = 0; i < fontQuery.length; i++) {
            fontPromiseQuery[i] = _loadFontQuery(fontQuery[i])
        }

        return fontPromiseQuery;
    }

    /**
     * load a query of fonts
     * @param fontNode
     * @returns {Promise|*}
     * @private
     */
    function _loadFontQuery(fontNode) {
        var fontPromise;

        if (!fontNode.observer) {
            fontPromise = Promise.reject(new Error("Observer object not found."));
        } else {
            fontPromise = _loadFont(fontNode.observer, fontNode.timeout, fontNode.cacheKey);
        }

        if (fontNode.onload) {
            fontPromise.then(fontNode.onload);
        }

        if (fontNode.next) {
            fontPromise.then(function () {
                _loadFontQuery(fontNode.next);
            });
        }

        return fontPromise;
    }

    /**
     * load a font by font observer
     * @param observer - fontfaceobserver object
     * @param timeout - loading timeout
     * @param cacheKey - key for session cache
     * @returns {Promise} - promicse for font
     * @private
     */
    function _loadFont(observer, timeout, cacheKey) {
        var fontPromise;

        if (sessionStorage[cacheKey]) {
            fontPromise = Promise.resolve();
        }
        else {
            fontPromise = observer.load(null, timeout);
        }

        fontPromise = _handleCache(fontPromise, cacheKey);

        return fontPromise;
    }

    /**
     * convert the list of fonts to special font nodes
     * @param fontList
     * @returns {Array}
     * @private
     */
    function _makeFontNodes(fontList) {
        var fontQuery = new Array(fontList.length);
        var i;

        for (i = 0; i < fontQuery.length; i++) {
            fontQuery[i] = _makeFontQuery(fontList[i]);
        }

        return fontQuery;
    }

    /**
     * Convert settings object to font node object
     * @param fontDefinition
     * @returns {Object}
     * @private
     */
    function _makeFontQuery(fontDefinition) {
        var fontSequence = {};

        if (!fontDefinition.name) return null;

        fontSequence["observer"] = new FontFaceObserver(fontDefinition.name, fontDefinition.settings);
        fontSequence["cacheKey"] = _genCacheKey(fontDefinition.name, fontDefinition.settings);
        fontSequence["timeout"] = fontDefinition.timeout || defaults.timeout;

        if (fontDefinition.onload) {
            fontSequence["onload"] = fontDefinition.onload;
        }

        if (fontDefinition.next) {
            fontSequence["next"] = _makeFontQuery(fontDefinition["next"]);
        }

        return fontSequence;
    }

    function _genCacheKey(fontName, settings) {
        var cacheKey,
            settingsKeys,
            i;

        cacheKey = defaults.cacheNamePrefix + fontName.replace(/ /g, '_');

        if (typeof settings === 'object') {
            settingsKeys = Object.keys(settings);

            for (i = 0; i < settingsKeys.length; i++) {
                cacheKey += '_' + settings[settingsKeys[i]];
            }
        }

        return cacheKey;
    }

    function _handleCache(fontPromise, cacheKey) {
        return fontPromise
            .then(function () {
                sessionStorage[cacheKey] = true;
            })
            .catch(function () {
                sessionStorage[cacheKey] = false;
            });
    }

    return {
        load: load
    };
}));