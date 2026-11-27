[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/imnotripper/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/imnotripper/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

# Bargain Beacon — a real Black Friday deal finder

A static deal finder for Black Friday and Cyber Monday 2026, built for the [make.fun bounty](https://make.fun/bounty/black-friday-deal-finder-01). It lists **33 real deals** — TVs, audio, laptops, gaming, home & kitchen, and tech — checked on **27 November 2026** against named deals roundups (9to5Toys, TechSpot, The Gadgeteer, Yahoo Shopping, CNN Underscored, 2ndshift.gg and others).

Every deal shows its product, store, sale price, usual price, discount, a link to the product at that store, when its price was checked, and the roundup the price was read in — plus an honest verdict: **NEW LOW** (lowest price tracked), **STRONG** (a large cut off a real usual price), **FAIR** (a real cut, modest or off a generous compare-at price). Where the same product is cheaper at another store, the deal page says so.

## How it works

- `app/data.js` — the 33 deals, each with store, prices, link, check time, source, verdict and evidence.
- `app/views.js` — the list and deal pages: search, filters by category / store / minimum discount, and sorting by discount, saving, verdict or price.
- `app/main.js` — the shell: hash routing (`#/`, `#/deal/<id>`) and filter state.
- `app/style.css` — all layout and colour; system type only, no web fonts, no images, nothing loaded over the network.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

No build step, no install. Open it in desktop Chrome and at a phone size; the layout adapts.

## Method

Prices were read on 27 November 2026 from the deals roundups named on each deal, and the verdict on each deal says what its price rests on. Prices change fast — confirm the price at the store before you buy. Bargain Beacon is independent and not affiliated with any store named here.
