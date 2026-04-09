/**
 * ============================================================
 *  SHOPIFY SESSION RECORDER — tracker.js
 *  Add this snippet to your Shopify theme.liquid before </head>
 * ============================================================
 *
 *  HOW TO INSTALL:
 *  1. In Shopify Admin go to: Online Store → Themes → Edit Code
 *  2. Open: Layout → theme.liquid
 *  3. Paste the <script> block below just before </head>
 *  4. Replace YOUR_BACKEND_URL with your actual server URL
 *
 * ============================================================
 */

// ── Copy everything below this line into theme.liquid ──────────

/*
<script>
(function() {
  // ── CONFIG — change this to your backend URL ──────────────────
  var BACKEND_URL = 'https://YOUR_BACKEND_URL';
  var FLUSH_INTERVAL = 5000;   // Send events every 5 seconds
  var MAX_EVENTS = 500;         // Max events per flush
  // ─────────────────────────────────────────────────────────────

  // Generate or retrieve session ID
  function getSessionId() {
    var key = 'srec_sid';
    var id = sessionStorage.getItem(key);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  var sessionId = getSessionId();
  var startedAt = Date.now();
  var events = [];
  var flushing = false;

  // Meta info about this session
  var meta = {
    shopUrl: window.Shopify ? window.Shopify.shop : window.location.hostname,
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    startedAt: startedAt
  };

  // Flush events to backend
  function flush() {
    if (events.length === 0 || flushing) return;
    flushing = true;

    var toSend = events.splice(0, MAX_EVENTS);

    fetch(BACKEND_URL + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, events: toSend, meta: meta }),
      keepalive: true
    })
    .catch(function() {
      // Put events back if failed
      events = toSend.concat(events);
    })
    .finally(function() {
      flushing = false;
    });
  }

  // Load rrweb and start recording
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.13/dist/rrweb.min.js';
  script.onload = function() {
    rrweb.record({
      emit: function(event) {
        events.push(event);
      },
      maskAllInputs: true,          // Hides all input values (passwords, emails)
      maskInputOptions: {
        password: true,
        email: true,
        tel: true,
        number: true,
        text: false                 // Set true to mask ALL text inputs
      },
      blockClass: 'no-record',      // Add class="no-record" to any element to block it
      ignoreClass: 'no-record-input',
      sampling: {
        mousemove: 50,              // ms between mouse move samples
        mouseInteraction: true,
        scroll: 150,
        input: 'last'
      }
    });

    // Flush on interval
    setInterval(flush, FLUSH_INTERVAL);

    // Flush before user leaves
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') flush();
    });
  };

  document.head.appendChild(script);
})();
</script>
*/
