// Also BO.L.Control.JPGridCode.css is required.
(function(global) {
    "use strict";
    if( !global.BO ) {
        global.BO = {};
    }
    var BO = global.BO;
    //
    if( !BO.L ) {
        BO.L = {};
    }
    if( !BO.L.Control ) {
        BO.L.Control = {};
    }
    // 2024-04-02 Added
    // returns formatted box value
    function fmtbox(box) {
      var len = box ? box.length : 0;
      var arr = [];
      for( var n = 0; n < len; n++ ) {
        var v = box[n];
        arr[n] = v ? v.toFixed(5) : "";
      }
      return "(" + arr.join(", ") + ")";
    }
    /**
     * The control showing Region Grid Code of JP
     */
    BO.L.Control.JPGridCode = L.Control.extend({
        "options": {
            "level": 3,
            "shows_box": true,
            "position": "bottomleft"
        },
        "onAdd": function onAdd(map) {
            var ret = L.DomUtil.create("div");
            var e_main = L.DomUtil.create("div", "bo-control-jpgridcode");
            ret.appendChild(e_main);
            this._e_main = e_main;
            map.on("mousemove", this._onMouseMove, this);
            return ret;
        },
        "onRemove": function onAdd(map) {
            map.off("mosuemove", this._onMouseMove, this);
        },
        "_onMouseMove": function _onMouseMove(ev) {
            if( !this._e_main ) {
                return;
            }
            var text = null;
            if( ev && ev.latlng ) {
                var code = BO.UT.JPGrid.latlng2jpgridcode(
                    ev.latlng.lat, ev.latlng.lng, this.options.level
                );
                if( code != null ) {
                    var box = null;
                    if( this.options.shows_box ) {
                        box = BO.UT.JPGrid.jpgridcode2box(code); // 2024-04-02 Added
                    }
                    if( box == null ) {
                        text = code;
                    }
                    else {
                        text = code + " " + fmtbox(box);
                    }
                }
            }
            if( text ) {
                this._e_main.innerText = text;
            }
            else {
                this._e_main.innerText = "";
            }
        }
    });
    if( !BO.L.control ) {
        BO.L.control = {};
    }
    BO.L.control.jpgridcode = function jpgridcode(options) {
        return new BO.L.Control.JPGridCode(options);
    };
} )( typeof window !== "undefined" ? window : this );
