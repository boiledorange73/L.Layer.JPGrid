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
     * returned shallowly copied latlng.
     * @parm latlng LatLng.
     * @return {lat,lng} or null if parm is null.
     */
    function copyLatLng(latlng) {
        return latlng ? {"lat": latlng.lat, "lng": latlng.lng} : null;
    }
    /**
     * Grid Layer
     */
    BO.L.Layer.Grid = L.Layer.extend({
        "options": {
            "opacity": 1.0,
            "origin": null,
            "diagonal": null,
            "columns": 0,
            "rows": 0,
            "minZoom": null,
            "maxZoom": null,
            "borderWidth": 1,
            "borderStyle": "rgb(255,0,0)",
            "borderBorderWidth": 0,
            "borderBorderStyle": "rgb(255,255,255)"
        },
        "initialize": function initialize(options) {
            L.Util.setOptions(this, options);
            this._rows = this.options.rows;
            this._columns = this.options.columns;
            this._diagonal = copyLatLng(this.options.diagonal);
            this._origin = copyLatLng(this.options.origin);
        },
        "onAdd": function onAdd(map) {
            this._map = map;
            if( !this._canvas ) {
                this._canvas = L.DomUtil.create("canvas");
            }
            map._panes.overlayPane.appendChild(this._canvas);
            map.on("moveend", this._draw, this);
            this._draw();
        },
        "onRemove": function onRemove(map) {
            map.getPanes().overlayPane.removeChild(this._canvas);
            map.off('moveend', this._draw, this);
            if (map.options.zoomAnimation) {
                map.off('zoomanim', this._animateZoom, this);
            }
        },
        "rows": function setRows(value) {
            if( arguments && arguments.length > 0 ) {
                this._rows = value;
                this._draw();
                return this;
            }
            return this._rows;
        },
        "columns": function setColumns(value) {
            if( arguments && arguments.length > 0 ) {
                this._columns = value;
                this._draw();
                return this;
            }
            return this._columns;
        },
        "origin": function origin(value) {
            if( arguments && arguments.length > 0 ) {
                this._origin = value;
                this._draw();
                return this;
            }
            return this._origin;
        },
        "diagonal": function diagonal(value) {
            if( arguments && arguments.length > 0 ) {
                this._diagonal = value;
                this._draw();
                return this;
            }
            return this._diagonal;
        },
        /**
         * Draw one cell.
         * @param ctx 2D context of the canvas.
         * @param r Row index of the grid.
         * @param c Column index of the grid.
         * @param poly_p A simple polygon in the pixel coordinate system.
         * @param poly_ll A simple polygon in the geodetic (latitude and longitude) coordinate system.
         */
        "drawOne": null,
        // Private methods
        "_fit_canvas": function _fit_canvas() {
            if( !this._map ) {
                return null;
            }
            var topLeft = this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest());
            var size = this._map.latLngToLayerPoint(
                this._map.getBounds().getSouthEast()
            )._subtract(topLeft);
            L.DomUtil.setPosition(this._canvas, topLeft);
            this._canvas.width = size.x;
            this._canvas.height = size.y;
            return this;
        },
        "_draw_border": function _draw_border(ctx, grid_points, rmin, cmin, rmax, cmax, width, style) {
            var rlen, rix, r, clen, cix, c;
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = style;
            // horizontal lines
            for( rix = 0, r = rmin; r <= rmax; rix++, r++ ) {
                ctx.moveTo(grid_points[rix][0].x, grid_points[rix][0].y);
                for( cix = 1, c = cmin+1; c <= cmax; cix++, c++ ) {
                    ctx.lineTo(grid_points[rix][cix].x, grid_points[rix][cix].y);
                }
            }
            // vertical lines
            for( cix = 0, c = cmin; c <= cmax; cix++, c++ ) {
                ctx.moveTo(grid_points[0][cix].x, grid_points[0][cix].y);
                for( rix = 1, r = rmin+1; r <= rmax; rix++, r++ ) {
                    ctx.lineTo(grid_points[rix][cix].x, grid_points[rix][cix].y);
                }
            }
            ctx.stroke();
        },
        "_draw": function _draw() {
            // checks whether this is locked.
            if( this._locked ) {
                this._need_draw = true;
                return this;
            }
            this._need_draw = false;
            // checks whether this has a map and a canvas.
            if( !this._map || !this._canvas ) {
                return this;
            }
            // fits the canvas to map div.
            this._fit_canvas();
            // sets opacity
            L.DomUtil.setOpacity(this._canvas, this.options.opacity);
            // needs origin and diagonal
            if( !this._origin || ! this._diagonal ) {
                return this;
            }
            // gets context
            var ctx = this._canvas ? this._canvas.getContext("2d") : null;
            if( !ctx ) {
                return this;
            }
            // clears all
            ctx.clearRect(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);
            // check zoom
            var zoom = this._map.getZoom();
            if( this.options.maxZoom !== null && zoom > this.options.maxZoom ) {
                return;
            }
            if( this.options.minZoom !== null && zoom < this.options.minZoom ) {
                return;
            }
            //
            var vb = this._map.getBounds();
            // r = rows*(vb.lat-org.lat)/(diag.lat-org.lat)
            var org = this._origin;
            var dag = this._diagonal;
            var dlt = {"lat": dag.lat - org.lat, "lng": dag.lng - org.lng};
            var rows = this._rows;
            var cols = this._columns;
            // rows in the view
            var rmin = parseInt(rows * (vb.getSouth()-org.lat)/dlt.lat);
            var rmax = parseInt(rows * (vb.getNorth()-org.lat)/dlt.lat);
            var r;
            if( rmin > rmax ) {
                r = rmin;
                rmin = rmax;
                rmax = r;
            }
            // forces rows into extent
            if( rmin < 0 ) {
                rmin = 0;
            }
            if( rmax > rows - 1 ) {
                rmax = rows - 1;
            }
            // columns in the view
            var cmin = parseInt(cols * (vb.getWest()-org.lng)/dlt.lng);
            var cmax = parseInt(cols * (vb.getEast()-org.lng)/dlt.lng);
            var c;
            if( cmin > cmax ) {
                c = cmin;
                cmin = cmax;
                cmax = c;
            }
            // forces columns into extent
            if( cmin < 0 ) {
                cmin = 0;
            }
            if( cmax > cols - 1 ) {
                cmax = cols - 1;
            }
            // topLeft's position (pixel)
            var topLeft = this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest());
            // calculates all points (rmin,cmin to rmax+1,cmax+1)
            var grid_latlngs = [];
            var grid_points = [];
            var rcnt = rmax-rmin+1;
            var ccnt = cmax-cmin+1;
            var rix, r;
            for( rix = 0, r = rmin; r <= rmax+1; rix++, r++ ) {
                // new row
                grid_latlngs[rix] = [];
                grid_points[rix] = [];
                // lat
                var lat = r / rows * dlt.lat + org.lat;
                var cix, c;
                for( cix = 0, c = cmin; c <= cmax+1; cix++, c++ ) {
                    // lng
                    var lng = c / cols * dlt.lng + org.lng;
                    // latlng
                    grid_latlngs[rix][cix] = {"lat":lat, "lng":lng};
                    // latlng to point (may be used by this.drawOne)
                    grid_points[rix][cix] =
                        this._map.latLngToLayerPoint(grid_latlngs[rix][cix]).subtract(topLeft);
                }
            }
            // draws all
            // draws border of border
            if( this.options.borderBorderWidth > 0 ) {
                this._draw_border(
                    ctx, grid_points,
                    rmin, cmin, rmax+1, cmax+1,
                    this.options.borderWidth+2*this.options.borderBorderWidth,
                    this.options.borderBorderStyle
                );
            }
            if( this.options.borderWidth > 0 ) {
                this._draw_border(
                    ctx, grid_points,
                    rmin, cmin, rmax+1, cmax+1,
                    this.options.borderWidth,
                    this.options.borderStyle
                );
            }
            // draws each cell.
            if( this.drawOne && !this.options.hideInternal ) {
                for( rix = 0, r = rmin; r <= rmax; rix++, r++ ) {
                    for( cix = 0, c = cmin; c <= cmax; cix++, c++ ) {
                        var ring_ll = [
                            grid_latlngs[rix][cix],
                            grid_latlngs[rix+1][cix],
                            grid_latlngs[rix+1][cix+1],
                            grid_latlngs[rix][cix+1],
                            grid_latlngs[rix][cix]
                        ];
                        var ring_p = [
                            grid_points[rix][cix],
                            grid_points[rix+1][cix],
                            grid_points[rix+1][cix+1],
                            grid_points[rix][cix+1],
                            grid_points[rix][cix]
                        ];
                        this.drawOne(ctx, r, c, [ring_p], [ring_ll]);
                    }
                }
            }
            return this;
        }
    });
    //
    if( !BO.L.layer ) {
        BO.L.layer = {};
    }
    BO.L.layer.grid = function grid(options) {
        return new BO.L.Layer.Grid(options);
    };

} )( typeof window !== "undefined" ? window : this );
