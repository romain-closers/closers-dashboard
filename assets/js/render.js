/* ============================================================
   RENDER — composants UI réutilisables
   ============================================================ */

window.CLOSERS_RENDER = (function() {

  function fmtMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Math.round(n).toLocaleString("fr-FR") + " €";
  }
  function fmtNumber(n) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Math.round(n).toLocaleString("fr-FR");
  }
  function fmtPercent(n, d) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return (n * 100).toFixed(d || 1) + " %";
  }
  function fmtDelta(n) {
    if (n === null || n === undefined || isNaN(n)) return { text: "—", cls: "flat" };
    var pct = (n * 100).toFixed(1);
    if (n > 0.001) return { text: "▲ +" + pct + " %", cls: "up" };
    if (n < -0.001) return { text: "▼ " + pct + " %", cls: "down" };
    return { text: "= 0 %", cls: "flat" };
  }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function(k) {
      if (k === "class") node.className = props[k];
      else if (k === "html") node.innerHTML = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function(c) {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  /**
   * Carte KPI : { label, value, delta?, formatter?, alert?, danger? }
   */
  function kpiCard(opts) {
    var fmt = opts.formatter || fmtNumber;
    var card = el("div", { class: "kpi-card" + (opts.alert ? " alert" : "") + (opts.danger ? " danger" : "") });
    card.appendChild(el("div", { class: "label" }, [opts.label]));
    card.appendChild(el("div", { class: "value" }, [fmt(opts.value)]));
    if (opts.delta !== undefined) {
      var d = fmtDelta(opts.delta);
      card.appendChild(el("div", { class: "delta " + d.cls }, [d.text]));
    }
    return card;
  }

  /**
   * Tableau simple : columns = [{key, label, formatter, classCol}], rows = [{...}]
   */
  function table(columns, rows, opts) {
    opts = opts || {};
    var t = el("table");
    var thead = el("thead");
    var headerRow = el("tr");
    columns.forEach(function(c) {
      headerRow.appendChild(el("th", { class: c.classCol || "" }, [c.label]));
    });
    thead.appendChild(headerRow);
    t.appendChild(thead);

    var tbody = el("tbody");
    if (!rows || rows.length === 0) {
      var tr = el("tr");
      tr.appendChild(el("td", { colspan: columns.length, style: "text-align:center;color:#6B7280;padding:24px" }, ["Aucune donnée sur la période"]));
      tbody.appendChild(tr);
    } else {
      rows.forEach(function(r) {
        var tr = el("tr", { class: opts.rowClass ? opts.rowClass(r) : "" });
        columns.forEach(function(c) {
          var v = r[c.key];
          var formatted = c.formatter ? c.formatter(v, r) : (v == null ? "—" : v);
          if (c.html) {
            tr.appendChild(el("td", { class: c.classCol || "", html: formatted }));
          } else {
            tr.appendChild(el("td", { class: c.classCol || "" }, [formatted]));
          }
        });
        tbody.appendChild(tr);
      });
    }
    t.appendChild(tbody);
    return t;
  }

  function sourceBadge(source) {
    var s = (source || "").toLowerCase();
    var cls = "badge " + s;
    var label = source || "—";
    return '<span class="' + cls + '">' + label + '</span>';
  }

  /**
   * Period bar — émet un event "periodchange" avec { period, customStart, customEnd, compareStart, compareEnd }
   */
  function periodBar(container, defaultPeriod) {
    container.innerHTML = "";
    var bar = el("div", { class: "period-bar" });
    var current = { period: defaultPeriod || "month", customStart: "", customEnd: "", compareStart: "", compareEnd: "" };

    function emit() {
      container.dispatchEvent(new CustomEvent("periodchange", { detail: current }));
    }

    ["day", "week", "month"].forEach(function(p) {
      var labels = { day: "Jour", week: "Semaine", month: "Mois" };
      var b = el("button", { type: "button", "data-period": p }, [labels[p]]);
      if (current.period === p) b.className = "active";
      b.addEventListener("click", function() {
        current.period = p; current.customStart = ""; current.customEnd = "";
        Array.from(bar.querySelectorAll("button[data-period]")).forEach(function(x) {
          x.className = (x.getAttribute("data-period") === p) ? "active" : "";
        });
        emit();
      });
      bar.appendChild(b);
    });

    // Custom range
    bar.appendChild(el("span", { class: "label" }, ["Du"]));
    var fromInput = el("input", { type: "date" });
    bar.appendChild(fromInput);
    bar.appendChild(el("span", { class: "label" }, ["au"]));
    var toInput = el("input", { type: "date" });
    bar.appendChild(toInput);

    function applyCustom() {
      if (fromInput.value && toInput.value) {
        current.period = "custom";
        current.customStart = fromInput.value;
        current.customEnd = toInput.value;
        Array.from(bar.querySelectorAll("button[data-period]")).forEach(function(x) { x.className = ""; });
        emit();
      }
    }
    fromInput.addEventListener("change", applyCustom);
    toInput.addEventListener("change", applyCustom);

    // Compare range
    bar.appendChild(el("span", { class: "label", style: "margin-left:24px" }, ["Comparer à : du"]));
    var cmpFrom = el("input", { type: "date" });
    bar.appendChild(cmpFrom);
    bar.appendChild(el("span", { class: "label" }, ["au"]));
    var cmpTo = el("input", { type: "date" });
    bar.appendChild(cmpTo);
    function applyCompare() {
      if (cmpFrom.value && cmpTo.value) {
        current.compareStart = cmpFrom.value;
        current.compareEnd = cmpTo.value;
        emit();
      }
    }
    cmpFrom.addEventListener("change", applyCompare);
    cmpTo.addEventListener("change", applyCompare);

    container.appendChild(bar);
    return current;
  }

  function showError(container, message) {
    container.innerHTML = '<div class="error-banner">' + message + '</div>';
  }

  function showLoader(container, message) {
    container.innerHTML = '<div class="loader">' + (message || "Chargement…") + '</div>';
  }

  return {
    fmtMoney: fmtMoney, fmtNumber: fmtNumber, fmtPercent: fmtPercent, fmtDelta: fmtDelta,
    el: el, kpiCard: kpiCard, table: table, sourceBadge: sourceBadge,
    periodBar: periodBar, showError: showError, showLoader: showLoader
  };
})();
