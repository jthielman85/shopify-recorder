/* ------------------------------------------------------------------
   Haiti United FC — editable content.
   Results, league table, news headlines, shop items, contact and
   sponsors come from haitiunitedfc.co. Items marked SAMPLE are
   placeholders: upcoming fixtures, roster (except Tingly Chery),
   scorers and the poll. Swap in real data; the page rebuilds itself.
------------------------------------------------------------------- */
window.HU = {
  // SAMPLE fixtures (future ISO dates drive the live countdown)
  fixtures: [
    { date: '2026-11-08T12:00:00-05:00', opp: 'NY Renegades FC',  code: 'NYR', comp: 'Division I', venue: 'Home · Linden Park',    home: true },
    { date: '2026-11-22T12:00:00-05:00', opp: 'NY Braveheart SC', code: 'NYB', comp: 'Division I', venue: 'Away',                  home: false },
    { date: '2026-12-06T12:00:00-05:00', opp: "Osner's FC",       code: 'OSN', comp: 'Division I', venue: 'Home · Linden Park',    home: true },
    { date: '2026-12-20T12:00:00-05:00', opp: 'NY Empire FC',     code: 'NYE', comp: 'Division I', venue: 'Away',                  home: false }
  ],
  // REAL results from the site (Division I Northeast American (North))
  results: [
    { date: 'Oct 26', opp: 'Long Island Premier', code: 'LIP', us: 5, them: 0, comp: 'Division I', home: false, venue: 'Our Lady of Grace Fields' },
    { date: 'Oct 18', opp: 'Atlas FC NYC',        code: 'ATL', us: 5, them: 1, comp: 'Division I', home: true,  venue: 'Linden Park' }
  ],
  // REAL Spring 2026 table from the site
  table: [
    { club: 'NY Renegades FC',  p: 10, gd: '+5', pts: 12 },
    { club: 'NY Braveheart SC', p: 10, gd: '+2', pts: 12 },
    { club: "Osner's FC",       p: 10, gd: '+2', pts: 12 },
    { club: 'NY Empire FC',     p: 10, gd: '+1', pts: 12 },
    { club: 'Red Hook FC',      p: 10, gd: '0',  pts: 10 },
    { club: 'Kelmendi FC NY',   p: 10, gd: '-1', pts: 9 },
    { club: 'AFC Academy',      p: 10, gd: '-2', pts: 9 },
    { club: 'Brooklyn FC U20',  p: 10, gd: '-2', pts: 9 },
    { club: 'Haiti United FC',  p: 10, gd: '-5', pts: 9, us: true }
  ],
  // Tingly Chery is real (Forward); the rest are SAMPLE slots
  squad: [
    { no: 9,  name: 'Tingly Chery', pos: 'FWD', tag: 'Forward' },
    { no: 1,  name: 'Player Name',  pos: 'GK',  tag: 'Goalkeeper' },
    { no: 4,  name: 'Player Name',  pos: 'DEF', tag: 'Defender' },
    { no: 5,  name: 'Player Name',  pos: 'DEF', tag: 'Defender' },
    { no: 8,  name: 'Player Name',  pos: 'MID', tag: 'Midfielder' },
    { no: 10, name: 'Player Name',  pos: 'MID', tag: 'Midfielder' },
    { no: 7,  name: 'Player Name',  pos: 'FWD', tag: 'Winger' },
    { no: 11, name: 'Player Name',  pos: 'FWD', tag: 'Forward' }
  ],
  scorers: [
    { name: 'Tingly Chery', goals: 6 },
    { name: 'Player Name',  goals: 4 },
    { name: 'Player Name',  goals: 3 },
    { name: 'Player Name',  goals: 2 },
    { name: 'Player Name',  goals: 1 }
  ],
  // REAL headlines from the site
  news: [
    { tag: 'Club',      title: 'More than a club: how Haiti United FC is leading a football movement in NYC', date: 'Mar 20', hue: 'b' },
    { tag: 'Community', title: 'Cultural unity through football: Haiti United FC in the community',         date: 'Mar 13', hue: 'r' },
    { tag: 'Recruiting',title: 'College & recruiting support: helping NYC athletes reach the next level',   date: 'Mar 6',  hue: 'w' },
    { tag: 'Club',      title: 'Rising stars at Haiti United FC',                                           date: 'Feb 27', hue: 'b' }
  ],
  // REAL shop items ($44.99 each)
  shop: [
    { name: 'HUFC Red Jersey',   cat: 'T-Shirts', price: '$44.99', body: '#d61f3d', trim: '#003a7c', accent: '#d4a853' },
    { name: 'HUFC Blue Jersey',  cat: 'T-Shirts', price: '$44.99', body: '#2f6bff', trim: '#ffffff', accent: '#d4a853', hot: true },
    { name: 'HUFC White Jersey', cat: 'T-Shirts', price: '$44.99', body: '#f4f6ff', trim: '#003a7c', accent: '#003a7c' }
  ],
  poll: ['Tingly Chery', 'Player Name', 'Player Name'],
  ticker: ['FT  Haiti United FC 5–0 Long Island Premier', 'FT  Haiti United FC 5–1 Atlas FC NYC', 'Tickets for key matches now on sale', 'Honoring Haitian culture', 'Uniting families through football'],
  sponsors: ['CHOKARELLA', 'BARBANCOURT RHUM', 'SPORTS ATHLETES ALLIANCE', 'EKIP', 'REBEL', 'PRESTIGE']
};
