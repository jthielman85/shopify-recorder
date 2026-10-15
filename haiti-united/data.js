/* ------------------------------------------------------------------
   Haiti United FC — editable content.
   EVERYTHING below is PLACEHOLDER data. Swap in real fixtures,
   players, scores and stories; the page rebuilds itself from this.
------------------------------------------------------------------- */
window.HU = {
  // ISO dates in the future drive the live countdown (first upcoming one wins)
  fixtures: [
    { date: '2026-11-08T15:00:00-05:00', opp: 'Miami Rovers',     code: 'MIA', comp: 'League',   venue: 'Home · Heritage Park', home: true },
    { date: '2026-11-22T18:30:00-05:00', opp: 'Brooklyn Kings',   code: 'BKN', comp: 'League',   venue: 'Away · Kings Field',   home: false },
    { date: '2026-12-06T14:00:00-05:00', opp: 'Montréal Étoile',  code: 'MTL', comp: 'Cup',      venue: 'Home · Heritage Park', home: true },
    { date: '2026-12-20T16:00:00-05:00', opp: 'Orlando Pelicans', code: 'ORL', comp: 'League',   venue: 'Away · Pelican Ground', home: false }
  ],
  results: [
    { date: 'Oct 11', opp: 'Boston Harbor',  code: 'BOS', us: 3, them: 1, comp: 'League', home: true },
    { date: 'Oct 04', opp: 'Atlanta Union',  code: 'ATL', us: 2, them: 2, comp: 'League', home: false },
    { date: 'Sep 27', opp: 'Newark Eagles',  code: 'NWK', us: 1, them: 0, comp: 'Cup',    home: true },
    { date: 'Sep 20', opp: 'Chicago Lakes',  code: 'CHI', us: 0, them: 1, comp: 'League', home: false },
    { date: 'Sep 13', opp: 'Queens FC',      code: 'QNS', us: 4, them: 0, comp: 'League', home: true }
  ],
  table: [
    { club: 'Haiti United',   p: 9, gd: '+12', pts: 22, us: true },
    { club: 'Miami Rovers',   p: 9, gd: '+9',  pts: 20 },
    { club: 'Brooklyn Kings', p: 9, gd: '+5',  pts: 17 },
    { club: 'Boston Harbor',  p: 9, gd: '+1',  pts: 14 },
    { club: 'Atlanta Union',  p: 9, gd: '-2',  pts: 11 },
    { club: 'Newark Eagles',  p: 9, gd: '-4',  pts: 10 }
  ],
  squad: [
    { no: 1,  name: 'Jean-Marc Étienne',  pos: 'GK',  tag: 'Goalkeeper' },
    { no: 4,  name: 'Wilfried Joseph',    pos: 'DEF', tag: 'Centre-back' },
    { no: 5,  name: 'Samuel Pierre',      pos: 'DEF', tag: 'Captain' },
    { no: 8,  name: 'Kervens Baptiste',   pos: 'MID', tag: 'Midfielder' },
    { no: 10, name: 'Ricardo Louis',      pos: 'MID', tag: 'Playmaker' },
    { no: 7,  name: 'Dwayne Charles',     pos: 'FWD', tag: 'Winger' },
    { no: 9,  name: 'Mackenson Desir',    pos: 'FWD', tag: 'Striker' },
    { no: 11, name: 'Fabrice Toussaint',  pos: 'FWD', tag: 'Forward' }
  ],
  scorers: [
    { name: 'Mackenson Desir',   goals: 11 },
    { name: 'Ricardo Louis',     goals: 8 },
    { name: 'Dwayne Charles',    goals: 6 },
    { name: 'Fabrice Toussaint', goals: 5 },
    { name: 'Kervens Baptiste',  goals: 3 }
  ],
  news: [
    { tag: 'Match Report', title: 'Desir hat-trick sinks Boston as United go top', date: 'Oct 12', hue: 'b' },
    { tag: 'Club',         title: 'Youth academy opens summer trials for under-16s', date: 'Oct 09', hue: 'r' },
    { tag: 'Community',    title: 'Heritage Day returns: music, food and a fan match', date: 'Oct 06', hue: 'w' },
    { tag: 'Tickets',      title: 'Season passes for the second half now on sale', date: 'Oct 01', hue: 'b' }
  ],
  poll: ['Mackenson Desir', 'Ricardo Louis', 'Samuel Pierre'],
  ticker: ['FT  Haiti United 3–1 Boston Harbor', 'Top of the league after 9 games', 'Season passes now on sale', 'Youth trials open', 'Ansanm nou pi fò'],
  sponsors: ['PARTNER ONE', 'KAY DISTRIBUTION', 'AYITI MEDIA', 'CARIBE TRAVEL', 'PEARL BANK', 'SOLEY ENERGY']
};
