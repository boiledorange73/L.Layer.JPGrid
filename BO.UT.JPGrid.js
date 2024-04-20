(function(global) {
    "use strict";
    if( !global.BO ) {
        global.BO = {};
    }
    if( !global.BO.UT ) {
      global.BO.UT = {};
    }
    if( !global.BO.UT.JPGrid ) {
      global.BO.UT.JPGrid = {};
    }
    var JPGrid = global.BO.UT.JPGrid;

    function _fitnum1(num) {
        return ("0"+parseInt(num)).slice(-1);
    };

    function _fitnum2(num) {
        return ("00"+parseInt(num)).slice(-2);
    };

    /**
     * Generates JP Grid Code
     * @param lat Latitude.
     * @param lng Longitude.
     * @param level Grid code level. Can accept 1, 2 or 3.
     * @return JP Grid Code text.
     */
    JPGrid.latlng2jpgridcode = function latlng2jpgridcode(lat, lng, level) {
        // lat: [20] 20.4252777778  45.5572222222 [46]
        // lng: [122] 122.9325 153.986666667 [155]
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if( !(lat >= 20 && lat <= 46 && lng >= 122 && lng <= 155) ) {
            return null;
        }
        // 1st
        var lats = 3600*lat;
        var lngs = 3600*lng - 360000;
        var ret = _fitnum2(lats/2400) + _fitnum2(lngs/3600);
        lats = lats % 2400;
        lngs = lngs % 3600;
        // 2nd
        if( level >= 2 ) {
            ret = ret + "-" + _fitnum1(lats/300) + _fitnum1(lngs/450);
            lats = lats % 300;
            lngs = lngs % 450;
        }
        // 3rd
        if( level >= 3 ) {
            ret = ret + "-" + _fitnum1(lats/30) + _fitnum1(lngs/45);
            lats = lats % 30;
            lngs = lngs % 45;
        }
        return ret;
    };
    //
    var reg_code1 = /^\s*([0-9]{2})([0-9]{2})\s*$/;
    var reg_code2 = /^\s*([0-9]{2})([0-9]{2})\s*-?\s*([0-9])([0-9])\s*$/;
    var reg_code3 = /^\s*([0-9]{2})([0-9]{2})\s*-?\s*([0-9])([0-9])\s*-?\s*([0-9])([0-9])\s*$/;
    /**
     * Calculates box of specified JP Grid Code.
     * @param code JP Grid Code text.
     * @return [latmin, lngmin, latmax, lngmax]
     */
    JPGrid.jpgridcode2box = function jpgridcode2box(code) {
        if( code == null ) {
            return null;
        }
        var match_result =code.match(reg_code3) || code.match(reg_code2) || code.match(reg_code1);
        if( match_result == null ) {
            return null;
        }
        match_result.shift(); // removes 1st
        var arr = match_result.map((e)=>parseInt(e));
        var level = arr.length / 2;
        var latsecmin, lngsecmin, dlatsec, dlngsec;
        if( level >= 1 ) {
            latsecmin = arr[0] * 2400;
            lngsecmin = (arr[1] + 100) * 3600;
            dlatsec = 2400;
            dlngsec = 3600;
        }
        if( level >= 2 ) {
            latsecmin = latsecmin + arr[2] * 300;
            lngsecmin = lngsecmin + arr[3] * 450;
            dlatsec = 300;
            dlngsec = 450;
        }
        if( level >= 3 ) {
            latsecmin = latsecmin + arr[4] * 30;
            lngsecmin = lngsecmin + arr[5] * 45;
            dlatsec = 30;
            dlngsec = 45;
        }
        return [latsecmin/3600, lngsecmin/3600, (latsecmin+dlatsec)/3600, (lngsecmin+dlngsec)/3600];
    };

} )( typeof window !== "undefined" ? window : this );
