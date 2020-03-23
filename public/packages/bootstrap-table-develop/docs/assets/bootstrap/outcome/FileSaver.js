/*
 @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js
 */
var module$FileSaver = {}, saveAs$$module$FileSaver = saveAs$$module$FileSaver || function (b) {
    if (!("undefined" === typeof b || "undefined" !== typeof navigator && /MSIE [1-9]\./.test(navigator.userAgent))) {
        var f = b.document.createElementNS("http://www.w3.org/1999/xhtml", "a"), q = "download" in f,
            r = /constructor/i.test(b.HTMLElement) || b.safari, h = /CriOS\/[\d]+/.test(navigator.userAgent),
            k = b.setImmediate || b.setTimeout, t = function (a) {
                k(function () {
                    throw a;
                }, 0)
            }, l = function (a) {
                setTimeout(function () {
                    "string" === typeof a ? (b.URL ||
                        b.webkitURL || b).revokeObjectURL(a) : a.remove()
                }, 4E4)
            }, m = function (a) {
                return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type) ? new Blob([String.fromCharCode(65279), a], {type: a.type}) : a
            }, p = function (a, c, u) {
                u || (a = m(a));
                var d = this, n = "application/octet-stream" === a.type, g = function () {
                    var a = ["writestart", "progress", "write", "writeend"];
                    a = [].concat(a);
                    for (var b = a.length; b--;) {
                        var c = d["on" + a[b]];
                        if ("function" === typeof c) try {
                            c.call(d, d)
                        } catch (v) {
                            t(v)
                        }
                    }
                };
                d.readyState = d.INIT;
                if (q) {
                    var e = (b.URL || b.webkitURL || b).createObjectURL(a);
                    k(function () {
                        f.href = e;
                        f.download = c;
                        var a = new MouseEvent("click");
                        f.dispatchEvent(a);
                        g();
                        l(e);
                        d.readyState = d.DONE
                    }, 0)
                } else (function () {
                    if ((h || n && r) && b.FileReader) {
                        var c = new FileReader;
                        c.onloadend = function () {
                            var a = h ? c.result : c.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                            b.open(a, "_blank") || (b.location.href = a);
                            d.readyState = d.DONE;
                            g()
                        };
                        c.readAsDataURL(a);
                        d.readyState = d.INIT
                    } else e || (e = (b.URL || b.webkitURL || b).createObjectURL(a)), n ? b.location.href =
                        e : b.open(e, "_blank") || (b.location.href = e), d.readyState = d.DONE, g(), l(e)
                })()
            }, c = p.prototype;
        if ("undefined" !== typeof navigator && navigator.msSaveOrOpenBlob) return function (a, b, c) {
            b = b || a.name || "download";
            c || (a = m(a));
            return navigator.msSaveOrOpenBlob(a, b)
        };
        c.abort = function () {
        };
        c.readyState = c.INIT = 0;
        c.WRITING = 1;
        c.DONE = 2;
        c.error = c.onwritestart = c.onprogress = c.onwrite = c.onabort = c.onerror = c.onwriteend = null;
        return function (a, b, c) {
            return new p(a, b || a.name || "download", c)
        }
    }
}("undefined" !== typeof self && self || "undefined" !==
    typeof window && window || this);
module$FileSaver.saveAs = saveAs$$module$FileSaver;
