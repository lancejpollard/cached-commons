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
/**
 * == ActiveEvent ==
 *
 * ActiveEvent allows you to create observable events, and attach event
 * handlers to any class or object.
 *
 * Setup
 * -----
 * Before you can use ActiveEvent you call [[ActiveEvent.extend]]. If you extend a class, both the class itself
 * will become observable, as well as all of it's instances.
 *
 *     ActiveEvent.extend(MyClass); //class and all instances are observable
 *     ActiveEvent.extend(my_object); //this object becomes observable
 *
 * Creating Events
 * ---------------
 * You can create an event inside any method of your class or object by calling
 * the `notify` method with name of the event followed by any arguments to be
 * passed to observers.
 *
 *     var Message = function(){};
 *     ActiveEvent.extend(Message);
 *     Message.prototype.send = function(text){
 *         //message sending code here...
 *         this.notify('sent',text);
 *     };
 *
 * Observing Events
 * ----------------
 * To observe an event call the `observe` method with the name of the event you
 * want to observe, and the observer function. The observer function will
 * receive any additional arguments passed to `notify`. If observing a class,
 * the instance that triggered the event will always be the first argument
 * passed to the observer. `observeOnce` works just like `observe` in every
 * way, but is only called once.
 *
 *     Message.observe('sent',function(message,text){
 *         //responds to all sent messages
 *     });
 *
 *     var m = new Message();
 *     m.observe('sent',function(text){
 *         //this will only be called when "m" is sent
 *     });
 *
 *     observable_hash.observe('set',function(key,value){
 *         console.log('observable_hash.set: ' + key + '=' + value);
 *     });
 *
 *     observable_hash.observeOnce('set',function(key,value){
 *         //this will only be called once
 *     });
 *
 * You can bind and curry your observers by adding extra arguments, which
 * will be passed to [[ActiveSupport.Function.bind]]:
 *
 *     Message.observe('sent',function(curried_argument,message,text){
 *         //this == context
 *     },context,curried_argument);
 *
 * Control Flow
 * ------------
 * When `notify` is called, if any of the registered observers for that event
 * return false, no other observers will be called and `notify` will return
 * false. Returning null or not calling return will not stop the event.
 *
 * Otherwise `notify` will return an array of the
 * collected return values from any registered observer functions. Observers
 * can be unregistered with the `stopObserving` method. If no observer is
 * passed, all observers of that object or class with the given event name
 * will be unregistered. If no event name and no observer is passed, all
 * observers of that object or class will be unregistered.
 *
 *     Message.prototype.send = function(text){
 *         if(this.notify('send',text) === false)
 *             return false;
 *         //message sending code here...
 *         this.notify('sent',text);
 *         return true;
 *     };
 *
 *     var m = new Message();
 *
 *     var observer = m.observe('send',function(message,text){
 *         if(text === 'test')
 *             return false;
 *     });
 *
 *     m.send('my message'); //returned true
 *     m.send('test'); //returned false
 *
 *     m.stopObserving('send',observer);
 *
 *     m.send('test'); //returned true
 *
 * Object.options
 * --------------
 * If an object has an options property that contains a callable function with
 * the same name as an event triggered with `notify`, it will be
 * treated just like an instance observer.
 *
 *     var Widget = function(options){
 *         this.options = options;
 *     };
 *     ActiveEvent.extend(Widget);
 *
 *     var my_widget = new Widget({
 *         afterChange: function(){}
 *     });
 *     //equivelent to:
 *     var my_widget = new Widget();
 *     my_widget.observe('afterChange',function(){});
 **/
var ActiveEvent = null;

if(typeof exports != "undefined"){
    exports.ActiveEvent = ActiveEvent;
}

/** section: ActiveEvent
 * mixin Observable
 * After calling [[ActiveEvent.extend]], the given object will inherit the
 * methods in this namespace. If the given object has a prototype
 * (is a class constructor), the object's prototype will inherit
 * these methods as well.
 **/
(function(){

ActiveEvent = {};

/** section: ActiveEvent
 * ActiveEvent
 * See [ActiveEvent tutorial](../index.html).
 **/

/**
 * ActiveEvent.extend(object) -> Object
 * Mixin [[Observable]] to the given object.
 **/
ActiveEvent.extend = function extend(object){

    object._objectEventSetup = function _objectEventSetup(event_name)
    {
        if(!this._observers)
        {
            this._observers = {};
        }
        if(!(event_name in this._observers))
        {
            this._observers[event_name] = [];
        }
    };

    /**
     * Observable.observe(event_name,observer[,context]) -> Function
     * See ActiveEvent tutorial.
     **/
    object.observe = function observe(event_name,observer,context)
    {
        observer = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(observer,arguments,2);
        if(typeof(event_name) === 'string' && typeof(observer) !== 'undefined')
        {
            this._objectEventSetup(event_name);
            if(!(ActiveSupport.Array.indexOf(this._observers[event_name],observer) > -1))
            {
                this._observers[event_name].push(observer);
            }
        }
        else
        {
            for(var e in event_name)
            {
                this.observe(e,event_name[e]);
            }
        }
        return observer;
    };

    /**
     * Observable.stopObserving([event_name][,observer]) -> null
     * Removes a given observer. If no observer is passed, removes all
     * observers of that event. If no event is passed, removes all
     * observers of the object.
     **/
    object.stopObserving = function stopObserving(event_name,observer)
    {
        this._objectEventSetup(event_name);
        if(event_name && observer)
        {
            this._observers[event_name] = ActiveSupport.Array.without(this._observers[event_name],observer);
        }
        else if(event_name)
        {
            this._observers[event_name] = [];
        }
        else
        {
            this._observers = {};
        }
    };

    /**
     * Observable.observeOnce(event_name,observer[,context]) -> Function
     * Works exactly like `observe`, but will `stopObserving` after the first
     * time the event is fired. Note that the observer that is passed in will
     * be wrapped by another function which will be returned. The returned
     * function can then be passed to `stopObserving`
     **/
    object.observeOnce = function observeOnce(event_name,outer_observer,context)
    {
        outer_observer = ActiveSupport.Function.bindAndCurryFromArgumentsAboveIndex(outer_observer,arguments,2);
        var inner_observer = ActiveSupport.Function.bind(function bound_inner_observer(){
            outer_observer.apply(this,arguments);
            this.stopObserving(event_name,inner_observer);
        },this);
        this._objectEventSetup(event_name);
        this._observers[event_name].push(inner_observer);
        return inner_observer;
    };

    /**
     * Observable.notify(event_name[,argument]) -> Array | Boolean
     * Triggers event_name with the passed arguments, accepts a variable number of arguments.
     * Returns an Array of values returned by the registered observers, or false if the event was
     * stopped by an observer.
     **/
    object.notify = function notify(event_name)
    {
        if(!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
        {
            return [];
        }
        this._objectEventSetup(event_name);
        var collected_return_values = [];
        var args = ActiveSupport.Array.from(arguments).slice(1);
        for(var i = 0; i < this._observers[event_name].length; ++i)
        {
            var response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
            if(response === false)
            {
                return false;
            }
            else
            {
                collected_return_values.push(response);
            }
        }
        return collected_return_values;
    };
    if(object.prototype)
    {
        object.prototype._objectEventSetup = object._objectEventSetup;
        object.prototype.observe = object.observe;
        object.prototype.stopObserving = object.stopObserving;
        object.prototype.observeOnce = object.observeOnce;
        object.prototype.notify = function notify_instance(event_name)
        {
            if(
              (!object._observers || !object._observers[event_name] || (object._observers[event_name] && object._observers[event_name].length == 0)) &&
              (!this.options || !this.options[event_name]) &&
              (!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
            )
            {
                return [];
            }
            var args = ActiveSupport.Array.from(arguments).slice(1);
            var collected_return_values = [];
            if(object.notify)
            {
                object_args = ActiveSupport.Array.from(arguments).slice(1);
                object_args.unshift(this);
                object_args.unshift(event_name);
                var collected_return_values_from_object = object.notify.apply(object,object_args);
                if(collected_return_values_from_object === false)
                {
                    return false;
                }
                collected_return_values = collected_return_values.concat(collected_return_values_from_object);
            }
            this._objectEventSetup(event_name);
            var response;
            if(this.options && this.options[event_name] && typeof(this.options[event_name]) === 'function')
            {
                response = this.options[event_name].apply(this,args);
                if(response === false)
                {
                    return false;
                }
                else
                {
                    collected_return_values.push(response);
                }
            }
            for(var i = 0; i < this._observers[event_name].length; ++i)
            {
                response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
                if(response === false)
                {
                    return false;
                }
                else
                {
                    collected_return_values.push(response);
                }
            }
            return collected_return_values;
        };
    }
};

/**
 * class ActiveEvent.ObservableHash
 * includes Observable
 * A simple hash implementation that fires notifications on `set`/`unset`.
 *
 * Events
 * ------
 * - set(key,value)
 * - unset(key)
 **/
var ObservableHash = function ObservableHash(object)
{
    this._object = object || {};
};

/**
 * ActiveEvent.ObservableHash#set(key,value[,suppress_notifications = false]) -> mixed
 **/
ObservableHash.prototype.set = function set(key,value,suppress_observers)
{
    var old_value = this._object[key];
    this._object[key] = value;
    if(this._observers && this._observers.set && !suppress_observers)
    {
        this.notify('set',key,value);
    }
    return value;
};

/**
 * ActiveEvent.ObservableHash#get(key) -> mixed
 **/
ObservableHash.prototype.get = function get(key)
{
    return this._object[key];
};

/**
 * ActiveEvent.ObservableHash#unset(key) -> mixed
 **/
ObservableHash.prototype.unset = function unset(key)
{
    if(this._observers && this._observers.unset)
    {
        this.notify('unset',key);
    }
    var value = this._object[key];
    delete this._object[key];
    return value;
};

/**
 * ActiveEvent.ObservableHash#toObject() -> Object
 * Returns a vanilla (non-observable) hash.
 **/
ObservableHash.prototype.toObject = function toObject()
{
    return this._object;
};

ActiveEvent.extend(ObservableHash);

ActiveEvent.ObservableHash = ObservableHash;

})();