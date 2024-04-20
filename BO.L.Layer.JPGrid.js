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
    if( !BO.L.Layer ) {
        BO.L.Layer = {};
    }
    /**
     * Gets box of the latlng polygon.
     * @param poly_ll LatLng polygon.
     * @return [latmin, lngmin, latmax, lngmax]
     */
    function poly2box_ll(poly_ll) {
        var latmin, lngmin, latmax, lngmax;
        var first = true;
        var lenr = poly_ll ? poly_ll.length : 0;
        for( var nr = 0; nr < lenr; nr++ ) {
            var ring_ll = poly_ll[nr];
            var lenp = ring_ll ? ring_ll.length : 0;
            for( var np = 0; np < lenp; np++ ) {
                var p_ll = ring_ll[np];
                if( p_ll ) {
                    if( first ) {
                        latmin = latmax = p_ll.lat;
                        lngmin = lngmax = p_ll.lng;
                        first = false;
                    }
                    else {
                        if( p_ll.lat < latmin ) {
                            latmin =  p_ll.lat;
                        }
                        if( p_ll.lat > latmax ) {
                            latmax =  p_ll.lat;
                        }
                        if( p_ll.lng < lngmin ) {
                            lngmin = p_ll.lng;
                        }
                        if( p_ll.lng > lngmax ) {
                            lngmax = p_ll.lng;
                        }
                    }
                }
            }
        }
        if( first ) {
            return null;
        }
        return [latmin,lngmin, latmax,lngmax];
    };
    /**
     * Gets box of the xy polygon.
     * @param poly_p xy polygon.
     * @return [xmin, ymin, xmax, ymax]
     */
    function poly2box_p(poly_p) {
        var xmin, ymin, xmax, ymax;
        var first = true;
        var lenr = poly_p ? poly_p.length : 0;
        for( var nr = 0; nr < lenr; nr++ ) {
            var ring_p = poly_p[nr];
            var lenp = ring_p ? ring_p.length : 0;
            for( var np = 0; np < lenp; np++ ) {
                var p_p = ring_p[np];
                if( p_p ) {
                    if( first ) {
                        xmin = xmax = p_p.x;
                        ymin = ymax = p_p.y;
                        first = false;
                    }
                    else {
                        if( p_p.x < xmin ) {
                            xmin = p_p.x;
                        }
                        if( p_p.x > xmax ) {
                            xmax = p_p.x;
                        }
                        if( p_p.y < ymin ) {
                            ymin = p_p.y;
                        }
                        if( p_p.y > ymax ) {
                            ymax = p_p.y;
                        }
                    }
                }
            }
        }
        if( first ) {
            return null;
        }
        return [xmin,ymin, xmax,ymax];
    };
    /**
     * JPGrid Layer
     */
    BO.L.Layer.JPGrid = BO.L.Layer.Grid.extend({
        "options": {
            "level": 1,
            "fontSize": 16
        },
        "_create_options": function _init(level) {
            switch(parseInt(level)) {
            case 0:
                return {
                    "hideInternal": true,
                    "origin": {"lat":20, "lng":122},
                    "diagonal": {"lat":46, "lng":155},
                    "rows": 1,
                    "columns": 1,
                    "borderWidth": 2,
                    "borderStyle": "rgb(255,0,0)",
                    "borderBorderWidth": 1,
                    "textBorderWidth": 2,
                    "textBorderStyle": "rgb(255,255,255)"
                };
            case 2:
                return {
                    "hideInternal": false,
                    "origin": {"lat":20, "lng":122},
                    "diagonal": {"lat":46, "lng":155},
                    "rows": 26*1.5*8,
                    "columns":(155-122)*8,
                    "borderWidth": 2,
                    "borderStyle": "rgb(0,102,0)",
                    "borderBorderWidth": 1,
                    "textBorderWidth": 2,
                    "textBorderStyle": "rgb(255,255,255)",
                    "minZoom": 10
                };
            case 3:
                return {
                    "hideInternal": false,
                    "origin": {"lat":20, "lng":122},
                    "diagonal": {"lat":46, "lng":155},
                    "rows": 26*1.5*80,
                    "columns":(155-122)*80,
                    "borderWidth": 2,
                    "borderStyle": "rgb(0,0,255)",
                    "borderBorderWidth": 1,
                    "textBorderWidth": 2,
                    "textBorderStyle": "rgb(255,255,255)",
                    "minZoom": 14
                };
            default: /* including 1 */
                return {
                    "hideInternal": false,
                    "origin": {"lat":20, "lng":122},
                    "diagonal": {"lat":46, "lng":155},
                    "rows": 26*1.5,
                    "columns":155-122,
                    "borderWidth": 2,
                    "borderStyle": "rgb(255,0,0)",
                    "borderBorderWidth": 1,
                    "textBorderWidth": 2,
                    "textBorderStyle": "rgb(255,255,255)",
                    "minZoom": 4
                };
            }
        },
        "initialize": function initialize(options) {
            var level = options ? parseInt(options.level) : 1;
            if( level !== 0 && level !== "0" ) {
                level = level>=1 && level<=3 ? level : 1;
            }
            if( options ) {
                var opts = this._create_options(level);
            }
            var new_options = Object.assign({}, opts, options, {"level": level});
            BO.L.Layer.Grid.prototype.initialize.call(this, new_options);
        },
        "drawOne": function drawOne(ctx, r, c, poly_p, poly_ll) {
            // box (latlng)
            var box_ll =  poly2box_ll(poly_ll);
            var latc = 0.5*(box_ll[0]+box_ll[2]);
            var lngc = 0.5*(box_ll[1]+box_ll[3]);
            // text
            var text = BO.UT.JPGrid.latlng2jpgridcode(latc, lngc, this.options.level);
            // box (pixel)
            var box_p = poly2box_p(poly_p);
            var xc = 0.5*(box_p[0]+box_p[2]);
            var yc = 0.5*(box_p[1]+box_p[3]);
            var pw = box_p[2]-box_p[0];
            var ph = box_p[3]-box_p[1];
            // draws
            ctx.font = "" + this.options.fontSize + "px sans-serif";
            var tmesure = ctx.measureText(text);
            var tw = tmesure.width;
            var th = tmesure.actualBoundingBoxAscent + tmesure.actualBoundingBoxDescent;
            if( pw >= tw && ph >= th ) {
                ctx.textBaseline = "middle";
                ctx.lineWidth = this.options.textBorderWidth;
                ctx.strokeStyle = this.options.textBorderStyle;
                ctx.strokeText(text, xc-0.5*tw, yc);
                ctx.fillStyle = this.options.borderStyle;
                ctx.fillText(text, xc-0.5*tw, yc);
            }
        },
    });

    /**
     * Layer group of level 1-3 JP Grid Layer, including 3 JPGrid layers.
     */
    BO.L.Layer.JPGridGroup = L.LayerGroup.extend({
        "options": {
            "level": 1,
            "fontSize": 16,
            "attribution": "<a target=\"_blank\" "+
                "href=\"https://github.com/boiledorange73/Layer.JPGrid\">Layer.JPGrid</a>",
        },
        "initialize": function initialize(options) {
            L.LayerGroup.prototype.initialize.call(
                this,
                [
                    BO.L.layer.jpgrid({"level": 3}),
                    BO.L.layer.jpgrid({"level": 2}),
                    BO.L.layer.jpgrid({"level": 1}),
                    BO.L.layer.jpgrid({"level": 0})
                ],
                options
            );
        },
    });

    //
    if( !BO.L.layer ) {
        BO.L.layer = {};
    }

    BO.L.layer.jpgrid = function jpgrid(options) {
        return new BO.L.Layer.JPGrid(options);
    };

    BO.L.layer.jpgridgroup = function jpgridgroup(options) {
        return new BO.L.Layer.JPGridGroup(options);
    };

} )( typeof window !== "undefined" ? window : this );
