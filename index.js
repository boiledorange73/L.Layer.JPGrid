// 最南端: 沖ノ鳥島 20°25′31″→ 20.4252777778 → 20.4
// 最西端: 与那国島	122°55′57″→ 122.9325 → 122.9
// 最北端: 択捉島	45°33′26″→ 45.5572222222 → 45.6
// 最東端: 南鳥島	153°59′12″→ 153.986666667 → 154.0
window.addEventListener("load", function() {
  // 2024-04-01 Modified: Adds GSI layers.
  var baseMaps = {
    "OpenStreetMap": L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        "maxZoom": 19,
        "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
      }
    ),
    "地理院地図": L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        "maxZoom": 18,
        "attribution": "<a href=\"https://maps.gsi.go.jp/development/ichiran.html\" target=\"_blank\">地理院タイル</a>"
      }
    ),
    "地理院淡色地図": L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
        "maxZoom": 18,
        "attribution": "<a href=\"https://maps.gsi.go.jp/development/ichiran.html\" target=\"_blank\">地理院タイル</a>"
      }
    ),
    "地理院空中写真": L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
        "maxZoom": 18,
        "attribution": "<a href=\"https://maps.gsi.go.jp/development/ichiran.html\" target=\"_blank\">地理院タイル</a>"
      }
    )
  };
  // overlays
  var jpgridgroup = BO.L.layer.jpgridgroup();
  var overlays = {
      "地域メッシュコード": jpgridgroup
  };
  // Creates the map instance.
  var map = L.map('MAP', {
    "layers": [baseMaps["地理院淡色地図"],jpgridgroup],
    "maxZoom": 16,
  });
  // Adds layer control
  var layercontrol = L.control.layers(baseMaps, overlays).addTo(map);
  // Sets view.
  //  map.setView([35, 135], 14);
  map.fitBounds([[20.4, 122.9],[45.6,154.0]]);
  // Adds JPGrid Control
  BO.L.control.jpgridcode().addTo(map);
});
