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
var ActiveView = null;

(function(){

/**
 * == ActiveView ==
 * ActiveView tutorial in progress.
 **/

/** section: ActiveView
 * ActiveView
 **/
ActiveView = {};

/**
 * ActiveView.logging -> Boolean
 **/
ActiveView.logging = false;

/**
 * ActiveView.create(structure[,methods]) -> ActiveView.Class
 * ActiveView.create(parent_class,structure[,methods]) -> ActiveView.Class
 * - structure (Function): This function must return an DOM Element node.
 * - methods (Object): Instance methods for your ActiveView class.
 **/
ActiveView.create = function create(structure,methods)
{
    var parent_class;
    if(ActiveView.isActiveViewClass(structure))
    {
        parent_class = structure;
        structure = arguments[1];
        methods = arguments[2];
    }
    var klass = function klass(scope){
        this.setupScope(scope);
        this.initialize.apply(this,arguments);
        this.notify('initialized');
        if(klass._observers && 'attached' in klass._observers)
        {
             ActiveView.triggerOrDelayAttachedEventOnInstance(this);
        }
    };
    klass.instance = false;
    ActiveSupport.Object.extend(klass,ClassMethods);
    if(parent_class)
    {
        ActiveSupport.Object.extend(klass.prototype,parent_class.prototype);
        klass.prototype.structure = ActiveSupport.Function.wrap(parent_class.prototype.structure,function(proceed,builder,dom){
          return ActiveSupport.Function.bind(structure,this)(ActiveSupport.Function.bind(proceed,this)(builder,dom),builder,dom);
        });
    }
    else
    {
        ActiveSupport.Object.extend(klass.prototype,InstanceMethods);
        klass.prototype.structure = structure;
    }
    ActiveEvent.extend(klass);
    klass.prototype.observe = ActiveSupport.Function.wrap(klass.prototype.observe,ActiveView.observeWrapperForAttachedEventOnInstance);
    if(parent_class)
    {
        klass._observers = ActiveSupport.Object.clone(parent_class._observers);
        klass.prototype._observers = {};
        ActiveView.wrapActiveEventMethodsForChildClass(klass,parent_class);
    }
    ActiveSupport.Object.extend(klass.prototype,methods || {});
    return klass;
};

ActiveView.wrapActiveEventMethodsForChildClass = function wrapActiveEventMethodsForChildClass(child_class,parent_class)
{
    var methods = ['observe','stopObserving','observeOnce'];
    for(var i = 0; i < methods.length; ++i)
    {
        (function method_wrapper_iterator(method_name){
            parent_class[method_name] = ActiveSupport.Function.wrap(parent_class[method_name],function method_wrapper(proceed){
                var arguments_array = ActiveSupport.Array.from(arguments).slice(1);
                child_class[method_name].apply(child_class,arguments_array);
                return proceed.apply(proceed,arguments_array);
            });
        })(methods[i]);
    }
};

//fires the "attached" event when the instance's element is attached to the dom
ActiveView.observeWrapperForAttachedEventOnInstance = function observeWrapperForAttachedEventOnInstance(proceed,event_name)
{
    var arguments_array = ActiveSupport.Array.from(arguments).slice(1);
    var response = proceed.apply(proceed,arguments_array);
    if(event_name == 'attached')
    {
        ActiveView.triggerOrDelayAttachedEventOnInstance(this);
    }
    return response;
};

ActiveView.nodeInDomTree = function nodeInDomTree(node)
{
    var ancestor = node;
    while(ancestor.parentNode)
    {
        ancestor = ancestor.parentNode;
    }
    return !!(ancestor.body);
};

ActiveView.triggerOrDelayAttachedEventOnInstance = function triggerOrDelayAttachedEventOnInstance(instance){
    if(!instance._attachedEventFired && instance.element && ActiveView.nodeInDomTree(instance.element))
    {
        instance.notify('attached');
        instance._attachedEventFired = true;
        if(instance._attachedEventInterval)
        {
            clearInterval(instance._attachedEventInterval);
        }
    }
    else if(!('_attachedEventInterval' in instance))
    {
        instance._attachedEventInterval = setInterval(function(){
            if(instance.element && ActiveView.nodeInDomTree(instance.element))
            {
                instance.notify('attached');
                instance._attachedEventFired = true;
                clearInterval(instance._attachedEventInterval);
                instance._attachedEventInterval = false;
            }
        },10);
    }
};

/**
 * class ActiveView.Class
 * includes Observable
 * ActiveView.Class refers to any class created with [[ActiveView.create]].
 *
 * Events
 * ------
 * - initialized()
 * - attached(): Called when the instance's `element` object is attached to the DOM tree.
 **/
ActiveView.isActiveViewInstance = function isActiveViewInstance(object)
{
    return object && object.getElement && object.getElement().nodeType == 1 && object.scope;
};

ActiveView.isActiveViewClass = function isActiveViewClass(object)
{
    return object && object.prototype && object.prototype.structure && object.prototype.setupScope;
};

var InstanceMethods = (function(){
    return {
        /**
         * new ActiveView.Class([scope])
         **/
        initialize: function initialize(scope)
        {
            if(ActiveView.logging)
            {
                ActiveSupport.log('ActiveView: initialized ',this,' with scope:',scope);
            }
            var response = this.structure(ActiveView.Builder,ActiveSupport.Element);
            if(response && !this.element)
            {
                this.setElement(response);
            }
            if(!this.element || !this.element.nodeType || this.element.nodeType !== 1)
            {
                throw Errors.ViewDoesNotReturnelement.getErrorString(typeof(this.element));
            }
            for(var key in this.scope._object)
            {
                this.scope.set(key,this.scope._object[key]);
            }
            this.notify('initialized');
        },
        setupScope: function setupScope(scope)
        {
            this.scope = (scope ? (scope.toObject ? scope : new ActiveEvent.ObservableHash(scope)) : new ActiveEvent.ObservableHash({}));
            for(var key in this.scope._object)
            {
                var item = this.scope._object[key];
            }
        },
        /**
         * ActiveView.Class#get(key) -> mixed
         **/
        get: function get(key)
        {
            return this.scope.get(key);
        },
        /**
         * ActiveView.Class#set(key,value[,suppress_notifications]) -> mixed
         **/
        set: function set(key,value,suppress_observers)
        {
            return this.scope.set(key,value,suppress_observers);
        },
        /**
         * ActiveView.Class#attachTo(element) -> Element
         * Inserts the view's outer most element into the passed element.
         **/
        attachTo: function attachTo(element)
        {
            element.appendChild(this.getElement());
            return this.element;
        },
        setElement: function setElement(element)
        {
            this.element = element;
        },
        /**
         * ActiveView.Class#getElement() -> Element
         **/
        getElement: function getElement()
        {
            return this.element;
        },
        /**
         * ActiveView.Class#getScope() -> ActiveEvent.ObservableHash
         * Get's the current scope/data in your view. Note that modifying this
         * object may trigger changes in the view. Use `exportScope` to get copy
         * of the data that is safe to mutate.
         **/
        getScope: function getScope()
        {
            return this.scope;
        },
        /**
         * ActiveView.Class#exportScope() -> Object
         * Gets a plain hash of the scope/data in your view.
         **/
        exportScope: function exportScope()
        {
            return ActiveSupport.Object.clone(this.scope.toObject());
        }
    };
})();

var ClassMethods = (function(){
    return {
        /**
         * ActiveView.Class.getInstance([params]) -> Object
         * Returns an instance of the ActiveView.Class, initializing it
         * if necessary.
         **/
        getInstance: function getInstance(params)
        {
            if(!this.instance)
            {
                this.instance = new this(params || {});
            }
            return this.instance;
        }
    };
})();

var Errors = {
    ViewDoesNotReturnelement: ActiveSupport.createError('The view constructor must return a DOM element, or set this.element as a DOM element. View constructor returned: %'),
    InvalidContent: ActiveSupport.createError('The content to render was not a string, DOM element or ActiveView.'),
    MismatchedArguments: ActiveSupport.createError('Incorrect argument type passed: Expected %. Recieved %:%')
};
/**
 * ActiveView.Builder
 * See the [[ActiveView]] or [[ActiveView.Builder.tag]] for usage.
 *
 * Contains the following DOM Element generator methods:
 * - abbr
 * - acronym
 * - address
 * - applet
 * - area
 * - b
 * - base
 * - basefont
 * - bdo
 * - big
 * - blockquote
 * - body
 * - br
 * - button
 * - canvas
 * - caption
 * - center
 * - cite
 * - code
 * - col
 * - colgroup
 * - dd
 * - del
 * - dfn
 * - dir
 * - div
 * - dl
 * - dt
 * - em
 * - embed
 * - fieldset
 * - font
 * - form
 * - frame
 * - frameset
 * - h1
 * - h2
 * - h3
 * - h4
 * - h5
 * - h6
 * - head
 * - hr
 * - html
 * - i
 * - iframe
 * - img
 * - input
 * - ins
 * - isindex
 * - kbd
 * - label
 * - legend
 * - li
 * - link
 * - map
 * - menu
 * - meta
 * - nobr
 * - noframes
 * - noscript
 * - object
 * - ol
 * - optgroup
 * - option
 * - p
 * - param
 * - pre
 * - q
 * - s
 * - samp
 * - script
 * - select
 * - small
 * - span
 * - strike
 * - strong
 * - style
 * - sub
 * - sup
 * - table
 * - tbody
 * - td
 * - textarea
 * - tfoot
 * - th
 * - thead
 * - title
 * - tr
 * - tt
 * - u
 * - ul
 * - var
 **/
var Builder = {
    tags: ('A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY ' +
        'BR BUTTON CANVAS CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM EMBED FIELDSET ' +
        'FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX '+
        'KBD LABEL LEGEND LI LINK MAP MENU META NOBR NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P '+
        'PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD '+
        'TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR').split(/\s+/),
    processNodeArgument: function processNodeArgument(elements,attributes,argument)
    {
        if(typeof(argument) === 'undefined' || argument === null || argument === false)
        {
            return;
        }
        if(typeof(argument) === 'function' && !ActiveView.isActiveViewClass(argument))
        {
            argument = argument();
        }
        if(ActiveView.isActiveViewInstance(argument) || typeof(argument.getElement) == 'function')
        {
            elements.push(argument.getElement());
        }
        else if(ActiveView.isActiveViewClass(argument))
        {
            elements.push(new argument().getElement());
        }
        else if(typeof(argument) !== 'string' && typeof(argument) !== 'number' && !(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument) && !(argument && argument.nodeType === 1))
        {
            for(attribute_name in argument)
            {
                attributes[attribute_name] = argument[attribute_name];
            }
        }
        else if(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument)
        {
            for(ii = 0; ii < argument.length; ++ii)
            {
                Builder.processNodeArgument(elements,attributes,argument[ii]);
            }
        }
        else if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number')
        {
            elements.push(argument);
        }
    },
    /**
     * ActiveView.Builder.tag([content][,attributes][,child_nodes]) -> Element
     * - content (String | Number | Function): The content to be inserted in the node.
     * - attributes (Object): Hash of HTML attributes, must use "className" instead of "class".
     * - child_nodes (Array | Element | Function): May be an array of child nodes, a callback function or an Element
     *
     * **This method refers to tag methods, "br", "li", etc not a method named "tag".**
     *
     *  tag() methods accept a variable number of arguments. You can pass multiple
     *  `content` arguments, `attributes` hashes or child nodes (as an array or single
     *  elements) in any order.
     *
     *     builder.ul(builder.li('a'),builder.li('b'),{className:'my_list'});
     *     builder.ul({className:'my_list'},[builder.li('a'),builder.li('b')]);
     *
     * Functions that are passed in will be called, and the response treated as
     * an argument, this could be one of the tag methods:
     *
     *     builder.p('First line',builder.br,'Second Line')
     *
     * it could also be a class method, or an inline function:
     *
     *     builder.p('First line',my_view_method,'Second Line')
     **/
    generator: function generator(target,scope)
    {
        var global_context = ActiveSupport.getGlobalContext();
        for(var t = 0; t < Builder.tags.length; ++t)
        {
            var tag = Builder.tags[t];
            (function tag_iterator(tag){
                target[tag.toLowerCase()] = target[tag] = function node_generator(){
                    var i, ii, argument, attributes, attribute_name, elements, element;
                    elements = [];
                    attributes = {};
                    for(i = 0; i < arguments.length; ++i)
                    {
                        Builder.processNodeArgument(elements,attributes,arguments[i]);
                    }
                    element = ActiveSupport.Element.create(tag,attributes);
                    for(i = 0; i < elements.length; ++i)
                    {
                        if(elements[i] && elements[i].nodeType === 1)
                        {
                            element.appendChild(elements[i]);
                        }
                        else
                        {
                            element.appendChild(global_context.document.createTextNode(String(elements[i])));
                        }
                    }
                    return element;
                };
            })(tag);
        }
    }
};

ActiveView.Builder = {};
Builder.generator(ActiveView.Builder);

})();