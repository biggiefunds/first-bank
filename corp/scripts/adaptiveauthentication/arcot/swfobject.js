/**
 * SWFObject v1.5: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
if (typeof deconcept == "undefined") var deconcept = new Object();
if (typeof deconcept.util == "undefined") deconcept.util = new Object();
if (typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = new Object();

deconcept.SWFObject = function(swf, id, w, h, ver, c, quality, xiRedirectUrl, redirectUrl, detectKey) {
    if (!document.getElementById) {
        return;
    }
    this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
    this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);

    this.swfobjnames = new Array();
    this.swfobjvalues = new Array();

    this.variablenames = new Array();
    this.variablevalues = new Array();

    this.attributes = new Array();

    if (swf) {
        this.setAttribute('swf', swf);
    }
    if (id) {
        this.setAttribute('id', id);
    }
    if (w) {
        this.setAttribute('width', w);
    }
    if (h) {
        this.setAttribute('height', h);
    }
    if (ver) {
        this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split(".")));
    }
    this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
    if (!window.opera && document.all && this.installedVer.major > 7) {
        deconcept.SWFObject.doPrepUnload = true;
    }
    if (c) {
        this.addParam('bgcolor', c);
    }
    var q = quality ? quality : 'high';
    this.addParam('quality', q);
    this.setAttribute('useExpressInstall', false);
    this.setAttribute('doExpressInstall', false);

    var xir = (xiRedirectUrl) ? xiRedirectUrl : window.location;
    this.setAttribute('xiRedirectUrl', xir);
    this.setAttribute('redirectUrl', '');

    if (redirectUrl) {
        this.setAttribute('redirectUrl', redirectUrl);
    }

}
deconcept.SWFObject.prototype = {
    useExpressInstall: function(path) {
        this.xiSWFPath = !path ? "expressinstall.swf" : path;
        this.setAttribute('useExpressInstall', true);
    },
    setAttribute: function(name, value) {
        this.attributes[name] = value;
    },
    getAttribute: function(name) {
        return this.attributes[name];
    },
    addParam: function(name, value) {
        this.swfobjnames[this.swfobjnames.length] = name;
        this.swfobjvalues[this.swfobjvalues.length] = value;
    },
    getSwfNames: function() {

        return this.swfobjnames;
    },
    getSwfValues: function() {
        return this.swfobjvalues;
    },
    addVariable: function(name, value) {
        this.variablenames[this.variablenames.length] = name;
        this.variablevalues[this.variablevalues.length] = value;
    },
    getVariableValues: function() {
        return this.variablevalues;
    },
    getVariableNames: function() {
        return this.variablenames;
    },
    getVariablePairs: function() {
        var variablePairs = new Array();
        var vn = this.getVariableNames();
        var vv = this.getVariableValues();
        for (var i = 0; i < vn.length; i++) {
            variablePairs[i] = vn[i] + "=" + vv[i];
        }
        return variablePairs;
    },
    getSWFHTML: function() {
        var swfNode = "";
        var pageDomain = location.hostname;
        this.addVariable("pageDomain", pageDomain);
        if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "PlugIn");
                this.setAttribute('swf', this.xiSWFPath);
            }
            swfNode = '<embed type="application/x-shockwave-flash" src="' + this.getAttribute('swf') + '" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '"';
            swfNode += ' id="' + this.getAttribute('id') + '" name="' + this.getAttribute('id') + '" ';

            var swfObjNames = this.getSwfNames();
            var swfObjValues = this.getSwfValues();
            for (var i = 0; i < swfObjNames.length; i++) {
                swfNode += swfObjNames[i] + '="' + swfObjValues[i] + '" ';
            }

            var varPairs = this.getVariablePairs();
            if (varPairs.length > 0) {
                swfNode += 'flashvars="';
                for (var i = 0; i < varPairs.length; i++) {
                    swfNode += varPairs[i] + '&';
                }
            }
            swfNode += '"/>';
        } else {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "ActiveX");
                this.setAttribute('swf', this.xiSWFPath);
            }
            swfNode = '<object id="' + this.getAttribute('id') + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '">';
            swfNode += '<param name="movie" value="' + this.getAttribute('swf') + '" />';

            var swfObjNames = this.getSwfNames();
            var swfObjValues = this.getSwfValues();
            for (var i = 0; i < swfObjNames.length; i++) {
                swfNode += '<param name="' + swfObjNames[i] + '" value="' + swfObjValues[i] + '" />';
            }

            var varPairs = this.getVariablePairs();
            if (varPairs.length > 0) {
                swfNode += '<param name="flashvars" value="';
                for (var i = 0; i < varPairs.length; i++) {
                    swfNode += varPairs[i] + '&';
                }
                swfNode += '" />';
            }
            swfNode += "</object>";
        }
        //alert(swfNode);
        return swfNode;
    },
    write: function(elementId) {
        if (this.getAttribute('useExpressInstall')) {
            // check to see if we need to do an express install
            var expressInstallReqVer = new deconcept.PlayerVersion([6, 0, 65]);
            if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
                this.setAttribute('doExpressInstall', true);
                this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
                document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                this.addVariable("MMdoctitle", document.title);
            }
        }
        if (this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))) {
            var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
            n.innerHTML = this.getSWFHTML();
            return true;
        } else {
            if (this.getAttribute('redirectUrl') != "") {
                document.location.replace(this.getAttribute('redirectUrl'));
            }
        }
        return false;
    }
}

deconcept.SWFObjectUtil.getPlayerVersion = function() {
    var PlayerVersion = new deconcept.PlayerVersion([0, 0, 0]);
    if (navigator.plugins && navigator.mimeTypes.length) {
        var x = navigator.plugins["Shockwave Flash"];
        if (x && x.description) {
            PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
        }
    } else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) {
        var axo = 1;
        var counter = 3;
        while (axo) {
            try {
                counter++;
                axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + counter);
                PlayerVersion = new deconcept.PlayerVersion([counter, 0, 0]);
            } catch (e) {
                axo = null;
            }
        }
    } else {
        try {
            var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        } catch (e) {
            try {
                var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                PlayerVersion = new deconcept.PlayerVersion([6, 0, 21]);
                axo.AllowScriptAccess = "always";
            } catch (e) {
                if (PlayerVersion.major == 6) {
                    return PlayerVersion;
                }
            }
            try {
                axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            } catch (e) {}
        }
        if (axo != null) {
            PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
        }
    }
    return PlayerVersion;
}

deconcept.PlayerVersion = function(arrVersion) {
    this.major = arrVersion[0] != null ? parseInt(arrVersion[0]) : 0;
    this.minor = arrVersion[1] != null ? parseInt(arrVersion[1]) : 0;
    this.rev = arrVersion[2] != null ? parseInt(arrVersion[2]) : 0;
}

deconcept.PlayerVersion.prototype.versionIsValid = function(fv) {
    if (this.major < fv.major) return false;
    if (this.major > fv.major) return true;
    if (this.minor < fv.minor) return false;
    if (this.minor > fv.minor) return true;
    if (this.rev < fv.rev) return false;
    return true;
}
deconcept.util = {
    getRequestParameter: function(param) {
        var q = document.location.search || document.location.hash;
        if (param == null) {
            return q;
        }
        if (q) {
            var pairs = q.substring(1).split("&");
            for (var i = 0; i < pairs.length; i++) {
                if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                    return pairs[i].substring((pairs[i].indexOf("=") + 1));
                }
            }
        }
        return "";
    }
}
deconcept.SWFObjectUtil.cleanupSWFs = function() {
    var objects = document.getElementsByTagName("OBJECT");
    for (var i = objects.length - 1; i >= 0; i--) {
        objects[i].style.display = 'none';
        for (var x in objects[i]) {
            if (typeof objects[i][x] == 'function') {
                objects[i][x] = function() {};
            }
        }
    }
}
if (deconcept.SWFObject.doPrepUnload) {
    if (!deconcept.unloadSet) {
        deconcept.SWFObjectUtil.prepUnload = function() {
            __flash_unloadHandler = function() {};
            __flash_savedUnloadHandler = function() {};
            window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs);
        }
        window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
        deconcept.unloadSet = true;
    }
}
if (!document.getElementById && document.all) {
    document.getElementById = function(id) {
        return document.all[id];
    }
}
var getQueryParamValue = deconcept.util.getRequestParameter;
var FlashObject = deconcept.SWFObject;
var SWFObject = deconcept.SWFObject;