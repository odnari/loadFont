(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['FontFaceObserver'], factory);
    } else {
        root.loadFont = factory(root.FontFaceObserver);
    }
}(this, function (FontFaceObserver) {
    const defaults = {
        cacheNamePrefix: 'loadFont_fontsLoaded__',
        timeout: 3000
    };

    /**
     * load fonts
     * @param fontList
     * @returns {Promise}
     */
    function load(fontList) {
        const fontLoadingQuery = _makeFontNodes(fontList);
        const fontPromiseArray = _loadFontList(fontLoadingQuery);

        return Promise.all(fontPromiseArray);
    }

    /**
     * load fonts from font-nodes list
     * @param fontQuery
     * @returns {Array}
     * @private
     */
    function _loadFontList(fontQuery) {
        return fontQuery.map((fontNode) => _loadFontQuery(fontNode));
    }

    /**
     * load a query of fonts
     * @param fontNode
     * @returns {Promise}
     * @private
     */
    function _loadFontQuery(fontNode) {
        let fontPromise;

        if (!fontNode.observer) {
            fontPromise = Promise.reject(new Error('Observer object not found.'));
        } else {
            fontPromise = _loadFont(fontNode.observer, fontNode.timeout, fontNode.cacheKey);
        }

        if (fontNode.onload) {
            fontPromise.then(fontNode.onload);
        }

        if (fontNode.next) {
            fontPromise.then(() => _loadFontQuery(fontNode.next));
        }

        return fontPromise;
    }

    /**
     * load a font by font observer
     * @param observer - fontfaceobserver object
     * @param timeout - loading timeout
     * @param cacheKey - key for session cache
     * @returns {Promise} - promise for font
     * @private
     */
    function _loadFont(observer, timeout, cacheKey) {
        let fontPromise;

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
        return fontList.map((fontDef) => _makeFontQuery(fontDef));
    }

    /**
     * Convert settings object to font node object
     * @param fontDefinition
     * @returns {Object}
     * @private
     */
    function _makeFontQuery(fontDefinition) {
        let fontSequence = {};

        if (!fontDefinition.name) return null;

        fontSequence['observer'] = new FontFaceObserver(fontDefinition.name, fontDefinition.settings);
        fontSequence['cacheKey'] = _genCacheKey(fontDefinition.name, fontDefinition.settings);
        fontSequence['timeout'] = fontDefinition.timeout || defaults.timeout;

        if (fontDefinition.onload) {
            fontSequence['onload'] = fontDefinition.onload;
        }

        if (fontDefinition.next) {
            fontSequence['next'] = _makeFontQuery(fontDefinition['next']);
        }

        return fontSequence;
    }

    /**
     * generate unique cache-key for the each font node
     * @param fontName
     * @param settings
     * @returns {string}
     * @private
     */
    function _genCacheKey(fontName, settings) {
        let cacheKey,
            settingsKeys;

        cacheKey = defaults.cacheNamePrefix + fontName.replace(/ /g, '_');

        if (typeof settings === 'object') {
            settingsKeys = Object.keys(settings);

            cacheKey += settingsKeys
                .reduce((cacheKeyPart, settingName) => {
                    return cacheKeyPart += '_' + settings[settingName];
                }, '');
        }

        return cacheKey;
    }

    /**
     * switch on cache for the font
     * @param fontPromise
     * @param cacheKey
     * @returns {Promise}
     * @private
     */
    function _handleCache(fontPromise, cacheKey) {
        return fontPromise.then(() => sessionStorage[cacheKey] = true);
    }

    return {
        load: load
    };
}));