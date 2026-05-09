/* ============================================================
   API CLIENT — wrapper fetch vers le GAS Web App
   ============================================================ */

window.CLOSERS_API = (function() {

  // ⚠️ À REMPLIR APRÈS DÉPLOIEMENT GAS
  // L'URL du Web App déployé. Format :
  //   https://script.google.com/macros/s/XXXXXXXX/exec
  // Mettre la même URL pour les deux tracks (ou des URLs distinctes
  // si tu as déployé séparément interne / client).
  var GAS_URL_INTERNAL = "https://script.google.com/macros/s/AKfycbzDt5qGGzQR2L9sD73VWPZ2ydiS2PUCH_G3_F3D4zRL7Fihzlu0gKHqFHz3EZtXwXrZ6w/exec";
  var GAS_URL_CLIENT   = "https://script.google.com/macros/s/AKfycbxre2CyT59AmZ_h4aR7t1uVtEScs7-i-FMvkvxozEt1mvrCB9BMdnbkdDZT2ROTJbM2eg/exec";

  function buildUrl(baseUrl, params) {
    var qs = Object.keys(params)
      .filter(function(k) { return params[k] !== undefined && params[k] !== null && params[k] !== ""; })
      .map(function(k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
      .join("&");
    return baseUrl + (qs ? "?" + qs : "");
  }

  function call(baseUrl, params) {
    var url = buildUrl(baseUrl, params);
    return fetch(url, { method: "GET", credentials: "omit" })
      .then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function(json) {
        if (!json.ok) throw new Error(json.error || "Erreur inconnue");
        return json.data;
      });
  }

  return {
    health: function() {
      return call(GAS_URL_INTERNAL, { action: "health" });
    },
    whoami: function(token) {
      var url = token ? GAS_URL_CLIENT : GAS_URL_INTERNAL;
      return call(url, { action: "whoami", token: token || "" });
    },
    board: function(params) {
      return call(GAS_URL_INTERNAL, Object.assign({ action: "board" }, params || {}));
    },
    management: function(params) {
      return call(GAS_URL_INTERNAL, Object.assign({ action: "management" }, params || {}));
    },
    client: function(token, params) {
      return call(GAS_URL_CLIENT, Object.assign({ action: "client", token: token }, params || {}));
    }
  };
})();
