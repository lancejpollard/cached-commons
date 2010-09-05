/* ***** BEGIN LICENSE BLOCK *****
 *
 * Copyright (c) 2010 Aptana, Inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * ***** END LICENSE BLOCK ***** */
var ActiveSupport = null;

if(typeof exports != "undefined"){
    exports.ActiveSupport = ActiveSupport;
}

/**
 * == ActiveSupport ==
 * Provides a subset of important Function, Array and String methods from Prototype.js
 * Also includes a port of Ajax.Request, and methods that other modules in ActiveJS rely
 * on to operate.
 **/
(function(global_context){

/** section: ActiveSupport
 * ActiveSupport
 * Provides a subset of methods from the Prototype.js framework,
 * without modifying any built in prototypes to ensure compatibility
 * and portability.
 **/
ActiveSupport = {
    /**
     * ActiveSupport.getGlobalContext() -> Object
     * Returns the global context object (window in most implementations).
     **/
    getGlobalContext: function getGlobalContext()
    {
        return global_context;
    },
    /**
     * ActiveSupport.log() -> null
     * Logs a message to the available logging resource. Accepts a variable
     * number of arguments.
     **/
    log: function log()
    {
        if(typeof(console) !== 'undefined')
        {
            //console.log.apply not supported by IE
            switch(arguments.length)
            {
                case 1: console.log(arguments[0]); break;
                case 2: console.log(arguments[0],arguments[1]); break;
                case 3: console.log(arguments[0],arguments[1],arguments[2]); break;
                case 4: console.log(arguments[0],arguments[1],arguments[2],arguments[3]); break;
                case 5: console.log(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]); break;
            }
        }
    },
    /**
     * ActiveSupport.createError(message) -> Object
     * Creates an Error object (but does not throw it).
     *
     *     var MyError = ActiveSupport.createError('Error in file % on line %.');
     *     throw MyError.getErrorString(file_name,line_number);
     **/
    createError: function createError(message)
    {
        return {
            getErrorString: function getErrorString()
            {
                var output = String(message);
                for(var i = 0; i < arguments.length; ++i)
                {
                    output = output.replace(/\%/,arguments[i].toString ? arguments[i].toString() : String(arguments[i]));
                }
                return output;
            }
        };
    }
};

})(this);

/**
 * ActiveSupport.Array
 **/
ActiveSupport.Array = {
    /**
     * ActiveSupport.Array.from(object) -> Array
     * Returns an array from an array or array like object.
     **/
    from: function from(object)
    {
        if(!object)
        {
            return [];
        }
        var length = object.length || 0;
        var results = new Array(length);
        while (length--)
        {
            results[length] = object[length];
        }
        return results;
    },
    /**
     * ActiveSupport.Array.indexOf(array,object[,index]) -> Number
     * Emulates Array.indexOf for implementations that do not support it.
     **/
    indexOf: function indexOf(array,item,i)
    {
        if(Array.prototype.indexOf)
        {
            return array.indexOf(item,i);
        }
        i = i || (0);
        var length = array.length;
        if(i < 0)
        {
            i = length + i;
        }
        for(; i < length; i++)
        {
            if(array[i] === item)
            {
                return i;
            }
        }
        return -1;
    },
    /**
     * ActiveSupport.Array.without(array,item) -> Array
     * Returns an array without the given item.
     **/
    without: function without(arr)
    {
        var values = ActiveSupport.Array.from(arguments).slice(1);
        var response = [];
        for(var i = 0 ; i < arr.length; i++)
        {
            if(!(ActiveSupport.Array.indexOf(values,arr[i]) > -1))
            {
                response.push(arr[i]);
            }
        }
        return response;
    },
    /**
     * ActiveSupport.Array.map(array,iterator[,context]) -> Array
     * Emulates Array.prototype.map for browsers that do not support it.
     **/
    map: function map(array,iterator,context)
    {
        var length = array.length;
        context = context || window;
        var response = new Array(length);
        for(var i = 0; i < length; ++i)
        {
            if(array[i])
            {
                response[i] = iterator.call(context,array[i],i,array);
            }
        }
        return response;
    }
};
/**
 * ActiveSupport.Function
 **/
ActiveSupport.Function = {
    /**
     * ActiveSupport.Function.methodize(function) -> Function
     * Emulates Prototype's [Function.prototype.methodize](http://api.prototypejs.org/language/function/prototype/methodize/) including curry functionality.
     **/
    methodize: function methodize(func)
    {
        if(func._methodized)
        {
            return func._methodized;
        }
        return func._methodized = function()
        {
            return func.apply(null,[this].concat(ActiveSupport.Array.from(arguments)));
        };
    },
    /**
     * ActiveSupport.Function.bind(function,context[,argument]) -> Function
     * Emulates Prototype's [Function.prototype.bind](http://api.prototypejs.org/language/function/prototype/bind/) including curry functionality.
     **/
    bind: function bind(func,object)
    {
        if(typeof(object) == 'undefined')
        {
            return func;
        }
        if(arguments.length < 3)
        {
            return function bound()
            {
                return func.apply(object,arguments);
            };
        }
        else
        {
            var args = ActiveSupport.Array.from(arguments);
            args.shift();
            args.shift();
            return function bound()
            {
                return func.apply(object,args.concat(ActiveSupport.Array.from(arguments)));
            }
        }
    },
    bindAndCurryFromArgumentsAboveIndex: function bindAndCurryFromArgumentsAboveIndex(func,arguments,length)
    {
        if(arguments.length - length > 0)
        {
            var arguments_array = ActiveSupport.Array.from(arguments);
            var arguments_for_bind = arguments_array.slice(length);
            arguments_for_bind.unshift(func);
            return ActiveSupport.Function.bind.apply(ActiveSupport,arguments_for_bind);
        }
        else
        {
            return func;
        }
    },
    /**
     * ActiveSupport.Function.curry(function[,argument]) -> Function
     * Emulates Prototype's [Function.prototype.curry](http://api.prototypejs.org/language/function/prototype/curry/).
     **/
    curry: function curry(func)
    {
        if(arguments.length == 1)
        {
            return func;
        }
        var args = ActiveSupport.Array.from(arguments).slice(1);
        return function curried()
        {
            return func.apply(this,args.concat(ActiveSupport.Array.from(arguments)));
        };
    },
    /**
     * ActiveSupport.Function.wrap(function,wrapper) -> Function
     * Emulates Prototype's [Function.prototype.wrap](http://api.prototypejs.org/language/function/prototype/wrap/)
     **/
    wrap: function wrap(func,wrapper)
    {
        return function wrapped()
        {
            return wrapper.apply(this,[ActiveSupport.Function.bind(func,this)].concat(ActiveSupport.Array.from(arguments)));
        };
    }
};
/**
 * ActiveSupport.String
 **/
ActiveSupport.String = {
    /**
     * ActiveSupport.String.underscore(string) -> String
     * Emulates Prototype's [String.prototype.underscore](http://api.prototypejs.org/language/string/prototype/underscore/)
     **/
    underscore: function underscore(str)
    {
        return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, function(match){
            match = match.split("");
            return match[0] + '_' + match[1];
        }).replace(/([a-z\d])([A-Z])/g, function(match){
            match = match.split("");
            return match[0] + '_' + match[1];
        }).replace(/-/g, '_').toLowerCase();
    },
    /**
     * ActiveSupport.String.camelize(string[,capitalize = false]) -> String
     * Emulates Prototype's [String.prototype.camelize](http://api.prototypejs.org/language/string/prototype/camelize/)
     **/
    camelize: function camelize(str, capitalize)
    {
        var camelized,
            parts = str.replace(/\_/g,'-').split('-'), len = parts.length;
        if (len === 1)
        {
            if(capitalize)
            {
                return parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
            }
            else
            {
                return parts[0];
            }
        }
        if(str.charAt(0) === '-')
        {
            camelized = parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
        }
        else
        {
            camelized = parts[0];
        }
        for (var i = 1; i < len; i++)
        {
            camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
        }
        if(capitalize)
        {
            return camelized.charAt(0).toUpperCase() + camelized.substring(1);
        }
        else
        {
            return camelized;
        }
    },
    /**
     * ActiveSupport.String.trim(string) -> String
     * Trim leading and trailing whitespace.
     **/
    trim: function trim(str)
    {
        return (str || "").replace(/^\s+|\s+$/g,"");
    },
    scriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
    /**
     * ActiveSupport.String.evalScripts(string) -> null
     **/
    evalScripts: function evalScripts(str)
    {
        var match_all = new RegExp(ActiveSupport.String.scriptFragment,'img');
        var match_one = new RegExp(ActiveSupport.String.scriptFragment,'im');
        var matches = str.match(match_all) || [];
        for(var i = 0; i < matches.length; ++i)
        {
            eval((matches[i].match(match_one) || ['', ''])[1]);
        }
    },
    /**
     * ActiveSupport.String.stripScripts(string) -> String
     **/
    stripScripts: function stripScripts(str)
    {
        return str.replace(new RegExp(ActiveSupport.String.scriptFragment,'img'),'');
    }
};
/**
 * ActiveSupport.Number
 **/
ActiveSupport.Number = {};
/**
 * ActiveSupport.Object
 **/
ActiveSupport.Object = {
    /**
     * ActiveSupport.Object.isArray(object) -> Boolean
     **/
    isArray: function isArray(object)
    {
        return object && typeof(object) == 'object' && 'length' in object && 'splice' in object && 'join' in object;
    },
    /**
     * ActiveSupport.Object.keys(object) -> Array
     * Returns an array of keys from an object.
     **/
    keys: function keys(object)
    {
        var keys_array = [];
        for (var property_name in object)
        {
            keys_array.push(property_name);
        }
        return keys_array;
    },
    /**
     * ActiveSupport.Object.values(object) -> Array
     * Returns an array of values from an object.
     **/
    values: function values(object)
    {
        var values_array = [];
        for (var property_name in object)
        {
            values_array.push(object[property_name]);
        }
        return values_array;
    },
    /**
     * ActiveSupport.Object.extend(destination,source) -> Object
     * Emulates Prototype's [Object.extend](http://api.prototypejs.org/language/object/extend/)
     **/
    extend: function extend(destination, source)
    {
        for (var property in source)
        {
            destination[property] = source[property];
        }
        return destination;
    },
    /**
     * ActiveSupport.Object.clone(object) -> Object
     * Emulates Prototype's [Object.clone](http://api.prototypejs.org/language/object/clone/)
     **/
    clone: function clone(object)
    {
        return ActiveSupport.Object.extend({}, object);
    }
};
ActiveSupport.Inflections = {
    plural: [
        [/(quiz)$/i,               "$1zes"  ],
        [/^(ox)$/i,                "$1en"   ],
        [/([m|l])ouse$/i,          "$1ice"  ],
        [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
        [/(x|ch|ss|sh)$/i,         "$1es"   ],
        [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
        [/(hive)$/i,               "$1s"    ],
        [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
        [/sis$/i,                  "ses"    ],
        [/([ti])um$/i,             "$1a"    ],
        [/(buffal|tomat)o$/i,      "$1oes"  ],
        [/(bu)s$/i,                "$1ses"  ],
        [/(alias|status)$/i,       "$1es"   ],
        [/(octop|vir)us$/i,        "$1i"    ],
        [/(ax|test)is$/i,          "$1es"   ],
        [/s$/i,                    "s"      ],
        [/$/,                      "s"      ]
    ],
    singular: [
        [/(quiz)zes$/i,                                                    "$1"     ],
        [/(matr)ices$/i,                                                   "$1ix"   ],
        [/(vert|ind)ices$/i,                                               "$1ex"   ],
        [/^(ox)en/i,                                                       "$1"     ],
        [/(alias|status)es$/i,                                             "$1"     ],
        [/(octop|vir)i$/i,                                                 "$1us"   ],
        [/(cris|ax|test)es$/i,                                             "$1is"   ],
        [/(shoe)s$/i,                                                      "$1"     ],
        [/(o)es$/i,                                                        "$1"     ],
        [/(bus)es$/i,                                                      "$1"     ],
        [/([m|l])ice$/i,                                                   "$1ouse" ],
        [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
        [/(m)ovies$/i,                                                     "$1ovie" ],
        [/(s)eries$/i,                                                     "$1eries"],
        [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
        [/([lr])ves$/i,                                                    "$1f"    ],
        [/(tive)s$/i,                                                      "$1"     ],
        [/(hive)s$/i,                                                      "$1"     ],
        [/([^f])ves$/i,                                                    "$1fe"   ],
        [/(^analy)ses$/i,                                                  "$1sis"  ],
        [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
        [/([ti])a$/i,                                                      "$1um"   ],
        [/(n)ews$/i,                                                       "$1ews"  ],
        [/s$/i,                                                            ""       ]
    ],
    irregular: [
        ['move',   'moves'   ],
        ['sex',    'sexes'   ],
        ['child',  'children'],
        ['man',    'men'     ],
        ['person', 'people'  ]
    ],
    uncountable: [
        "sheep",
        "fish",
        "series",
        "species",
        "money",
        "rice",
        "information",
        "info",
        "equipment",
        "media"
    ]
};

ActiveSupport.Object.extend(ActiveSupport.Number,{
    /**
     * ActiveSupport.Number.ordinalize(number) -> String
     * Generates an ordinalized version of a number as a string (9th, 2nd, etc)
     **/
    ordinalize: function ordinalize(number)
    {
        if (11 <= parseInt(number, 10) % 100 && parseInt(number, 10) % 100 <= 13)
        {
            return number + "th";
        }
        else
        {
            switch (parseInt(number, 10) % 10)
            {
                case  1: return number + "st";
                case  2: return number + "nd";
                case  3: return number + "rd";
                default: return number + "th";
            }
        }
    }
});

ActiveSupport.Object.extend(ActiveSupport.String,{
    /**
     * ActiveSupport.String.pluralize(word) -> String
     * Generates a plural version of an english word.
     **/
    pluralize: function pluralize(word)
    {
        var i, lc = word.toLowerCase();
        for (i = 0; i < ActiveSupport.Inflections.uncountable.length; i++)
        {
            var uncountable = ActiveSupport.Inflections.uncountable[i];
            if (lc === uncountable)
            {
                return word;
            }
        }
        for (i = 0; i < ActiveSupport.Inflections.irregular.length; i++)
        {
            var singular = ActiveSupport.Inflections.irregular[i][0];
            var plural = ActiveSupport.Inflections.irregular[i][1];
            if ((lc === singular) || (lc === plural))
            {
                return plural;
            }
        }
        for (i = 0; i < ActiveSupport.Inflections.plural.length; i++)
        {
            var regex = ActiveSupport.Inflections.plural[i][0];
            var replace_string = ActiveSupport.Inflections.plural[i][1];
            if (regex.test(word))
            {
                return word.replace(regex, replace_string);
            }
        }
        return word;
    },
    /**
     * ActiveSupport.String.singularize(word) -> String
     * Generates a singular version of an english word.
     **/
    singularize: function singularize(word)
    {
        var i, lc = word.toLowerCase();
        for (i = 0; i < ActiveSupport.Inflections.uncountable.length; i++)
        {
            var uncountable = ActiveSupport.Inflections.uncountable[i];
            if (lc === uncountable)
            {
                return word;
            }
        }
        for (i = 0; i < ActiveSupport.Inflections.irregular.length; i++)
        {
            var singular = ActiveSupport.Inflections.irregular[i][0];
            var plural   = ActiveSupport.Inflections.irregular[i][1];
            if ((lc === singular) || (lc === plural))
            {
                return singular;
            }
        }
        for (i = 0; i < ActiveSupport.Inflections.singular.length; i++)
        {
            var regex = ActiveSupport.Inflections.singular[i][0];
            var replace_string = ActiveSupport.Inflections.singular[i][1];
            if (regex.test(word))
            {
                return word.replace(regex, replace_string);
            }
        }
        return word;
    }
});
/**
 * ActiveSupport.dateFromDateTime(date_time) -> Date
 * - date_time (String): in "yyyy-mm-dd HH:MM:ss" format
 *
 * Generates a JavaScript Date object from a MySQL DATETIME formatted string.
 **/
ActiveSupport.dateFromDateTime = function dateFromDateTime(date_time)
{
    var parts = date_time.replace(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/,"$1 $2 $3 $4 $5 $6").split(' ');
    return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
};

/*
 * Date Format 1.2.2
 * (c) 2007-2008 Steven Levithan <stevenlevithan.com>
 * MIT license
 * Includes enhancements by Scott Trenda <scott.trenda.net> and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * http://blog.stevenlevithan.com/archives/date-time-format
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

/**
 *  ActiveSupport.dateFormat(format) -> String
 *  ActiveSupport.dateFormat(date,format[,convert_to_local_time = false]) -> String
 *  - date (Date): If no date is passed the current Date will be used.
 *  - format (String): test
 *  - convert_to_local_time (Boolean): test
 *
 * See: <http://blog.stevenlevithan.com/archives/date-time-format>
 *
 * If convert_to_local_time is true the Date object will be assume to be GMT
 * and be converted from GMT to the local time. Local time will be the local
 * time of the server if running server side, or local time of the client
 * side if running in the browser.
 *
 *     ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss');
 *     ActiveSupport.dateFormat(new Date(),'yyyy-mm-dd HH:MM:ss');
 **/
ActiveSupport.dateFormat = (function date_format_wrapper()
{
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-\+]\d{4})?)\b/g,
        timezoneClip = /[^\-\+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = "0" + val;
            }
            return val;
        };

    // Regexes and supporting functions are cached through closure
    var dateFormat = function dateFormat(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length === 1 && (typeof date === "string" || date instanceof String) && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date();
        if (isNaN(date)) {
            throw new SyntaxError("invalid date");
        }

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) === "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };

    // Some common format strings
    dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        MySQL:          "yyyy-mm-dd HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    return dateFormat;
})();
ActiveSupport.getNativeJSONImplementation = function getNativeJSONImplementation()
{
    var global_context = ActiveSupport.getGlobalContext();
    //use native support if available
    if(global_context && 'JSON' in global_context && 'stringify' in global_context.JSON && 'parse' in global_context.JSON)
    {
        var test_output = JSON.stringify({a:[]});
        if(test_output.match(/\"\}$/))
        {
            //double encoding bug for arrays in hashes in safari
            return false;
        }
        else
        {
            return global_context.JSON;
        }
    }
    else
    {
        return false;
    }
};

/*
    http://www.JSON.org/json2.js
    2008-07-15

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html
*/
ActiveSupport.getAlternateJSONImplementation = function getAlternateJSONImplementation()
{
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function (key) {
        return this.getUTCFullYear()   + '-' +
             f(this.getUTCMonth() + 1) + '-' +
             f(this.getUTCDate())      + 'T' +
             f(this.getUTCHours())     + ':' +
             f(this.getUTCMinutes())   + ':' +
             f(this.getUTCSeconds())   + 'Z';
    };
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' +
                        (+(a.charCodeAt(0))).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }

    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function' && !ActiveSupport.Object.isArray(value)) {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value.valueOf());
        case 'number':
            return isFinite(value) ? String(value.valueOf()) : 'null';
        case 'boolean':
            return String(value.valueOf());
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length'))) {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    return {
        /**
         * ActiveSupport.JSON.stringify(object) -> String
         **/
        stringify: function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        },
        /**
         * ActiveSupport.JSON.parse(json_string) -> Object
         **/
        parse: function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        }
    };
};

/**
 * ActiveSupport.JSON
 * Provides JSON support, will use the browser's native implementation if it is available and complies with the JSON spec.
 **/
ActiveSupport.JSON = ActiveSupport.getNativeJSONImplementation() || ActiveSupport.getAlternateJSONImplementation();
/**
 * class ActiveSupport.CallbackQueue
 * Allows for the execution of callbacks in the order they are registered.
 *
 *     var queue = new ActiveSupport.CallbackQueue(function(){
 *         console.log('Callback queue empty.');
 *     });
 *     new ActiveSupport.Request(url,{
 *         onComplete: queue.push(function(){
 *             console.log('Ajax Request finished.');
 *         })
 *     });
 *     var callback_two = queue.push(function(){
 *         console.log('"callback_two" called.');
 *     });
 *     callback_two();
 *     var callback_three = queue.push(function(){
 *         console.log('"callback_three" called.');
 *     });
 *     callback_three();
 *
 * Ajax callback finishes after `callback_two` and `callback_three`, but
 * output to the console would still be:
 *
 *     //Ajax Request finished.
 *     //"callback_two" called.
 *     //"callback_three" called.
 *     //Callback queue empty.
 *
 * Note that ActiveSupport.CallbackQueue will only function if the first callback
 * added will be called asynchronously (as a result of an Ajax request or setTimeout
 * call).
 **/

/**
 * new ActiveSupport.CallbackQueue(on_complete[,context])
 * - on_complete (Function): The function to call when all callacks are completed.
 * - context (Object): optional context to bind the on_complete function to.
 **/
ActiveSupport.CallbackQueue = function CallbackQueue(on_complete)
{
    on_complete = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(on_complete || function(){},arguments,1);
    this.stack = [];
    this.waiting = {};
    if(on_complete)
    {
        this.setOnComplete(on_complete || function(){});
    }
};

/**
 * ActiveSupport.CallbackQueue.stack -> Array
 * The stack of callbacks that are `push`ed onto the queue.
 **/

ActiveSupport.CallbackQueue.prototype.setOnComplete = function setOnComplete(on_complete)
{
    this.onComplete = on_complete;
};

/**
 * ActiveSupport.CallbackQueue#push(callback[,context]) -> Function
 **/
ActiveSupport.CallbackQueue.prototype.push = function push(callback)
{
    callback = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(callback || function(){},arguments,1);
    var wrapped = ActiveSupport.Function.wrap(callback,ActiveSupport.Function.bind(function callback_queue_wrapper(proceed){
        var i = null;
        var index = ActiveSupport.Array.indexOf(this.stack,wrapped);
        this.waiting[index] = [proceed,ActiveSupport.Array.from(arguments).slice(1)];
        var all_present = true;
        for(i = 0; i < this.stack.length; ++i)
        {
            if(!this.waiting[i])
            {
                all_present = false;
            }
        }
        if(all_present)
        {
            for(i = 0; i < this.stack.length; ++i)
            {
                var item = this.waiting[i];
                item[0].apply(item[0],item[1]);
                delete this.waiting[i];
            }
        }
        if(all_present && i === this.stack.length)
        {
            if(this.onComplete)
            {
                this.onComplete();
            }
        }
    },this));
    this.stack.push(wrapped);
    return wrapped;
};
var global_context = ActiveSupport.getGlobalContext();
var ie = !!(global_context.attachEvent && !global_context.opera);

/**
 * ActiveSupport.Element
 * ActiveSupport.Element is a simple DOM manipulation library that does not modify the built in Element object. All ActiveSupport.Element methods take an Element object (and not a string) as their first argument. ActiveSupport.Element is available inside ActiveView classes as the second argument:
 *
 *     var MyClass = ActiveView.create(function(builder,dom){
 *         var link = builder.a({href:'#'},'Text');
 *         dom.addClassName(link,'active');
 *         dom.getWidth(link);
 *         return builder.div(link);
 *     });
 *
 * The implementation of event obeserver's differs from Prototype's since it does not modify the Element object. Your observer receives three arguments, the Event object, a function that will stop the event when called, and a function that will unregister the observer.
 *
 *     var dom = ActiveSupport.Element;
 *     dom.observe(link,'click',function(event,stop,unregister){
 *         //do stuff
 *         stop();
 *     });
 *
 * ActiveSupport.Element also supports the a similar event to Prototype's dom:ready:
 *
 *     dom.observe(document,'ready',function(){
 *         //...
 *     });
 **/
ActiveSupport.Element = {
    ieAttributeTranslations: {
        'class': 'className',
        'checked': 'defaultChecked',
        'usemap': 'useMap',
        'for': 'htmlFor',
        'readonly': 'readOnly',
        'colspan': 'colSpan',
        'bgcolor': 'bgColor',
        'cellspacing': 'cellSpacing',
        'cellpadding': 'cellPadding'
    },
    /**
     * ActiveSupport.Element.keyCodes -> Object
     * Contains the following:
     *
     * - KEY_BACKSPACE
     * - KEY_TAB
     * - KEY_RETURN
     * - KEY_ESC
     * - KEY_LEFT
     * - KEY_UP
     * - KEY_RIGHT
     * - KEY_DOWN
     * - KEY_DELETE
     * - KEY_HOME
     * - KEY_END
     * - KEY_PAGEUP
     * - KEY_PAGEDOWN
     * - KEY_INSERT
     **/
    keyCodes: {
        KEY_BACKSPACE: 8,
        KEY_TAB:       9,
        KEY_RETURN:   13,
        KEY_ESC:      27,
        KEY_LEFT:     37,
        KEY_UP:       38,
        KEY_RIGHT:    39,
        KEY_DOWN:     40,
        KEY_DELETE:   46,
        KEY_HOME:     36,
        KEY_END:      35,
        KEY_PAGEUP:   33,
        KEY_PAGEDOWN: 34,
        KEY_INSERT:   45
    },
    cache: {},
    /**
     * ActiveSupport.Element.create(tag_name,attributes_hash) -> Element
     **/
    create: function create(tag_name,attributes)
    {
        attributes = attributes || {};
        tag_name = tag_name.toLowerCase();
        var element;
        if(ie && (attributes.name || (tag_name == 'input' && attributes.type)))
        {
            //ie needs these attributes to be written in the string passed to createElement
            tag = '<' + tag_name;
            if(attributes.name)
            {
                tag += ' name="' + attributes.name + '"';
            }
            if(tag_name == 'input' && attributes.type)
            {
                tag += ' type="' + attributes.type + '"';
            }
            tag += '>';
            delete attributes.name;
            delete attributes.type;
            element = ActiveSupport.Element.extend(global_context.document.createElement(tag));
        }
        else
        {
            if(!ActiveSupport.Element.cache[tag_name])
            {
                ActiveSupport.Element.cache[tag_name] = ActiveSupport.Element.extend(global_context.document.createElement(tag_name));
            }
            element = ActiveSupport.Element.cache[tag_name].cloneNode(false);
        }
        ActiveSupport.Element.writeAttribute(element,attributes);
        return element;
    },
    extend: function extend(element)
    {
        return element;
    },
    /**
     * ActiveSupport.Element.clear(element) -> Element
     **/
    clear: function clear(element)
    {
        while(element.firstChild)
        {
            element.removeChild(element.firstChild);
        }
        return element;
    },
    /**
     * ActiveSupport.Element.hide(element) -> Element
     **/
    hide: function hide(element)
    {
        element.style.display = 'none';
        return element;
    },
    /**
     * ActiveSupport.Element.show(element) -> Element
     **/
    show: function show(element)
    {
        element.style.display = '';
        return element;
    },
    /**
     * ActiveSupport.Element.remove(element) -> Element
     **/
    remove: function remove(element)
    {
        element.parentNode.removeChild(element);
        return element;
    },
    /**
     * ActiveSupport.Element.insert(element,content[,position]) -> Element
     * - element (Element)
     * - content (String | Number | Element)
     * - position (String): "top", "bottom", "before", "after"
     * Note that this element does not identically mimic Prototype's Element.prototype.insert
     **/
    insert: function insert(element,content,position)
    {
        if(content && typeof(content.getElement) == 'function')
        {
            content = content.getElement();
        }
        if(ActiveSupport.Object.isArray(content))
        {
            for(var i = 0; i < content.length; ++i)
            {
                ActiveSupport.Element.insert(element,content[i],position);
            }
        }
        else
        {
            if(!content || !content.nodeType || content.nodeType !== 1)
            {
                content = global_context.document.createTextNode(String(content));
            }
            if(!position)
            {
                position = 'bottom';
            }
            switch(position)
            {
                case 'top': element.insertBefore(content,element.firstChild); break;
                case 'bottom': element.appendChild(content); break;
                case 'before': element.parentNode.insertBefore(content,element); break;
                case 'after': element.parentNode.insertBefore(content,element.nextSibling); break;
            }
        }
        return element;
    },
    /**
     * ActiveSupport.Element.update(element,content[,position]) -> Element
     * Works exactly like update, but calls ActiveSupport.Element.clear() on the element first.
     **/
    update: function update(element,content,position)
    {
        ActiveSupport.Element.clear(element);
        ActiveSupport.Element.insert(element,content,position);
        return element;
    },
    /**
     * ActiveSupport.Element.writeAttribute(element,name,value) -> Element
     * ActiveSupport.Element.writeAttribute(element,attributes_hash) -> Element
     **/
    writeAttribute: function writeAttribute(element,name,value)
    {
        var transitions = {
            className: 'class',
            htmlFor:   'for'
        };
        var attributes = {};
        if(typeof name === 'object')
        {
            attributes = name;
        }
        else
        {
            attributes[name] = typeof(value) === 'undefined' ? true : value;
        }
        for(var attribute_name in attributes)
        {
            name = transitions[attribute_name] || attribute_name;
            value = attributes[attribute_name];
            if(value === false || value === null)
            {
                element.removeAttribute(name);
            }
            else if(value === true)
            {
                element.setAttribute(name,name);
            }
            else
            {
                if(!ie)
                {
                    element.setAttribute(name,value);
                }
                else
                {
                    if(name == 'style')
                    {
                        element.style.cssText = value;
                    }
                    else
                    {
                        element.setAttribute(ActiveSupport.Element.ieAttributeTranslations[name] || name,value);
                    }
                }
            }
        }
        return element;
    },
    /**
     * ActiveSupport.Element.hasClassName(element,class_name) -> Boolean
     **/
    hasClassName: function hasClassName(element,class_name)
    {
        if(!element)
        {
            return false;
        }
        var element_class_name = element.className;
        return (element_class_name.length > 0 && (element_class_name == class_name || new RegExp("(^|\\s)" + class_name + "(\\s|$)").test(element_class_name)));
    },
    /**
     * ActiveSupport.Element.addClassName(element,class_name) -> Element
     **/
    addClassName: function addClassName(element,class_name)
    {
        if(!element)
        {
            return false;
        }
        if(!ActiveSupport.Element.hasClassName(element,class_name))
        {
            element.className += (element.className ? ' ' : '') + class_name;
        }
        return element;
    },
    /**
     * ActiveSupport.Element.removeClassName(element,class_name) -> Element
     **/
    removeClassName: function removeClassName(element,class_name)
    {
        if(!element)
        {
            return false;
        }
        element.className = element.className.replace(new RegExp("(^|\\s+)" + class_name + "(\\s+|$)"),' ').replace(/^\s+/, '').replace(/\s+$/, '');
        return element;
    },
    getDimensions: function getDimensions(element)
    {
        var display = element.style.display;
        if(!display)
        {
            var css = document.defaultView.getComputedStyle(element,null);
            display = css ? css.display : null;
        }
        //safari bug
        if(display != 'none' && display != null)
        {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }
        var element_style = element.style;
        var original_visibility = element_style.visibility;
        var original_position = element_style.position;
        var original_display = element_style.display;
        element_style.visibility = 'hidden';
        element_style.position = 'absolute';
        element_style.display = 'block';
        var original_width = element.clientWidth;
        var original_height = element.clientHeight;
        element_style.display = original_display;
        element_style.position = original_position;
        element_style.visibility = original_visibility;
        return {
            width: original_width,
            height: original_height
        };
    },
    /**
     * ActiveSupport.Element.getWidth(element) -> Number
     **/
    getWidth: function getWidth(element)
    {
        return ActiveSupport.Element.getDimensions(element).width;
    },
    /**
     * ActiveSupport.Element.getHeight(element) -> Number
     **/
    getHeight: function getHeight(element)
    {
        return ActiveSupport.Element.getDimensions(element).height;
    },
    documentReadyObservers: [],
    /**
     * ActiveSupport.Element.observe(element,event_name,callback[,context]) -> Function
     * - element (Element): The DOM element to observe.
     * - event_name (String): The name of the event, in all lower case, without the "on" prefix â€” e.g., "click" (not "onclick").
     * - callback (Function): The function to call when the event occurs.
     * - context (Object): The context to bind the callback to. Any additional arguments after context will be curried onto the callback.
     * This implementation of event observation is loosely based on Prototype's, but instead of adding element.stopObserving() and event.stop()
     * methods to the respective Element and Event objects, an event stopping callback and an event handler unregistration callback are passed
     * into your event handler.
     *
     *     ActiveSupport.Element.observe(element,'click',function(event,stop,unregister){
     *         stop();
     *         unregister();
     *     },this);
     *
     *     //Prototype equivelent:
     *
     *     var my_handler = element.observe('click',function(event){
     *         event.stop();
     *         element.stopObserving('click',my_handler);
     *     }.bind(this));
     *
     * dom:ready support is also built in:
     *
     *     ActiveSupport.Element.observe(document,'ready',function(){});
     *
     * If the above call was made after the document 'ready' event had already fired, the callback would be called immediately.
     **/
    observe: function observe(element,event_name,callback,context)
    {
        callback = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(callback || function(){},arguments,3);
        //dom:ready support
        if(element == ActiveSupport.getGlobalContext().document && event_name == 'ready')
        {
            if(ActiveSupport.Element.documentReadyObservers == null)
            {
                //ActiveSupport.Element.documentReadyObservers will be null if the document is ready
                //if so, trigger the observer now
                callback();
            }
            else
            {
                ActiveSupport.Element.documentReadyObservers.push(callback);
            }
            return;
        }

        //create callback wrapper
        var callback_wrapper = function callback_wrapper(event){
            if(!event)
            {
                event = window.event;
            }
            return callback(
                event,
                //event.srcElement ? (event.srcElement.nodeType == 3 ? event.srcElement.parentNode : event.srcElement) : null,
                function stop_callback(){
                    event.cancelBubble = true;
                    event.returnValue = false;
                    if(event.preventDefault)
                    {
                        event.preventDefault();
                    }
                    if(event.stopPropagation)
                    {
                        event.stopPropagation();
                    }
                },function remove_event_listener(){
                    if(element.removeEventListener)
                    {
                        element.removeEventListener(event_name,callback_wrapper,false);
                    }
                    else
                    {
                        element.detachEvent("on" + event_name,callback_wrapper);
                    }
                }
            );
        };

        //attach event listener
        if(element.addEventListener)
        {
            element.addEventListener(event_name,callback_wrapper,false);
        }
        else
        {
            element.attachEvent('on' + event_name,callback_wrapper);
        }

        return callback_wrapper;
    }
};

/*
Ported from Prototype.js usage:

    ActiveSupport.Element.observe(document,'ready',function(){

    });
*/
(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;
  var loaded = false;

  function fire_content_loaded_event()
  {
      if(loaded)
      {
          return;
      }
      if(timer)
      {
          window.clearTimeout(timer);
      }
      loaded = true;
      if(ActiveSupport.Element.documentReadyObservers.length > 0)
      {
          for(var i = 0; i < ActiveSupport.Element.documentReadyObservers.length; ++i)
          {
              ActiveSupport.Element.documentReadyObservers[i]();
          }
          ActiveSupport.Element.documentReadyObservers = null;
      }
  };

  function check_ready_state(event,stop,stop_observing)
  {
      if(document.readyState === 'complete')
      {
          stop_observing();
          fire_content_loaded_event();
      }
  };

  function poll_do_scroll()
  {
      try
      {
          document.documentElement.doScroll('left');
      }
      catch(e)
      {
          timer = window.setTimeout(poll_do_scroll);
          return;
      }
      fire_content_loaded_event();
  };

  if(document.addEventListener)
  {
      document.addEventListener('DOMContentLoaded',fire_content_loaded_event,false);
  }
  else
  {
      ActiveSupport.Element.observe(document,'readystatechange',check_ready_state);
      if(window == top)
      {
          timer = window.setTimeout(poll_do_scroll);
      }
  }

  ActiveSupport.Element.observe(window,'load',fire_content_loaded_event);
})();

//Ajax Library integration
(function(){
    //Prototype
    if(global_context.Prototype && global_context.Prototype.Browser && global_context.Prototype.Browser.IE && global_context.Element && global_context.Element.extend)
    {
        ActiveSupport.Element.extend = function extendForPrototype(element){
          return Element.extend(element);
        };
    };
    //MooTools
    if(global_context.MooTools && global_context.Browser && global_context.Browser.Engine.trident && global_context.document.id)
    {
        ActiveSupport.Element.extend = function extendForMooTools(element){
            return global_context.document.id(element);
        };
    }
})();
/**
 * class ActiveSupport.Request
 *
 * Supports an indentical API to Prototype's [Ajax.Request/Response](http://api.prototypejs.org/ajax/),
 * but does not include handling / onException callbacks or Ajax.Responders.
 *
 * You can mimic Ajax.Responder functionality with ActiveEvent:
 *
 *     //only needs to be done once per app, but not enabled by default
 *     ActiveEvent.extend(ActiveSupport.Request);
 *     ActiveSupport.Request.observe('onComplete',function(request,response,header_json){});
 **/
ActiveSupport.Request = function Request(url,options)
{
    this._complete = false;
    this.options = {
        method: 'post',
        asynchronous: true,
        contentType: 'application/x-www-form-urlencoded',
        encoding: 'UTF-8',
        parameters: {},
        evalJSON: true,
        evalJS: true
    };
    ActiveSupport.Object.extend(this.options,options || {});
    this.options.method = this.options.method.toLowerCase();
    this.url = url;
    this.transport = ActiveSupport.Request.getTransport();
    this.request(url);
};

ActiveSupport.Object.extend(ActiveSupport.Request.prototype,{
    request: function request()
    {
        this.method = this.options.method;
        var params = ActiveSupport.Object.clone(this.options.parameters);
        if(this.method != 'get' && this.method != 'post')
        {
            params['_method'] = this.method;
            this.method = 'post';
        }
        if(this.method == 'post')
        {
            if(this.options.postBody && this.options.postBody.indexOf('authenticity_token') == -1)
            {
                this.options.postBody = this.options.postBody.replace(/}$/,',"authenticity_token":"' + window._auth_token + '"}');
            }
            else if(params['authenticity_token'] == null)
            {
                params['authenticity_token'] = window._auth_token;
            }
        }
        this.parameters = params;
        if(params = ActiveSupport.Request.encodeParamters(params))
        {
            if(this.method == 'get')
            {
                this.url += (this.url.match(/\?/) ? '&' : '?') + params;
            }
            else if(/Konqueror|Safari|KHTML/.test(navigator.userAgent))
            {
                params += '&_=';
            }
        }
        this.transport.open(this.method.toUpperCase(),this.url,this.options.asynchronous);
        if(this.options.asynchronous)
        {
            window.setTimeout(ActiveSupport.Function.bind(this.respondToReadyState,this),1000);
        }
        this.transport.onreadystatechange = ActiveSupport.Function.bind(this.onStateChange,this);
        this.setRequestHeaders();
        this.body = this.method == 'post' ? (this.options.postBody || params) : null;
        this.transport.send(this.body);
    },
    onStateChange: function onStateChange()
    {
        var ready_state = this.transport.readyState;
        if(ready_state > 1 && !((ready_state == 4) && this._complete))
        {
            this.respondToReadyState(this.transport.readyState);
        }
    },
    setRequestHeaders: function setRequestHeaders()
    {
        var headers = {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        };
        if(this.method == 'post')
        {
            headers['Content-type'] = this.options.contentType + (this.options.encoding ? '; charset=' + this.options.encoding : '');
            /* Force "Connection: close" for older Mozilla browsers to work
             * around a bug where XMLHttpRequest sends an incorrect
             * Content-length header. See Mozilla Bugzilla #246651.
             */
            if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            {
                headers['Connection'] = 'close';
            }
        }
        // user-defined headers
        if(typeof this.options.requestHeaders == 'object')
        {
            var extras = this.options.requestHeaders;
            if(typeof(extras.push) == 'function')
            {
                for(var i = 0, length = extras.length; i < length; i += 2)
                {
                    headers[extras[i]] = extras[i+1];
                }
            }
            else
            {
                for(var extra_name in extras)
                {
                    headers[extra_name] = extras[extra_name];
                }
            }
        }
        for(var name in headers)
        {
            this.transport.setRequestHeader(name,headers[name]);
        }
    },
    respondToReadyState: function respondToReadyState(ready_state)
    {
        var response = new ActiveSupport.Response(this);
        if(this.options.onCreate)
        {
            this.options.onCreate(response);
        }
        if(this.notify)
        {
            this.notify('onCreate',response);
        }
        var state = ActiveSupport.Request.events[ready_state];
        if(state == 'Complete')
        {
            this._complete = true;
            (this.options['on' + response.status] || this.options['on' + (this.success() ? 'Success' : 'Failure')] || function(){})(response,response.headerJSON);
            var content_type = response.getHeader('Content-type');
            if(this.options.evalJS == 'force' || (this.options.evalJS && this.isSameOrigin() && content_type && content_type.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
            {
                this.evalResponse();
            }
        }
        (this.options['on' + state] || function(){})(response,response.headerJSON);
        if(this.notify)
        {
            this.notify('on' + state,response,response.headerJSON);
        }
        if(state == 'Complete')
        {
            // avoid memory leak in MSIE: clean up
            this.transport.onreadystatechange = function(){};
        }
    },
    getStatus: function getStatus()
    {
        try
        {
            return this.transport.status || 0;
        }
        catch(e)
        {
            return 0;
        }
    },
    success: function success()
    {
        var status = this.getStatus();
        return !status || (status >= 200 && status < 300);
    },
    getHeader: function getHeader(name)
    {
        try
        {
            return this.transport.getResponseHeader(name) || null;
        }
        catch(e)
        {
            return null;
        }
    },
    evalResponse: function evalResponse()
    {
        return eval((this.transport.responseText || '').replace(/^\/\*-secure-([\s\S]*)\*\/\s*$/,'$1'));
    },
    isSameOrigin: function isSameOrigin()
    {
        var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
        return !m || (m[0] == location.protocol + '//' + document.domain + location.port ? ':' + location.port : '');
    }
});

ActiveSupport.Object.extend(ActiveSupport.Request,{
    events: [
        'Uninitialized',
        'Loading',
        'Loaded',
        'Interactive',
        'Complete'
    ],
    getTransport: function getTransport()
    {
        try
        {
            return new XMLHttpRequest();
        }
        catch(e)
        {
            try
            {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch(e)
            {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
    },
    encodeParamters: function encodeParamters(params)
    {
        var response = [];
        for(var param_name in params)
        {
            param_name = encodeURIComponent(param_name);
            var values = params[param_name];
            if(values && typeof values == 'object')
            {
                if(ActiveSupport.Object.isArray(values))
                {
                    var values_response = [];
                    for(var i = 0; i < values.length; ++i)
                    {
                        values_response.push(ActiveSupport.Request.toQueryPair(param_name,values[i]));
                    }
                    response.push(values_response.join('&'));
                }
            }
            else
            {
                response.push(ActiveSupport.Request.toQueryPair(param_name,values));
            }
        }
        return response.join('&');
    },
    toQueryPair: function toQueryPair(key,value)
    {
        if(typeof(value) == 'undefined')
        {
            return key;
        }
        else
        {
            return key + '=' + encodeURIComponent(value == null ? '' : String(value));
        }
    }
});

ActiveSupport.Response = function Response(request)
{
    var global_context = ActiveSupport.getGlobalContext();
    var ie = !!(global_context.attachEvent && !global_context.opera);

    this.status = 0;
    this.statusText = '';
    this.getStatus = request.getStatus;
    this.getHeader = request.getHeader;

    this.request = request;
    var transport = this.transport = request.transport;
    var ready_state = this.readyState = transport.readyState;
    if((ready_state > 2 && !ie) || ready_state == 4)
    {
        this.status = this.getStatus();
        this.statusText = this.getStatusText();
        this.responseText = transport.responseText;
        this.headerJSON = this.getHeaderJSON();
    }
    if(ready_state == 4)
    {
        var xml = transport.responseXML;
        this.responseXML = typeof(xml) == 'undefined' ? null : xml;
        this.responseJSON = this.getResponseJSON();
    }
};
ActiveSupport.Object.extend(ActiveSupport.Response.prototype,{
    getStatusText: function getStatusText()
    {
        try
        {
            return this.transport.statusText || '';
        }
        catch(e)
        {
            return '';
        }
    },
    getHeaderJSON: function getHeaderJSON()
    {
        var json = this.getHeader('X-JSON');
        if(!json)
        {
            return null;
        }
        json = decodeURIComponent(escape(json));
        return ActiveSupport.JSON.parse(json);
    },
    getResponseJSON: function getResponseJSON()
    {
        var options = this.request.options;
        if(!options.evalJSON || (options.evalJSON != 'force' && !((this.getHeader('Content-type') || '').indexOf('application/json') > -1)) || (!this.responseText || this.responseText == ''))
        {
            return null;
        }
        return ActiveSupport.JSON.parse(this.responseText);
    }
});
/**
 * class ActiveSupport.Initializer
 * Several asynchronous events occur in an ActiveJS application before
 * your application is ready to use. The initializer ensures that ActiveRoutes
 * and ActiveRecord are configured appropriately and that these events occur
 * in the correct order. Specifically the initializer will:
 *
 * - observe the document 'ready' event provided by ActiveSupport.Element
 * - connect ActiveRecord to a data source
 * - configure ActiveView.Routing
 *
 *     new ActiveSupport.Initializer({
 *         database: 'path/to/db.json',
 *         routes: function(){
 *             return {
 *                 '/': [MyApp.ViewOne,'index'],
 *                 '/about': [MyApp.ViewTwo,'about']
 *             };
 *         },
 *         callback: function(){
 *             MyApp.setup();
 *         }
 *     });
 *
 **/

/**
 * new ActiveSupport.Initializer(options)
 * - options (Object)
 *
 * The options hash can contain:
 *
 * - database (String | Array): URL of a JSON database to load, or an array of arguments to [[ActiveRecord.connect]]
 * - routes (Object | Function): A hash of routes, or a function that returns one. Usually a function is needed to avoid a race condition.
 * - callback (Function): The function to be called when the initializer is completed.
 **/

/**
 * ActiveSupport.Initializer#initialized -> Boolean
 **/
ActiveSupport.Initializer = function Initializer(params)
{
    this.database = params.database;
    this.routes = params.routes;
    this.callback = params.callback || function(){};
    this.initialized = false;
    this.queue = new ActiveSupport.CallbackQueue(this.setRoutes,this);
    if(this.database)
    {
        ActiveRecord.observe('ready',this.queue.push());
        if(typeof(this.database) == 'string' || (typeof(this.database) == 'object' && !ActiveSupport.Object.isArray(this.database)))
        {
            ActiveRecord.connect(this.database);
        }
        else if(ActiveSupport.Object.isArray(this.database))
        {
            ActiveRecord.connect.apply(ActiveRecord,this.database);
        }
        else
        {
            ActiveRecord.connect();
        }
    }
    ActiveSupport.Element.observe(document,'ready',this.queue.push());
};

ActiveSupport.Initializer.prototype.setRoutes = function setRoutes()
{
    if(this.routes)
    {
        ActiveRoutes.observe('ready',this.onComplete,this);
        ActiveRoutes.setRoutes((typeof(this.routes) == 'function') ? this.routes() : this.routes);
    }
    else
    {
        this.onComplete();
    }
};

ActiveSupport.Initializer.prototype.onComplete = function onComplete()
{
    this.initialized = true;
    this.callback();
};