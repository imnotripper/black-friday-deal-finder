// Bargain Beacon — the app shell. One job: route between the deal list and
// a deal's page, keep the filter state, and re-render on every change.
// No network calls anywhere: the deals live in data.js, the page is static.

import { deals } from "./data.js";
import { list, deal, missing } from "./views.js";

const app = document.getElementById("app");

const state = { q: "", category: "", store: "", minOff: 0, sort: "discount" };

let lastQuery = null;

function applyHashParams() {
  // Deep-linkable filtered views, e.g. #/?category=TVs&sort=discount.
  // Applied only when the hash's query part changes, so typing in the
  // controls (which re-render) never resets the filters back to the URL.
  const query = (window.location.hash.split("?")[1] ?? "").replace(/^#/, "");
  if (query === lastQuery) return;
  lastQuery = query;
  const params = new URLSearchParams(query);
  if (params.has("q")) state.q = params.get("q");
  if (params.has("category")) state.category = params.get("category");
  if (params.has("store")) state.store = params.get("store");
  if (params.has("minOff")) state.minOff = Number(params.get("minOff")) || 0;
  if (params.has("sort")) state.sort = params.get("sort");
}

function render() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/deal\/([^/?#]+)$/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    app.innerHTML = found ? deal(found) : missing();
  } else {
    applyHashParams();
    app.innerHTML = list(state);
    wireControls();
  }
  // The screenshot helper waits for this before it captures the page.
  window.__shotReady = true;
}

function wireControls() {
  const form = document.getElementById("controls");
  if (!form) return;
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "q") state.q = target.value;
    if (target.id === "category") state.category = target.value;
    if (target.id === "store") state.store = target.value;
    if (target.id === "minOff") state.minOff = Number(target.value);
    if (target.id === "sort") state.sort = target.value;
    // Re-render, but keep the search box focused with its caret where it was.
    const active = document.activeElement && document.activeElement.id;
    const caret = active === "q" ? target.selectionStart : null;
    render();
    if (active) {
      const again = document.getElementById(active);
      if (again) {
        again.focus();
        if (caret !== null && again.setSelectionRange) again.setSelectionRange(caret, caret);
      }
    }
  });
  form.addEventListener("submit", (event) => event.preventDefault());
}

window.addEventListener("hashchange", render);
render();
