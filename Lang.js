'use strict';

/**
 * Multilanguage class.
 * @param {Object} [params] Parameters.
 * @param {string} [params.lang = 'uk'] Code of the language. Instance trys to find code himself. Otherwise uses 'uk'.
 * @param {string} [params.root] Root of the language files.
 * @param {boolean} [params.autoload = true] Is in needed to start loading language data right after making instance?
 * @param {PhpSession} [params.phpSession] Ready instance of PHP session.
 * @param {Object} [config] Configurations.
 * @param {{}} [config.defLangCodes] Default language codes.
 * @constructor
 * @author Balov Bohdan <balovbohdan@gmail.com>
 * @version 0.1.2
 *
 * @example
 *
 * // Make language instance.
 * const lang = Lang.instantiateByRoot('/lang/user-profile/', 'uk');
 *
 * // Wait while language data is loading.
 * lang.wait().then(() => {
 *     // Use language instance.
 *
 *     const h1 = document.createElement('h1');
 *     const h2 = document.createElement('h2');
 *
 *     h1.textContent = lang.get('achievements');
 *     h2.textContent = lang.get('articles');
 *
 *     document.body.appendChild(h1);
 *     document.body.appendChild(h2);
 * });
 */
function Lang(params, config) {
    params = $.extend(true, this.__getDefParams(), params || {});
    config = $.extend(true, this.__getDefConfig(), config || {});

    /**
     * Main language code.
     * @type {string}
     * @private
     */
    this.__langCode = this.__findLangCode(params);

    /**
     * Default languages codes.
     * @type {string}
     * @private
     */
    this.__defLangCodes = config.defLangCodes[this.__langCode];

    /**
     * Path to the root of language data.
     * @type {string}
     * @private
     */
    this.__root = params.root || Lang.getTeachLangRoot();

    /**
     * Language data.
     * @type {null|Object}
     * @private
     */
    this.__data = null;

    /**
     * Promise of autoloader of language data.
     * @type {null|Promise}
     * @private
     */
    this.__autoloadingPomise = null;

    if (params.autoload)
        this.__loadLangData()
            .catch(console.warn.bind(null, `Failed at autoloading of language data.`));
}

Lang.prototype.name = 'Lang';

/**
 * Trys to find language code for the instance.
 * @param {Object} [params] Parameters if the instance.
 * @returns {string} Language code.
 * @protected
 */
Lang.prototype.__findLangCode = function (params) {
    try {
        return Lang.validateLangCodeStrict(params.lang);
    } catch (e) {}

    return Lang.UK;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Language constants.

/**
 * Bulgarian.
 * @type {string}
 */
Lang.BG = 'bg';

/**
 * Czech.
 * @type {string}
 */
Lang.CZ = 'cz';

/**
 * Kazakh.
 * @type {string}
 */
Lang.KZ = 'kz';

/**
 * Lithuanian.
 * @type {string}
 */
Lang.LT = 'lt';

/**
 * Latvian.
 * @type {string}
 */
Lang.LV = 'lv';

/**
 * Polish.
 * @type {string}
 */
Lang.PL = 'pl';

/**
 * Russian.
 * @type {string}
 */
Lang.RU = 'ru';

/**
 * Slovakian.
 * @type {string}
 */
Lang.SK = 'sk';

/**
 * Ukrainian.
 * @type {string}
 */
Lang.UA = 'ua';

/**
 * English.
 * @type {string}
 */
Lang.UK = 'uk';

/**
 * Uzbekistanian.
 * @type {string}
 */
Lang.UZ = 'uz';
Lang.UZ = 'uz';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Factories.

/**
 * Makes instance using root of the language files.
 * @param {string} root
 * @param {string} [lang = 'uk'] Code of the language.
 * @returns {Lang}
 */
Lang.instantiateByRoot = function (root, lang) {
    if (!root) throw new Error(`Got invalid URL of the language files.`);
    return new Lang({ root: root, lang: lang });
};

/**
 * Makes ready instance of some 'Lang' class.
 * Waits while language data is preparing.
 * @param {Function} Clss Language class.
 * @param {string} [lang] Language code.
 * @param {string} [root] Path to the folder of language files.
 * @returns {Promise<Lang>} Ready language instance.
 * @throws {Error}
 */
Lang.getReadyInstByClass = function (Clss, lang, root) {
    if (typeof Clss !== 'function') throw new Error(`Got invalid 'Lang' constructor!`);
    
    /** @type {Lang} */
    const langInstance = new Clss({ lang: lang, root: root });
    
    return langInstance.wait();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Main interface.

/**
 * Waits while language data is autoloading.
 * @returns {Promise<Lang>}
 */
Lang.prototype.wait = function () { return this.__loadLangData(); };

/**
 * Returns available language codes.
 * @returns {Array}
 */
Lang.getLangCodes = function () {
    return [
        Lang.BG,
        Lang.CZ,
        Lang.KZ,
        Lang.LT,
        Lang.LV,
        Lang.PL,
        Lang.RU,
        Lang.SK,
        Lang.UA,
        Lang.UK,
        Lang.UZ
    ];
};

/**
 * Says if language code is valid.
 * @param {string} langCode Language code to validate.
 * @returns {boolean}
 */
Lang.validateLangCode = function (langCode) { return Lang.getLangCodes().includes(langCode); };

/**
 * Says if language code is valid.
 * Strict version.
 * @param {string} langCode Language code to validate.
 * @returns {string} Valid language code.
 */
Lang.validateLangCodeStrict = function (langCode) {
    if (!Lang.validateLangCode(langCode)) throw new Error(`Got invalid language code: ${langCode}.`);
    return langCode;
};

/**
 * Returns path to the root of class.
 * @returns {string}
 */
Lang.getRoot = function () { return '/libs/balov/js/lang/'; };

/**
 * @description Goes through the language data.
 * @param {Function} func Callback for parts of the language data.
 * @returns {Array} Results of the callback calls.
 */
Lang.prototype.map = function (func) {
    if (typeof func !== 'function') throw new Error('Incorrect callback.');
    const langData = this.getAll();
    const store = [];
    for (let i in langData) if (langData.hasOwnProperty(i)) store.push(func(langData[i], i, langData));
    return store;
};

/**
 * @description Returns all language data.
 * @returns {Object}
 */
Lang.prototype.getAll = function () { return this.__getLang(); };

/**
 * Looks for langage item.
 * @param {string|number} key
 * @returns {string}
 */
Lang.prototype.get = function (key) {
    if (!key) throw new Error(`Got invalid language key! (${key})`);

    try {
        const data = this.__getLang();
        return data[key] || '';
    } catch (e) {
        return '';
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Model.

/**
 * Loads language data from the file synchronically.
 * @returns {Array<string>} Language files contents.
 * @private
 */
Lang.prototype.__loadLangFilesSync = function () { return Lang.__loadLangFilesSync(this.__getLangFilesUrls()); };

/**
 * Loads language data from the file asynchronically.
 * @returns {Promise<Array<string>>} Language files contents.
 * @private
 */
Lang.prototype.__loadLangFilesAsync = function () { return Lang.__loadLangFilesAsync(this.__getLangFilesUrls().reverse()); };

/**
 * Loads language file synchronically.
 * @param {string} url
 * @return {string}
 * @throws {Error}
 * @private
 */
Lang.__loadLangFileSync = function (url) {
    console.warn(`Method 'Lang.__loadLangFileSync' is deprecated. Use asynchronical methods instead!`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    Lang.__setLoadLangFileHeaders(xhr);
    xhr.send();
    if (xhr.status !== 200) throw new Error(`Failed to load language data synchronically. URL: ${url}.`);
    return xhr.responseText;
};

/**
 * Loads language files synchronically.
 * @param {Array<string>} urls
 * @returns {Array<string>}
 * @private
 */
Lang.__loadLangFilesSync = function (urls) {
    return urls
        .map(function (url) {
            try {
                return Lang.__loadLangFileSync(url);
            } catch (e) {
                console.warn(e.message);
                return '';
            }
        })
        .filter(function (contents) { return contents; });
};

/**
 * Loads language file asynchronically.
 * @param {string} url
 * @return {Promise<string>}
 * @private
 */
Lang.__loadLangFileAsync = function (url) {
    return new Promise(function (success, error) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) return error(new Error(`Failed to load language file. URL: ${url}.`));
            return success(xhr.responseText);
        };

        Lang.__setLoadLangFileHeaders(xhr);
        xhr.send();
    }.bind(this));
};

/**
 * Loads language files asynchronically.
 * @param {Array} urls
 * @return {Promise}
 * @private
 */
Lang.__loadLangFilesAsync = function (urls) {
    return Promise.all(
        urls.map(function (url) {
            return Lang.__loadLangFileAsync(url).catch(console.warn.bind(console));
        })
    );
};

/**
 * Sets headers for the loading language files using 'XHR'.
 * @param {XMLHttpRequest} xhr
 * @private
 * @static
 */
Lang.__setLoadLangFileHeaders = function (xhr) {
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
};

/**
 * Returns default language data of the instance.
 * Language data is going to be loaded from 'JSON' the file synchronically.
 * @returns {Object}
 * @private
 */
Lang.prototype.__getLangDataSync = function () { return Lang.__extractAndPrepareLangData(this.__loadLangFilesSync()); };

/**
 * Returns default language data of the instance.
 * Language data is going to be loaded from 'JSON' the file asynchronically.
 * @returns {Promise}
 * @private
 */
Lang.prototype.__getLangDataAsync = function () {
    return this.__loadLangFilesAsync().then(Lang.__extractAndPrepareLangData);
};

/**
 * Extracts language data from the language files contents.
 * @param {Array<{}>} langData
 * @return {{}}
 * @private
 */
Lang.__extractAndPrepareLangData = function (langData) {
    try {
        if (!langData || !langData.length) return {};
        langData = langData.filter(function (item) { return item; });
        if (langData.length === 1) return JSON.parse(langData[0]);

        return langData.reduce(function (mergedData, item) {
            try {
                return Object.assign(mergedData, JSON.parse(item));
            } catch (e) {
                return mergedData;
            }z
        }, {});
    } catch (e) {
        return {};
    }
};

/**
 * Makes autoloading of the language data.
 * Asynchronical.
 * @returns {Promise<Lang>}
 * @private
 */
Lang.prototype.__loadLangData = function () {
    if (this.__data) return Promise.resolve(this);
    if (this.__autoloadingPomise) return this.__autoloadingPomise;

    return this.__autoloadingPomise = this.__getLangDataAsync()
        .then(function (langData) {
            // console.log('Loaded language data:', langData);
            if (this.__data) return this.__data;
            this.__data = langData;
            return this;
        }.bind(this));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @description Returns all language data of the instance.
 * @description This method gets language data in first time and buffers it.
 * @protected
 */
Lang.prototype.__getLang = function () {
    if (!this.__data) this.__data = this.__getLangDataSync();
    return this.__data;
};

/**
 * Makes language file URL.
 * @param {string} langCode
 * @return {string}
 * @private
 */
Lang.prototype.__makeLangFileUrl = function (langCode) {
    try {
        langCode = Lang.validateLangCodeStrict(langCode);
        return `${this.__root}${langCode}.json`;
    } catch (e) {
        return '';
    }
};

/**
 * Returns unique language codes.
 * Instance will try to load language files for this codes.
 * @return {Array<string>}
 * @private
 */
Lang.prototype.__getLangCodes = function () {
    return [].concat(this.__langCode || Lang.UK, this.__defLangCodes || [])
        .filter(function (langCode, i, langCodes) { return langCodes.indexOf(langCode) === i; });
};

/**
 * Makes URLs of language files thay it is needed to load.
 * @return {Array<string>}
 * @private
 */
Lang.prototype.__getLangFilesUrls = function () {
    return this.__getLangCodes()
        .map(this.__makeLangFileUrl.bind(this))
        .filter(function (url) { return url; });
};

/**
 * Returns default parameters for the instance.
 * @returns {Object}
 * @private
 */
Lang.prototype.__getDefParams = function () { return { autoload: true }; };

/**
 * Returns default configurations.
 * @return {{defLangCodes:{}}}
 * @private
 */
Lang.prototype.__getDefConfig = function () {
    return {
        defLangCodes: {
            bg: [Lang.UK, Lang.RU],
            cz: [Lang.UK, Lang.RU],
            kz: [Lang.RU, Lang.UK],
            lt: [Lang.UK, Lang.RU],
            lv: [Lang.UK, Lang.RU],
            pl: [Lang.UK, Lang.RU],
            ru: [Lang.UK],
            sk: [Lang.UK, Lang.RU],
            ua: [Lang.UK, Lang.RU],
            uk: [Lang.RU],
            uz: [Lang.RU, Lang.UK]
        }
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Language classes names.
 * @constructor
 */
Lang.InstancesNames = function () {};

Lang.InstancesNames.prototype.name = 'Lang.InstancesNames';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
