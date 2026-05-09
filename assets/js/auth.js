/* ============================================================
   AUTH — détecte token URL vs session Workspace
   ============================================================ */

window.CLOSERS_AUTH = (function() {

  function getTokenFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

  function isClientView() {
    return !!getTokenFromUrl();
  }

  function getCurrentRole() {
    return CLOSERS_API.whoami(getTokenFromUrl()).then(function(info) {
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
    getTokenFromUrl: getTokenFromUrl,
    isClientView: isClientView,
    getCurrentRole: getCurrentRole,
    requireRole: requireRole
  };
})();
