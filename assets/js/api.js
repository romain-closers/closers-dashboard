/* ============================================================
   API CLIENT — wrapper JSONP vers le GAS Web App
   Utilise JSONP au lieu de fetch() pour bypasser CORS sur Apps Script.
   ============================================================ */

window.CLOSERS_API = (function() {

  var GAS_URL_INTERNAL = "https://script.google.com/macros/s/AKfycbzDt5qGGzQR2L9sD73VWPZ2ydiS2PUCH_G3_F3D4zRL7Fihzlu0gKHqFHz3EZtXwXrZ6w/exec";
  var GAS_URL_CLIENT   = "https://script.google.com/macros/s/AKfycbxre2CyT59AmZ_h4aR7t1uVtEScs7-i-FMvkvxozEt1mvrCB9BMdnbkdDZT2ROTJbM2eg/exec";

  var JSONP_TIMEOUT_MS = 30000;

  function call(baseUrl, params) {
    return new Promise(function(resolve, reject) {
      var cbName = "_jsonp_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      var qs = Object.keys(params)
        .filter(function(k) { return params[k] !== undefined && params[k] !== null && params[k] !== ""; })
        .map(function(k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
        .join("&");
      var url = baseUrl + "?" + qs + (qs ? "&" : "") + "callback=" + cbName;

      var script = document.createElement("script");
      var timeoutId;

      function cleanup() {
        clearTimeout(timeoutId);
        if (window[cbName]) delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = function(json) {
        cleanup();
        if (!json || !json.ok) {
          reject(new Error((json && json.error) || "Erreur inconnue"));
        } else {
          resolve(json.data);
        }
      };

      script.onerror = function() {
        cleanup();
        reject(new Error("Erreur réseau — impossible de joindre l'API"));
      };

      timeoutId = setTimeout(function() {
        cleanup();
        reject(new Error("Timeout — l'API n'a pas répondu dans les temps"));
      }, JSONP_TIMEOUT_MS);

      script.src = url;
      document.body.appendChild(script);
    });
  }

  function getAuthToken() {
    // Lecture directe pour éviter une dépendance circulaire avec auth.js
    try {
      return new URLSearchParams(window.location.search).get("token")
          || localStorage.getItem("closers_token")
          || "";
    } catch (e) { return ""; }
  }

  return {
    health: function() {
      return call(GAS_URL_INTERNAL, { action: "health" });
    },
    whoami: function(token) {
      // whoami accepte un token explicite OU récupère celui en cours
      var t = token || getAuthToken();
      // On tente d'abord sur l'URL interne (gère internes ET fallback client si token client)
      // Mais comme les 2 web apps partagent le code, on peut aussi tenter la track client.
      // Pour simplifier : si le token résout en interne via Track A → ok
      // Sinon le frontend retombe sur Track B (vue client).
      return call(GAS_URL_INTERNAL, { action: "whoami", token: t });
    },
    board: function(params) {
      return call(GAS_URL_INTERNAL, Object.assign({ action: "board", token: getAuthToken() }, params || {}));
    },
    management: function(params) {
      return call(GAS_URL_INTERNAL, Object.assign({ action: "management", token: getAuthToken() }, params || {}));
    },
    client: function(token, params) {
      return call(GAS_URL_CLIENT, Object.assign({ action: "client", token: token || getAuthToken() }, params || {}));
    }
  };
})();
