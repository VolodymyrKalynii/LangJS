/**
 * Class for multilanguage realization.
 *
 * @param {Object} [params] Parameters.
 *     @param {string} [params.lang = "uk"] Code of the language.
 *     @param {string} [params.root] Path to the folder of language files.
 *     @param {boolean} [params.autoload = false] Is in needed to start loading language data right after making instance?
 *
 * @constructor
 * @author Balov Bohdan <balovbohdan@gmail.com>
 * @version 1.0.0
 *
 * @example
 *
 * // Make instance.
 * var lang = Lang.getReadyInst("/lang/user-profile/", "uk");
 *
 * // Get language data elements.
 * var userAchievements = lang.get("achievements");
 * var userArticles = lang.get("articles");
 *
 * // Use language data elements.
 * var h1 = document.createElement("h1"), h2 = document.createElement("h2");
 * h1.textContent = userAchievements;
 * h2.textContent = userArticles;
 * document.body.appendChild(h1);
 * document.body.appendChild(h2);
 */
function Lang(params) {
    params = Object.assign(this.__getDefParams(), params || {});

    /**
     * Language code.
     * @type {string}
     * @private
     */
    this.__lang = this.__findLangCode(params);

    /**
     * Path to the folder of language files.
     * @type {string}
     * @private
     */
    this.__root = params.root || "/lang/";

    /**
     * Language data.
     * @type {null|Object}
     * @private
     */
    this.__data = null;

    /**
     * Is language data autoloading right now?
     * @type {boolean}
     * @private
     */
    this.__autoloadingNow = false;

    /**
     * Promise of autoloader of language data.
     * @type {null|Promise}
     * @private
     */
    this.__autoloadingPomise = null;

    if (params.autoload)
        this.__autoloadLangData()
            .catch(console.warn.bind(null, "Failed at autoloading language data."));
}

Lang.prototype.name = "Lang";

/**
 * Tries to find language code for the instance.
 * It is possible to extend this method if there are some additional
 * resources of the language code.
 * @param {Object} [params] Parameters of the instance.
 * @returns {string} Language code.
 * @private
 */
Lang.prototype.__findLangCode = function (params) {
    try {
        return Lang.validateLangCodeStrict(params.lang);
    } catch (e) {}

    // TODO: Add additional sources of the language code.
    // For example: URL, PHP session, etc.

    return Lang.UK;
};

/**
 * Bulgarian.
 * @type {string}
 */
Lang.BG = "bg";

/**
 * Czech.
 * @type {string}
 */
Lang.CZ = "cz";

/**
 * Kazakh.
 * @type {string}
 */
Lang.KZ = "kz";

/**
 * Lithuanian.
 * @type {string}
 */
Lang.LT = "lt";

/**
 * Latvian.
 * @type {string}
 */
Lang.LV = "lv";

/**
 * Polish.
 * @type {string}
 */
Lang.PL = "pl";

/**
 * Russian.
 * @type {string}
 */
Lang.RU = "ru";

/**
 * Slovakian.
 * @type {string}
 */
Lang.SK = "sk";

/**
 * Ukrainian.
 * @type {string}
 */
Lang.UA = "ua";

/**
 * English.
 * @type {string}
 */
Lang.UK = "uk";

/**
 * Uzbekistanian.
 * @type {string}
 */
Lang.UZ = "uz";

/**
 * Prepares instance.
 * Loads language data asynchronically.
 * @returns {Promise<Lang>}
 */
Lang.prototype.prepare = function () {
    return this.__autoloadLangData().then(function () { return this; }.bind(this));
};

/**
 * Waits while language data is autoloading.
 * @param {int} [tries = 200] Number of tries to wait for autoloading of language data.
 * @returns {Promise<Lang>} Ready language instance.
 */
Lang.prototype.waitWhileAutoloading = function (tries) {
    if (this.__data) return Promise.resolve(this.__data);
    if (!this.__autoloadingNow) return this.prepare();
    return this.__autoloadingPomise;
};

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
Lang.validateLangCode = function (langCode) {
    return Lang.getLangCodes().includes(langCode);
};

/**
 * Says if language code is valid.
 * Strict version.
 * @param {string} langCode Language code to validate.
 * @returns {string} Valid language code.
 */
Lang.validateLangCodeStrict = function (langCode) {
    if (!Lang.validateLangCode(langCode)) throw new Error("Got invalid language code: "+ langCode);
    return langCode;
};

/**
 * Returns path to the folder of class.
 * @returns {string}
 */
Lang.getRoot = function () {
    return "/libs/balov/js/lang/";
};

/**
 * Goes through the language data.
 * @param {Function} func Callback for parts of the language data.
 * @returns {Array} Results of the callback calls.
 */
Lang.prototype.map = function (func) {
    if (typeof func !== "function") throw new Error("Got incorrect callback.");
    var i, langData = this.getAll(), store = [];
    for (i in langData) if (langData.hasOwnProperty(i)) store.push(func(langData[i], i, langData));
    return store;
};

/**
 * Returns all language data.
 * @returns {Object}
 */
Lang.prototype.getAll = function () {
    return this.__getLang();
};

/**
 * Returns all language data of the instance.
 * This method gets language data from language file
 * in first time and buffers it.
 * @protected
 */
Lang.prototype.__getLang = function () {
    if (!this.__data) this.__data = this.__getLangDataSync();
    return this.__data;
};

/**
 * Returns aim language data element.
 * @param {string|int} key Key to find aim language data element.
 * @returns {string}
 */
Lang.prototype.get = function (key) {
    if (!key) throw new Error("Got incorrect language data element key: (" + key + ")");
    var data = this.__getLang();

    try {
        return data[key] || "";
    } catch (e) {
        return "";
    }
};

/**
 * Returns path to the language file.
 * @returns {string}
 * @private
 */
Lang.prototype.__getLangFilePath = function () { return this.__root + this.__lang + ".json"; };

/**
 * Returns default parameters for the instance.
 * @returns {Object}
 * @private
 */
Lang.prototype.__getDefParams = function () {
    return { autoload: false, root: "/lang/" };
};

/**
 * Loads language data from the file synchronically.
 * @returns {string}
 * @private
 */
Lang.prototype.__loadLangFileSync = function () {
    var xhr = new XMLHttpRequest(), url = this.__getLangFilePath();
    xhr.open("GET", url, false);
    this.__setLoadLangFileHeaders(xhr);
    xhr.send();
    if (xhr.status !== 200) throw new Error("Failed at loading language data synchronically. URL: " + url);
    return xhr.responseText;
};

/**
 * Loads language data from the file asynchronically.
 * @returns {Promise}
 * @private
 */
Lang.prototype.__loadLangFileAsync = function () {
    return new Promise(function (success) {
        var xhr = new XMLHttpRequest(), url = this.__getLangFilePath();
        xhr.open("GET", url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) throw new Error("Failed at loading language data asynchronically. URL: " + url);
            return success(xhr.responseText);
        };

        this.__setLoadLangFileHeaders(xhr);
        xhr.send();
    }.bind(this));
};

/**
 * Sets headers for the loading language files using "XHR".
 * @param {XMLHttpRequest} xhr
 * @private
 */
Lang.prototype.__setLoadLangFileHeaders = function (xhr) {
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
};

/**
 * Returns default language data of the instance.
 * Language data is going to be loaded from "JSON" the file synchronically.
 * @returns {Object}
 * @private
 */
Lang.prototype.__getLangDataSync = function () {
    return JSON.parse(this.__loadLangFileSync());
};

/**
 * Returns default language data of the instance.
 * Language data is going to be loaded from "JSON" the file asynchronically.
 * @returns {Promise<Object>} Language data.
 * @private
 */
Lang.prototype.__getLangDataAsync = function () {
    return this.__loadLangFileAsync().then(JSON.parse);
};

/**
 * Makes autoloading of the language data.
 * Asynchronical.
 * @returns {Promise<Object>} Language data.
 * @private
 */
Lang.prototype.__autoloadLangData = function () {
    if (this.__data) return Promise.resolve(this.__data);
    if (this.__autoloadingNow) return this.__autoloadingPomise;
    this.__autoloadingNow = true;

    return this.__autoloadingPomise = this.__getLangDataAsync()
        .then(function (langData) {
            this.__autoloadingNow = false;
            if (this.__data) return this.__data;
            return this.__data = langData;
        }.bind(this));
};

/**
 * Makes ready instance of some "Lang" class.
 * Waits while language data is autoloading.
 * @param {Function} Clss Language class.
 * @param {string} [lang] Language code.
 * @param {string} [root] Path to the folder of language files.
 * @returns {Promise<Lang>} Ready language instance.
 * @throws {Error}
 */
Lang.getReadyInstByClass = function (Clss, lang, root) {
    if (typeof Clss !== "function") throw new Error("Got incorrect 'Lang' constructor!");
    return (new Clss({ lang: lang, root: root })).prepare();
};

/**
 * Makes ready instance.
 * Waits while language data is autoloading.
 * @param {string} [lang] Language code.
 * @param {string} [root] Path to the folder of language files.
 * @returns {Promise<Lang>} Ready language instance.
 * @throws {Error}
 */
Lang.getReadyInst = function (lang, root) {
    return Lang.getReadyInstByClass(Lang, lang, root);
};
