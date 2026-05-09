/* ============================================================
   AUTH — gestion du token (interne ou client)

   Le token vient soit :
   - de l'URL (?token=XXX) à la 1ère visite via magic link
   - du localStorage aux visites suivantes (persisté entre sessions)

   Le serveur résout le rôle (interne board/management ou client) à
   partir du même token via whoami.
   ============================================================ */

window.CLOSERS_AUTH = (function() {

  var TOKEN_STORAGE_KEY = "closers_token";

  function getTokenFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

  /**
   * Retourne le token actif, en privilégiant l'URL puis le localStorage.
   * Si le token vient de l'URL, on le persiste dans localStorage et on le
   * retire de l'URL pour ne pas l'exposer dans l'historique du navigateur.
   */
  function getToken() {
    var urlToken = getTokenFromUrl();
    if (urlToken) {
      try { localStorage.setItem(TOKEN_STORAGE_KEY, urlToken); } catch (e) {}
      // Nettoyer l'URL (sans recharger la page)
      try {
        var newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {}
      return urlToken;
    }
    try { return localStorage.getItem(TOKEN_STORAGE_KEY) || ""; } catch (e) { return ""; }
  }

  function clearToken() {
    try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch (e) {}
  }

  function isClientView() {
    return !!getTokenFromUrl() || !!localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  function getCurrentRole() {
    return CLOSERS_API.whoami(getToken()).then(function(info) {
      return info; // { kind: "internal|client|anonymous", role?, displayName?, clientName? }
    });
  }

  function requireRole(allowedRoles) {
    return getCurrentRole().then(function(info) {
      if (info.kind === "client") return info;
      if (info.kind === "internal" && allowedRoles.indexOf(info.role) !== -1) return info;
      throw new Error("Accès refusé pour " + (info.role || info.kind));
    });
  }

  return {
    getToken: getToken,
    getTokenFromUrl: getTokenFromUrl,
    clearToken: clearToken,
    isClientView: isClientView,
    getCurrentRole: getCurrentRole,
    requireRole: requireRole
  };
})();
