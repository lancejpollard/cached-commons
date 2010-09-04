/**
 * SWFAddress 2.4: Deep linking for Flash and Ajax <http://www.asual.com/swfaddress/>
 *
 * SWFAddress is (c) 2006-2009 Rostislav Hristov and contributors
 * This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 * Uses code from SWFObject 2.1 <http://code.google.com/p/swfobject/>
 * SWFObject is (c) 2007-2009 Geoff Stearns, Michael Williams, and Bobby van der Sluis
 *
 */

var SWFAddressOptimizer = new function() {
 
    var _getWindow = function() {
        try {
            top.document;
            return top;
        } catch (e) {
            return window;
        }
    };
    
    var _checkFlash = function(version){
    
        var rv = version.toString().split('.');
        for (var i = 0; i < 3; i++)
            rv[i] = typeof rv[i] != UNDEFINED ? parseInt(rv[i]) : 0;

        var pv = [0,0,0];
        var d = null;
        
        if (typeof _n.plugins != UNDEFINED && typeof _n.plugins[SHOCKWAVE_FLASH] == OBJECT) {
            d = _n.plugins[SHOCKWAVE_FLASH].description;
            if (d && !(typeof _n.mimeTypes != UNDEFINED && _n.mimeTypes[SHOCKWAVE_FLASH_MIME_TYPE] && !_n.mimeTypes[SHOCKWAVE_FLASH_MIME_TYPE].enabledPlugin)) {
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, '$1');
                pv[0] = parseInt(d.replace(/^(.*)\..*$/, '$1'), 10);
                pv[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, '$1'), 10);
                pv[2] = /r/.test(d) ? parseInt(d.replace(/^.*r(.*)$/, '$1'), 10) : 0;
            }
        } else if (typeof window.ActiveXObject != UNDEFINED) {
            var a = null;
            var fp6Crash = false;
            try {
                a = new ActiveXObject(SHOCKWAVE_FLASH_AX + '.7');
            } catch(e) {
                try { 
                    a = new ActiveXObject(SHOCKWAVE_FLASH_AX + '.6');
                    pv = [6,0,21];
                    a.AllowScriptAccess = 'always';
                } catch(e) {
                    if (pv[0] == 6)
                        fp6Crash = true;
                }
                if (!fp6Crash) {
                    try {
                        a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                    } catch(e) {}
                }
            }
            if (!fp6Crash && typeof a == OBJECT) {
                try {
                    d = a.GetVariable('$version');
                    if (d) {
                        d = d.split(' ')[1].split(',');
                        pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                    }
                } catch(e) {}
            }
        }    
        
        return (pv[0] > rv[0] || (pv[0] == rv[0] && pv[1] > rv[1]) || 
            (pv[0] == rv[0] && pv[1] == rv[1] && pv[2] >= rv[2])) ? true : false;
    };
    
    var _redirect = function(swfaddress, base) {
        var value = _l.href.split(_l.hostname)[1].replace(base, '');
        if (swfaddress != '/' && (!_hash || _index == _l.href.length - 1) && (value != '' && value != '/')) {
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                try {
                    try {
                        xhr = new ActiveXObject('Msxml2.XMLHTTP');
                    } catch(e) {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    }
                } catch(e) {}
            }
            if (xhr) {
                xhr.open('get', ((typeof base != UNDEFINED) ? base : '') + '/?' + swfaddress + (_l.hash != '' ? '&hash=' + _l.hash.replace(/^#/, '') : ''), false);
                xhr.setRequestHeader('Content-Type', 'application/x-swfaddress');
                xhr.send('');
                (new Function(xhr.responseText.replace(/^([^(]*)\(([^)]*)\);?$/, '$1($2);')))();
            }
        } else if (/webkit/i.test(_n.userAgent.toLowerCase()) && _d.referrer == _l.href.replace(/#\/?/, '')) {
                _l.reload();
        }
    };
    
    var OBJECT = 'object',
        SHOCKWAVE_FLASH = 'Shockwave Flash',
        SHOCKWAVE_FLASH_AX = 'ShockwaveFlash.ShockwaveFlash',
        SHOCKWAVE_FLASH_MIME_TYPE = "application/x-shockwave-flash", 
        UNDEFINED = 'undefined', 
        _url,
        _t = _getWindow(),
        _d = _t.document,
        _l = _t.location,
        _n = navigator,
        _index = _l.href.indexOf('#'),
        _hash = (_index != -1),
        _opts = {};
    
    var _searchScript = function(el) {
        if (el.childNodes) {
            for (var i = 0, l = el.childNodes.length, s; i < l; i++) {
                if (el.childNodes[i].src)
                    _url = String(el.childNodes[i].src);
                if (s = _searchScript(el.childNodes[i]))
                    return s;
            }
        }
    };
    
    _searchScript(document);
    var _qi = _url ? _url.indexOf('?') : -1;
    if (_qi != -1) {
        var param, params = _url.substr(_qi + 1).split('&');
        for (var i = 0, p; p = params[i]; i++) {
            param = p.split('=');
            if (/^(base|flash|swfaddress)$/.test(param[0]))
                _opts[param[0]] = unescape(param[1]);
        }
    }
    
    if (_hash && (_index - (_l.href.indexOf(_l.pathname, _l.protocol.length + 2) + 
        _l.pathname.indexOf(_opts.base) + _opts.base.length)) > 1)
        _hash = false;
    
    if (typeof _opts.flash != UNDEFINED) {
        if (_checkFlash(_opts.flash)) {
            _redirect(_opts.swfaddress, _opts.base);
        } else if (_hash) {
            _l.replace(_l.href.replace(/#\/?/, ''));
        }
    } else {
        _redirect(_opts.swfaddress, _opts.base);
    }

    this.toString = function() {
        return '[class SWFAddressOptimizer]';
    };
}
