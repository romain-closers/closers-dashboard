/* ============================================================
   CHARTS — wrappers Chart.js
   Chart.js est chargé via CDN dans chaque page HTML.
   ============================================================ */

window.CLOSERS_CHARTS = (function() {

  var COLORS = {
    primary: "#1F3864", secondary: "#2E75B6",
    success: "#1E8449", warning: "#F39C12", danger: "#C0392B",
    DIRECT: "#1E8449", SETTING: "#2E75B6", REINSCRIPTION: "#F39C12"
  };

  function donut(canvas, data, opts) {
    opts = opts || {};
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: data.colors || data.labels.map(function(l) { return COLORS[l] || COLORS.secondary; }),
          borderWidth: 1,
          borderColor: "#FFFFFF"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { font: { size: 12 } } },
          title: opts.title ? { display: true, text: opts.title } : undefined
        },
        cutout: "65%"
      }
    });
  }

  function bar(canvas, labels, datasets, opts) {
    opts = opts || {};
    return new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets.map(function(d, i) {
          return {
            label: d.label,
            data: d.data,
            backgroundColor: d.color || [COLORS.primary, COLORS.secondary, COLORS.success][i % 3]
          };
        })
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: function(v) { return v.toLocaleString("fr-FR"); } } }
        },
        plugins: { legend: { display: datasets.length > 1 } }
      }
    });
  }

  function line(canvas, labels, datasets, opts) {
    opts = opts || {};
    return new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets.map(function(d, i) {
          return {
            label: d.label,
            data: d.data,
            borderColor: d.color || COLORS.primary,
            backgroundColor: (d.color || COLORS.primary) + "33",
            fill: true,
            tension: 0.3
          };
        })
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: function(v) { return v.toLocaleString("fr-FR"); } } }
        }
      }
    });
  }

  return { donut: donut, bar: bar, line: line, COLORS: COLORS };
})();
