# Lang
Class to make multilanguage of web-site as easy as possible. Gets language data from `.json` files. You can find PHP version of this class at https://github.com/balovbohdan/LangPHP

# Examples
## 1. Simple example
You can use this language class directly (see code below). But it is better to make subclasses of this class for different logical blocks of the web-site (see next example).

```javascript
// Make language instance.
const lang = Lang.instantiateByRoot('/lang/user-profile/', 'uk');

// Wait while language data is loading.
lang.wait().then(() => {
    // Use language instance.
 
    const h1 = document.createElement('h1');
    const h2 = document.createElement('h2');
 
    h1.textContent = lang.get('achievements');
    h2.textContent = lang.get('articles');

    document.body.appendChild(h1);
    document.body.appendChild(h2);
});
```

For this example you have to organize this folders/files structure:

```inline
app
├── ...
├── lang                            # Root folder for logical language blocks.
|   ├── ...
|   ├── user-profile                # Root folder for user profile page language files.
|   |   ├── [some_lang_code].json
|   |   ├── pl.json                 # Language file for Polish version of the page.
|   |   ├── uk.json                 # Language file for English version of the page.
|   |   ├── [some_lang_code].json
|   |   └── ...
|   └── ...
└── ...
```

## 2. Better usage.
It is better when you make subclasses of the main language class for the different logical blocks of your web-site. For instance: user profile, news, articles, admin page, etc.

```javascript
/**
 * Language class for user profile page.
 * Singletone.
 * @param {Object} [params] Parameters. (See superclass for details.)
 */
Lang.UserProfile = function (params) {
    if (Lang.UserProfile.__inst instanceof Lang.UserProfile) return Lang.UserProfile.__inst;
    Lang.UserProfile.__inst = this;
    params = params || {};
    Lang.call(this, { root: "/lang/user-profile/", lang: params.lang });
};

Lang.UserProfile.prototype = Object.create(Lang.prototype);
Lang.UserProfile.prototype.constructor = Lang.UserProfile;
Lang.UserProfile.prototype.name = "Lang.UserProfile";

/**
 * Single instance of the class.
 * @type {null|Lang.UserProfile}
 * @private
 */
Lang.UserProfile.__inst = null;

/**
 * Makes ready instance.
 * Waits while language data is autoloading.
 * @param {string} [lang] Language code.
 * @returns {Promise<Lang>} Ready language instance.
 * @throws {Error}
 */
Lang.UserProfile.getReadyInst = function (lang) {
    return Lang.getReadyInstByClass(Lang.UserProfile, lang);
};
```

Do note that ``Lang.UserProfile`` class is singletone; it means that it is possible to make only one instance of it (when you creating instance more than one time you get the same instance).
So now we can rewrite code from the first example. As you can see it looks pretty good and laconically.

```javascript
// Make instance.
var lang = Lang.UserProfile.getReadyInst("uk");
```

This version of making language instance much more safe. Using classes of the certain logical web-site blocks you can't make mistake in the paths to language data folders. (And you don't need type the same paths again and again!)
