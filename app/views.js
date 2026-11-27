// HTML for each page, built from the deal data. Every value is escaped
// before it goes into the page, so a deal's text can never break the markup.

import { deals, CATEGORIES, STORES, CHECKED_AT } from "./data.js";

export const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);

const day = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

const verdictClass = (v) => v.toLowerCase().replace(/ /g, "-");

const VERDICT_RANK = { "NEW LOW": 0, STRONG: 1, FAIR: 2, WEAK: 3 };

export function filterDeals({ q = "", category = "", store = "", minOff = 0, sort = "discount" } = {}) {
  const needle = q.trim().toLowerCase();
  let shown = deals.filter(
    (d) =>
      (category === "" || d.category === category) &&
      (store === "" || d.store === store) &&
      percentOff(d) >= minOff &&
      (needle === "" || `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(needle)),
  );
  const by = {
    discount: (a, b) => percentOff(b) - percentOff(a) || b.was - b.price - (a.was - a.price),
    price: (a, b) => a.price - b.price,
    verdict: (a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || percentOff(b) - percentOff(a),
    savings: (a, b) => b.was - b.price - (a.was - a.price),
  };
  shown = [...shown].sort(by[sort] ?? by.discount);
  return shown;
}

function statsBar() {
  const top = Math.max(...deals.map(percentOff));
  const newLows = deals.filter((d) => d.verdict === "NEW LOW").length;
  return `<section class="stats" aria-label="Sale at a glance">
    <div class="stat"><b>${deals.length}</b><span>checked deals</span></div>
    <div class="stat"><b>${STORES.length}</b><span>stores</span></div>
    <div class="stat"><b>${CATEGORIES.length}</b><span>categories</span></div>
    <div class="stat"><b>${newLows}</b><span>record-low prices</span></div>
    <div class="stat"><b>${top}%</b><span>biggest discount</span></div>
  </section>`;
}

function controls(state) {
  const opt = (value, label, current) =>
    `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`;
  return `<form class="controls" id="controls">
    <div class="field search">
      <label for="q">Search</label>
      <input type="search" id="q" name="q" placeholder="Try “AirPods”, “OLED”, “Dyson”…" value="${escape(state.q)}">
    </div>
    <div class="field">
      <label for="category">Category</label>
      <select id="category" name="category">
        ${opt("", "All categories", state.category)}
        ${CATEGORIES.map((c) => opt(c, c, state.category)).join("")}
      </select>
    </div>
    <div class="field">
      <label for="store">Store</label>
      <select id="store" name="store">
        ${opt("", "All stores", state.store)}
        ${STORES.map((s) => opt(s, s, state.store)).join("")}
      </select>
    </div>
    <div class="field">
      <label for="minOff">Min. discount</label>
      <select id="minOff" name="minOff">
        ${[0, 20, 30, 40, 50].map((n) => opt(String(n), n === 0 ? "Any discount" : `${n}% off or more`, String(state.minOff))).join("")}
      </select>
    </div>
    <div class="field">
      <label for="sort">Sort by</label>
      <select id="sort" name="sort">
        ${opt("discount", "Biggest discount", state.sort)}
        ${opt("savings", "Biggest saving ($)", state.sort)}
        ${opt("verdict", "Best verdict first", state.sort)}
        ${opt("price", "Lowest price", state.sort)}
      </select>
    </div>
  </form>`;
}

function card(d) {
  return `<li class="deal-card">
    <h2><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h2>
    <div class="meta-row">
      <span class="chip store">${escape(d.store)}</span>
      <span class="chip">${escape(d.category)}</span>
      <span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span>
    </div>
    <div class="price-row">
      <span class="price">${usd(d.price)}</span>
      <span class="was">${usd(d.was)}</span>
      <span class="off">${percentOff(d)}% off</span>
    </div>
    <p class="evidence">${escape(d.evidence)}</p>
    <p class="checked">Checked ${day(d.checked)} · <a class="store-link" href="${escape(d.url)}" rel="noopener">View at ${escape(d.store)}</a></p>
  </li>`;
}

export function list(state) {
  const shown = filterDeals(state);
  const count =
    shown.length === deals.length
      ? `<p class="result-count">Showing all <b>${deals.length}</b> deals, checked ${day(CHECKED_AT)}.</p>`
      : `<p class="result-count">Showing <b>${shown.length}</b> of ${deals.length} deals.</p>`;
  const grid =
    shown.length === 0
      ? `<p class="empty">No deal matches those filters. Clear the search or lower the minimum discount.</p>`
      : `<ul class="deals">${shown.map(card).join("")}</ul>`;
  return `<h1 class="visually-hidden">Black Friday deals</h1>${statsBar()}${controls(state)}${count}${grid}`;
}

export function deal(d) {
  const also =
    d.alsoAt && d.alsoAt.length
      ? `<section class="compare"><h2>Same product, other stores</h2><ul>${d.alsoAt
          .map(
            (a) =>
              `<li><a href="${escape(a.url)}" rel="noopener">${escape(a.store)}</a> — ${usd(a.price)}${a.price < d.price ? " (cheaper)" : a.price > d.price ? " (pricier)" : " (same price)"}</li>`,
          )
          .join("")}</ul></section>`
      : "";
  return `<article class="detail">
    <p><a class="back-link" href="#/">&larr; All deals</a></p>
    <h1>${escape(d.title)}</h1>
    <div class="meta-row">
      <span class="chip store">${escape(d.store)}</span>
      <span class="chip">${escape(d.category)}</span>
      <span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span>
      <span class="off">${percentOff(d)}% off</span>
    </div>
    <dl>
      <dt>Sale price</dt><dd><b>${usd(d.price)}</b></dd>
      <dt>Usual price</dt><dd>${usd(d.was)} (you save ${usd(d.was - d.price)})</dd>
      <dt>Verdict</dt><dd><b>${escape(d.verdict)}</b> — ${escape(d.evidence)}</dd>
      <dt>Checked</dt><dd>${day(d.checked)}</dd>
      <dt>Price read in</dt><dd>${escape(d.source)}</dd>
    </dl>
    ${also}
    <p class="buy-box"><a href="${escape(d.url)}" rel="noopener">Find it at ${escape(d.store)} &rarr;</a></p>
  </article>`;
}

export function missing() {
  return `<article class="detail"><h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all ${deals.length} deals</a>.</p></article>`;
}
