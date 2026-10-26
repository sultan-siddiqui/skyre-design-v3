"""Generate the templated pages: News & Insights + articles, Broker, Claims, Careers +
vacancies, Legal + policy pages and the six portfolio detail pages.

Run:  python tools/build_pages.py && python tools/sync-partials.py
Content lives in the dictionaries below; edit, then run both commands again.
"""
import html
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_portfolios import PF  # noqa: E402

E = html.escape
ARROW = '<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>'
GO = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 11L11 1M4 1h7v7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>'
STAR_IC = '<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0C11 6 14 9 20 10C14 11 11 14 10 20C9 14 6 11 0 10C6 9 9 6 10 0Z" fill="currentColor" /></svg>'


def shell(file, title, desc, page, body, scripts=(), noindex=False):
    js = "\n".join(f'<script src="{s}"></script>' for s in ("assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js", "assets/vendor/SplitText.min.js", "assets/vendor/lenis.min.js", "assets/js/core.js", "assets/js/fx.js", *scripts))
    robots = '\n  <meta name="robots" content="noindex">' if noindex else ""
    out = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  <meta name="theme-color" content="#00141f">{robots}
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/fonts.css">
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/pages.css">
  <script>
    (function (d) {{ d.classList.add('js', 'no-loader'); try {{ if (sessionStorage.getItem('sky-tr')) {{ d.classList.add('tr-in'); sessionStorage.removeItem('sky-tr'); }} }} catch (e) {{}} }})(document.documentElement);
  </script>
</head>
<body data-page="{page}">
<!-- @@HEADER -->
<!-- @@/HEADER -->

<main id="main">
{body}
</main>

<!-- @@FOOTER -->
<!-- @@/FOOTER -->

{js}
</body>
</html>
'''
    (ROOT / file).write_text(out, encoding="utf-8")
    print("built", file)


def crumbs(*items):
    parts = ['<a href="index.html">Home</a>']
    for label, href in items:
        parts.append('<span aria-hidden="true">✦</span>')
        parts.append(f'<a href="{href}">{E(label)}</a>' if href else f"<span>{E(label)}</span>")
    return '<nav class="crumbs" aria-label="Breadcrumb">' + "".join(parts) + "</nav>"


def phero(fx, crumb, eyebrow, title_html, lead, extra=""):
    canvas = f'<canvas class="phero__cv" data-fx="{fx}" aria-hidden="true"></canvas>' if fx else ""
    return f'''  <section class="phero">
    {canvas}
    <div class="wrap phero__in">
      {crumb}
      <p class="eyebrow">{eyebrow}</p>
      <h1 class="d1" data-split data-now>{title_html}</h1>
      <div class="phero__foot">
        <div><p class="lead" data-reveal>{lead}</p>{extra}</div>
        <div class="scroll-cue" aria-hidden="true"><i></i>Scroll</div>
      </div>
    </div>
  </section>'''


def cta(title_html, lead, primary, secondary=None):
    sec = f'<a class="btn" href="{secondary[1]}" data-magnetic>{E(secondary[0])}</a>' if secondary else ""
    return f'''  <section class="cta" aria-label="Next step">
    <canvas class="cta__cv" aria-hidden="true"></canvas>
    <div class="wrap cta__in">
      <svg class="cta__sym" viewBox="0 0 543.4 543.4" aria-hidden="true" data-reveal="scale"><use href="#sr-symbol" /></svg>
      <h2 class="d2" data-split>{title_html}</h2>
      <p class="lead" data-reveal>{lead}</p>
      <div class="btns" data-reveal>
        <a class="btn btn--gold" href="{primary[1]}" data-magnetic>{E(primary[0])} {STAR_IC}</a>
        {sec}
      </div>
    </div>
  </section>'''


def head(eyebrow, title_html, lead=""):
    lead_html = f'<p class="lead" data-reveal>{lead}</p>' if lead else ""
    return f'''      <div class="sec-head">
        <div>
          <p class="eyebrow">{eyebrow}</p>
          <h2 class="h2" data-split>{title_html}</h2>
        </div>
        {lead_html}
      </div>'''


def ilist(items):
    return '<ol class="ilist">' + "".join(f'<li data-reveal><span class="num-tag">{i:02d}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></li>' for i, (t, d) in enumerate(items, 1)) + "</ol>"


def rays_cards(items, lit_total):
    out = []
    for i, (t, d) in enumerate(items):
        lit, total = lit_total(i)
        out.append(f'<article class="card" data-reveal><svg class="rays" data-rays="{lit}/{total}" style="width:58px;margin-bottom:40px" aria-hidden="true"></svg><span class="idx">{i + 1:02d}</span><h3 class="h3" style="margin:10px 0 10px">{E(t)}</h3><p class="small">{E(d)}</p></article>')
    return "\n".join(out)


# ---------------------------------------------------------------- News & Insights
NEWS = [
    dict(slug="a-connected-view-of-risk", cat="Insight", mins=5, img="stock-riyadh.jpg", alt="Riyadh skyline under a hazy sky",
         title="A connected view of risk", dek="How Saudi market knowledge informs specialist conversations.",
         body=["A changing market asks us to look beyond isolated exposures. Local knowledge, specialist experience and constructive dialogue create a more complete picture of risk than any single data point can.",
               "For a reinsurance MGA, that picture is where underwriting begins. Before a risk is priced or bound on behalf of reinsurers, it is read in context: the activity, its location, its neighbours and the people who operate it.",
               "The Saudi market gives these conversations a distinctive shape. Projects are larger, timelines are ambitious and the regulatory environment is maturing quickly. Being onshore means hearing those details first-hand, and early.",
               "A connected view does not mean a complicated one. It means asking the right questions once, sharing the answers clearly with capacity providers, and returning a decision the cedant can rely on."],
         quote="A wider perspective starts with a better conversation.",
         points=["Context before price", "Onshore proximity to cedants and projects", "Clear, shared information for capacity providers"]),
    dict(slug="the-value-of-specialist-dialogue", cat="Perspective", mins=4, img="stock-industry.jpg", alt="Aerial view of port infrastructure",
         title="The value of specialist dialogue", dek="Building understanding through thoughtful broker and capacity relationships.",
         body=["Complex commercial risks rarely fit a template. The most useful underwriting conversations happen when brokers, cedants and underwriters speak the same technical language.",
               "Specialist dialogue shortens the distance between a submission and a decision. It surfaces the information that matters, such as protections, maintenance, contractual allocations of risk and loss history, before it becomes a question.",
               "For capacity providers, it creates confidence that delegated authority is exercised with care. For cedants, it means a counterpart who understands why a risk is different, not only that it is.",
               "Good dialogue is also honest dialogue. Where a risk sits outside appetite, saying so early and clearly is part of the service."],
         quote="Delegated authority is only as strong as the conversations behind it.",
         points=["Technical language shared by all parties", "Earlier, better information", "Honest appetite, clearly communicated"]),
    dict(slug="inside-our-approach", cat="Company", mins=3, img="stock-culture.jpg", alt="Colleagues in a meeting around a table",
         title="Inside our approach", dek="The principles behind clarity, continuity and trust in our conversations.",
         body=["Our approach is shaped by four values: underwriting discipline, high-altitude vision, local authority with global reach, and co-aligned partnership.",
               "In practice, that means technical analysis before opinion, governance that capacity providers can see, and decisions explained in plain language.",
               "It also means continuity. Relationships with cedants and reinsurers are built over many renewals, and the people who underwrite a risk remain available after it is bound.",
               "Clarity, continuity and trust are not slogans. They are the working habits that make a partnership complete."],
         quote="When partnership is complete, a star is born.",
         points=["Four values, applied daily", "Governance capacity providers can see", "The same people before and after bind"]),
    dict(slug="a-changing-saudi-landscape", cat="Market", mins=5, img="hero-contact.jpg", alt="Riyadh at night",
         title="A changing Saudi landscape", dek="An illustrative perspective on evolving places, businesses and exposures.",
         body=["The Kingdom's economic transformation is visible from any Riyadh window: new districts, new infrastructure and new industries taking shape at remarkable speed.",
               "Every one of these changes alters the risk landscape. Construction and erection exposures grow, supply chains lengthen, and new technologies bring new liabilities alongside new opportunities.",
               "A maturing insurance and reinsurance sector is part of that story. Insurers need partners who can bring specialized capacity onshore and apply it with local precision.",
               "Understanding the landscape is not a one-off exercise. It is a habit of looking up, every day, from the heart of the market."],
         quote="Elevating capacity, empowering regional growth.",
         points=["Fast-changing exposures", "Specialized capacity, brought onshore", "Local precision for a maturing market"]),
    dict(slug="understanding-complex-assets", cat="Insight", mins=4, img="hero-portfolios.jpg", alt="Cargo vessel at a busy port",
         title="Understanding complex assets", dek="Why the wider operating context belongs in every risk conversation.",
         body=["A power plant, a petrochemical complex or a port terminal is never a single risk. It is a system of assets, processes, people and dependencies.",
               "Underwriting such assets means understanding how a loss would travel through that system: from property damage, to business interruption, to delay in start-up for the projects that depend on it.",
               "That is why our portfolios are designed to work together, from Property and Engineering to Marine Cargo, Energy and Treaty structures that protect the wider book.",
               "The wider operating context is not background information. It is the risk."],
         quote="Every exposure has a context.",
         points=["Assets as systems", "How losses travel: PD, BI and DSU", "Portfolios designed to work together"]),
    dict(slug="people-behind-the-perspective", cat="People", mins=3, img="hero-partners.jpg", alt="Two business partners meeting outside an office building",
         title="People behind the perspective", dek="Curiosity, collaboration and the human side of specialist expertise.",
         body=["Behind every underwriting decision is a person who asked a good question.",
               "We look for colleagues who are curious about how things work, comfortable with complexity and generous with what they know.",
               "Collaboration is how specialist knowledge becomes shared knowledge, between underwriters, with brokers and with the reinsurers who trust us with their capacity.",
               "The human side of expertise is what turns a transaction into a partnership."],
         quote="Expertise is personal.",
         points=["Curiosity as a discipline", "Knowledge that is shared", "Partnership over transaction"]),
]


def news_card(n, big=False):
    cls = "ncard ncard--big" if big else "ncard"
    return f'''<a class="{cls}" href="news-{n["slug"]}.html" data-cat="{n["cat"].lower()}" data-reveal>
          <span class="ph"><img src="assets/img/news/{n["img"]}" alt="{E(n["alt"])}" loading="lazy"><i class="glint" aria-hidden="true"></i></span>
          <span class="ncard__b">
            <span class="ncard__m"><span class="tag">{n["cat"]}</span><span>{n["mins"]} min read</span></span>
            <span class="ncard__t">{E(n["title"])}</span>
            <span class="ncard__d">{E(n["dek"])}</span>
            <span class="link-u">Read insight <span aria-hidden="true">→</span></span>
          </span>
        </a>'''


def build_news():
    cats = ["All", "Insight", "Perspective", "Company", "Market", "People"]
    tabs = "".join(
        f'<button class="tab" role="tab" aria-selected="{"true" if i == 0 else "false"}" data-f="{c.lower()}" tabindex="{0 if i == 0 else -1}">{c}</button>'
        for i, c in enumerate(cats))
    body = phero("constellation", crumbs(("Resources", None), ("News & Insights", None)), "News &amp; Insights",
                 "A wider view. <em>A sharper perspective.</em>",
                 "Ideas, company updates and conversations from across our market. Articles and dates are illustrative until approved content is published.")
    body += f'''
  <section class="sec" aria-labelledby="feat-h">
    <div class="wrap">
      {head("Featured perspective", 'Stay connected to <em>the conversation</em>')}
      {news_card(NEWS[0], big=True)}
    </div>
  </section>

  <section class="sec sec--tight" aria-labelledby="all-h">
    <div class="wrap">
      <div class="news-bar">
        <h2 class="h3" id="all-h">All insights</h2>
        <div class="tabs" role="tablist" aria-label="Filter by category" id="newsFilter">{tabs}</div>
      </div>
      <div class="news-grid" id="newsGrid">
        {"".join(news_card(n) for n in NEWS)}
      </div>
    </div>
  </section>

  <section class="sec" aria-labelledby="ev-h">
    <div class="wrap">
      {head("Events &amp; Updates", 'Conversations <em>beyond the page</em>', "Approved event participation and corporate updates will appear here as they are confirmed.")}
      {ilist([("Market conversations", "Approved event announcements and participation will appear here."), ("Company news", "Client-approved milestones and corporate updates will be published here first.")])}
    </div>
  </section>
'''
    body += cta("Keep the conversation <em>going</em>", "For media and corporate enquiries, connect with our team.", ("Email Sky Re", "mailto:info@skyre.com.sa?subject=Media%20enquiry"), ("Contact directory", "contact.html"))
    shell("news.html", "News & Insights — Sky Re", "Ideas, company updates and market perspectives from Sky Re, the onshore P&C reinsurance MGA in Riyadh.", "news", body, ("assets/js/pages/news.js",))

    for i, n in enumerate(NEWS):
        more = [NEWS[(i + k) % len(NEWS)] for k in (1, 2, 3)]
        paras = "".join(f"<p>{E(p)}</p>" for p in n["body"][:2]) + f'<blockquote class="pull"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0C11 6 14 9 20 10C14 11 11 14 10 20C9 14 6 11 0 10C6 9 9 6 10 0Z" fill="currentColor" /></svg><p>{E(n["quote"])}</p></blockquote>' + "".join(f"<p>{E(p)}</p>" for p in n["body"][2:])
        points = "".join(f"<li>{E(p)}</li>" for p in n["points"])
        body = f'''  <div class="read-prog" aria-hidden="true"><i></i></div>
  <section class="art-hero">
    <div class="wrap">
      {crumbs(("News & Insights", "news.html"), (n["cat"], None))}
      <p class="eyebrow">{n["cat"]} · {n["mins"]} min read</p>
      <h1 class="d2" data-split data-now>{E(n["title"])}</h1>
      <p class="lead art-dek" data-reveal>{E(n["dek"])}</p>
      <div class="art-meta" data-reveal><span>Editorial team</span><span>Illustrative date</span><span>Sample article for design review</span></div>
    </div>
    <div class="wrap"><figure class="ph ph--hero" data-parallax-img><img src="assets/img/news/{n["img"]}" alt="{E(n["alt"])}"><i class="glint" aria-hidden="true"></i></figure></div>
  </section>

  <section class="sec sec--tight">
    <div class="wrap art">
      <aside class="art-side">
        <span class="mono">In this article</span>
        <ul class="art-points">{points}</ul>
        <span class="mono" style="margin-top:30px">Share</span>
        <div class="art-share">
          <button class="copy" type="button" data-copy-url aria-label="Copy link to this article"><svg viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="2" /><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" /></svg></button>
          <a class="copy" href="mailto:?subject={E(n["title"]).replace(" ", "%20")}" aria-label="Share by email"><svg viewBox="0 0 16 16"><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5L8 9l5.5-4.5" /></svg></a>
        </div>
      </aside>
      <article class="art-body" data-reveal>{paras}</article>
    </div>
  </section>

  <section class="sec sec--tight" aria-labelledby="more-h">
    <div class="wrap">
      <div class="news-bar"><h2 class="h3" id="more-h">Continue reading</h2><a class="link-u" href="news.html">All insights <span aria-hidden="true">→</span></a></div>
      <div class="news-grid">{"".join(news_card(m) for m in more)}</div>
    </div>
  </section>
'''
        body += cta("Talk to <em>a specialist</em>", "Find the right department for your enquiry.", ("Contact Sky Re", "contact.html"), ("Back to News & Insights", "news.html"))
        shell(f"news-{n['slug']}.html", f"{n['title']} — Sky Re News & Insights", n["dek"], "article", body, ("assets/js/pages/news.js",))


# ---------------------------------------------------------------- Broker & Claims
def build_broker():
    body = phero("orbits", crumbs(("Resources", None), ("Broker Information", None)), "Broker Information",
                 "Clear conversations. <em>Considered underwriting.</em>",
                 "A focused introduction to working with Sky Re, and to connecting your enquiry with the right specialist on our underwriting desk.")
    pf_links = "".join(f'<a href="{p["id"]}.html" data-reveal><span><b>{E(p["name"])}</b><small>{E(p["cat"])}</small></span><span class="go">{GO}</span></a>' for p in PF)
    body += f'''
  <section class="sec" aria-label="Working together">
    <div class="wrap">
      {head("Working Together", 'A straightforward path <em>to a conversation</em>', "Sky Re underwrites on behalf of reinsurers under delegated authority. Every enquiry starts by email with our underwriting desk.")}
      <div class="steps steps--3">
        <div class="step" data-reveal><span class="num-tag">01</span><b>Explore the appetite</b><p>Review the relevant portfolio, its main products, coverage scope and industry exposures.</p></div>
        <div class="step" data-reveal><span class="num-tag">02</span><b>Find your specialist</b><p>Identify the line of business, then email the underwriting desk with the portfolio in the subject line.</p></div>
        <div class="step" data-reveal><span class="num-tag">03</span><b>Start a discussion</b><p>We respond with the next steps and the information required to assess the risk.</p></div>
      </div>
    </div>
  </section>

  <section class="sec" aria-label="Useful context">
    <div class="wrap split">
      <div>
        <p class="eyebrow">Useful Context</p>
        <h2 class="h2" data-split>Help us understand <em>the full picture</em></h2>
        <p class="lead" style="margin-top:22px" data-reveal>The more context we have at the start, the faster we can give a clear, technical answer.</p>
      </div>
      {ilist([("Line of business", "Share the broad risk category and the relevant portfolio context."), ("Risk location and activity", "Provide a clear outline of location, operations, protections and exposures."), ("Your enquiry", "Describe the purpose of the discussion, the structure sought and your contact details.")])}
    </div>
  </section>

  <section class="sec sec--tight" aria-label="Portfolios">
    <div class="wrap">
      {head("Specialist Expertise", 'Start with <em>the right portfolio</em>')}
      <div class="dir">{pf_links}</div>
    </div>
  </section>
'''
    body += cta("Connect with <em>underwriting</em>", "All enquiries begin by email. This website does not quote, bind or accept submissions.", ("underwriting@skyre.com.sa", "mailto:underwriting@skyre.com.sa?subject=Broker%20enquiry"), ("Explore portfolios", "portfolios.html"))
    shell("broker.html", "Broker Information — Sky Re", "How brokers work with Sky Re's underwriting desk: appetite, the information we need and how to start a conversation.", "broker", body)


def build_claims():
    body = phero("horizon", crumbs(("Resources", None), ("Claims Information", None)), "Claims Information",
                 "Clarity <em>when it matters.</em>",
                 "Direct access to the people who underwrote the risk, and a clear route for notifying and progressing a claim.")
    body += f'''
  <section class="sec" aria-label="Claims enquiries">
    <div class="wrap split">
      <div>
        <p class="eyebrow">Claims Enquiries</p>
        <h2 class="h2" data-split>Connect with the <em>appropriate team</em></h2>
        <p class="lead" style="margin-top:22px" data-reveal>Your policy or treaty documentation remains the source for notification requirements and the applicable claims route. Until a dedicated claims mailbox is published, please write to our underwriting desk with "Claim notification" in the subject line.</p>
        <div class="btns" style="margin-top:30px" data-reveal><a class="btn btn--gold" href="mailto:underwriting@skyre.com.sa?subject=Claim%20notification" data-magnetic>Notify by email {STAR_IC}</a></div>
      </div>
      {ilist([("Identify your enquiry", "State the policy or treaty reference where appropriate, and the nature of the loss or query."), ("Check your documentation", "Refer to the applicable policy or contractual notification instructions and timeframes."), ("Speak to the team", "We will direct your enquiry to the relevant underwriter and coordinate next steps.")])}
    </div>
  </section>

  <section class="sec sec--tight" aria-label="How a claim moves">
    <div class="wrap">
      {head("How a Claim Moves", 'Four steps, <em>one point of contact</em>', "General guidance. Detailed procedures will be published once approved.")}
      <div class="steps">
        <div class="step" data-reveal><span class="num-tag">01</span><b>Notify</b><p>The cedant notifies the loss with the policy or treaty reference and initial details.</p></div>
        <div class="step" data-reveal><span class="num-tag">02</span><b>Acknowledge</b><p>Sky Re acknowledges the notification and opens a technical review.</p></div>
        <div class="step" data-reveal><span class="num-tag">03</span><b>Coordinate</b><p>We coordinate with reinsurers and, where needed, loss adjusters.</p></div>
        <div class="step" data-reveal><span class="num-tag">04</span><b>Resolve</b><p>Settlement proceeds in line with the policy or treaty terms agreed.</p></div>
      </div>
    </div>
  </section>
'''
    body += cta("Need help finding <em>a contact?</em>", "Use our contact directory to reach the right desk.", ("Contact directory", "contact.html"), ("Legal & regulatory", "legal.html"))
    shell("claims.html", "Claims Information — Sky Re", "How to notify and progress a claim with Sky Re, and who to contact.", "claims", body)


# ---------------------------------------------------------------- Careers & vacancies
VAC = [
    dict(slug="underwriting-analyst", title="Underwriting Analyst", team="Underwriting",
         summary="Support underwriting conversations through research, careful analysis and clear coordination.",
         paras=["This illustrative role supports Sky Re's underwriters across Direct & Facultative portfolios, preparing risk information and technical analysis that inform decisions made on behalf of our reinsurers.",
                "It suits someone curious about how complex assets work, comfortable with numbers and documents, and keen to build specialist market knowledge in Riyadh."],
         items=[("Support analysis", "Research risk context and prepare clear information for the underwriting team."), ("Work collaboratively", "Coordinate with brokers, colleagues and capacity providers on submissions."), ("Develop expertise", "Build specialist knowledge across property, engineering, casualty, marine and energy.")]),
    dict(slug="operations-specialist", title="Operations Specialist", team="Operations",
         summary="Keep post-bind coordination clear, timely and well documented.",
         paras=["This illustrative role supports post-bind coordination: documentation, records and the day-to-day processes that keep delegated authority well governed.",
                "It suits someone organised, precise and service-minded, who enjoys making complex workflows simple for everyone involved."],
         items=[("Coordinate post-bind", "Manage documentation and records for bound risks."), ("Support governance", "Help maintain the controls agreed with capacity providers."), ("Improve workflows", "Find clearer, faster ways for the team to work.")]),
]


def build_careers():
    body = phero("constellation", crumbs(("Resources", None), ("Careers", None)), "Careers &amp; Life at Sky Re",
                 "Build your expertise. <em>Broaden your perspective.</em>",
                 "A place for curious minds, thoughtful conversations and specialist ambition, from the heart of Riyadh.")
    culture = rays_cards([("Curiosity", "Bring questions and develop a deeper understanding of complex risks."), ("Collaboration", "Work with colleagues who value constructive, open dialogue."), ("Responsibility", "Contribute with care, clarity and accountability.")], lambda i: (i + 1, 3))
    vac = "".join(f'''<a class="vac" href="vacancy-{v["slug"]}.html" data-reveal>
          <span class="mono">{E(v["team"])} · Riyadh · Full time</span>
          <b>{E(v["title"])}</b>
          <small>{E(v["summary"])}</small>
          <span class="link-u">View opportunity <span aria-hidden="true">→</span></span>
        </a>''' for v in VAC)
    body += f'''
  <section class="sec" aria-label="Life at Sky Re">
    <div class="wrap split">
      <div>
        <p class="eyebrow">Life at Sky Re</p>
        <h2 class="h2" data-split>Work with purpose. <em>Grow through connection.</em></h2>
      </div>
      <p class="lead" data-reveal>Our culture is shaped by four values: underwriting discipline, high-altitude vision, local authority with global reach, and co-aligned partnership. Final culture content and employee stories will be supplied by Sky Re.</p>
    </div>
  </section>

  <section class="sec sec--tight" aria-label="Our culture">
    <div class="wrap">
      {head("Our Culture", 'What shapes <em>our working day</em>')}
      <div class="grid-3">{culture}</div>
    </div>
  </section>

  <section class="sec" aria-label="Current opportunities">
    <div class="wrap">
      {head("Current Opportunities", 'Find your <em>next chapter</em>', "Illustrative vacancies for design review. Expressions of interest go to our main mailbox.")}
      <div class="vacs">{vac}</div>
    </div>
  </section>
'''
    body += cta("Start a career <em>conversation</em>", "Send your expression of interest to our main mailbox.", ("info@skyre.com.sa", "mailto:info@skyre.com.sa?subject=Careers"), ("Meet the team", "team.html"))
    shell("careers.html", "Careers & Life at Sky Re", "Life at Sky Re, our culture and current opportunities in Riyadh.", "careers", body)

    for v in VAC:
        paras = "".join(f"<p>{E(p)}</p>" for p in v["paras"])
        body = phero("constellation", crumbs(("Careers", "careers.html"), (v["title"], None)), f"Careers · {E(v['team'])} · Illustrative vacancy",
                     E(v["title"]), f"Riyadh · Full time · {E(v['team'])}. {E(v['summary'])}")
        body += f'''
  <section class="sec" aria-label="The opportunity">
    <div class="wrap split">
      <div>
        <p class="eyebrow">The Opportunity</p>
        <h2 class="h2" data-split>Bring curiosity to <em>complex questions</em></h2>
      </div>
      <div class="art-body" data-reveal>{paras}</div>
    </div>
  </section>
  <section class="sec sec--tight" aria-label="Role profile">
    <div class="wrap">
      {head("Sample Role Profile", 'What the role <em>could involve</em>')}
      {ilist(v["items"])}
    </div>
  </section>
'''
        body += cta("Express <em>your interest</em>", "Email us with the role in the subject line. No application form or upload is included on this website.", ("Email Sky Re", f"mailto:info@skyre.com.sa?subject={v['title'].replace(' ', '%20')}"), ("All opportunities", "careers.html"))
        shell(f"vacancy-{v['slug']}.html", f"{v['title']} — Careers at Sky Re", v["summary"], "vacancy", body)


# ---------------------------------------------------------------- Legal
LEGAL = [
    dict(slug="privacy", title="Privacy notice", tag="Privacy", short="How this website handles information.",
         paras=["This website does not collect personal data through forms. The enquiry composer on the contact page prepares an email in your own email application; nothing you type is transmitted to or stored by this website.",
                "When you email Sky Re, we use your message and contact details only to respond to your enquiry. Please do not include sensitive personal data in an email."],
         items=[("Information practices", "Final wording will describe the information Sky Re processes and why."), ("Purposes and lawful basis", "Final wording will set out the purposes and lawful basis for processing."), ("Retention and contact", "Final wording will cover retention periods and how to contact Sky Re about your data.")]),
    dict(slug="cookies", title="Cookie policy", tag="Cookies", short="Cookies and browser storage on this website.",
         paras=["This website sets no advertising or tracking cookies. It uses your browser's session storage for two small conveniences: remembering that you have seen the opening animation, and playing the transition between pages. Both are cleared when you close the tab.",
                "Typefaces are embedded in the website itself; no third-party font service is contacted."],
         items=[("Essential storage", "Session storage for the opening animation and page transitions."), ("Optional analytics", "None at present. Any future analytics will be introduced with consent."), ("Managing preferences", "You can clear session storage at any time through your browser settings.")]),
    dict(slug="terms", title="Website terms", tag="Terms", short="Conditions for using this informational website.",
         paras=["The content of this website is provided for general information about Sky Re and its activities. This website does not quote, bind or accept submissions, and nothing on it is an offer of insurance or reinsurance.",
                "Interactive illustrations, including the treaty structure explorer, are educational and do not represent Sky Re terms. The Sky Re name, mark and brand assets are the property of Sky Universal Company."],
         items=[("Informational purpose", "General information only; not an offer or solicitation."), ("Website content", "Illustrations, examples and sample content are identified as such."), ("Contact and updates", "These terms will be finalised and dated by Sky Re's advisers.")]),
    dict(slug="complaints", title="Complaints information", tag="Complaints", short="How to raise a complaint and how it is handled.",
         paras=["If you wish to raise a complaint, please write to info@skyre.com.sa with \"Complaint\" in the subject line, including your contact details and the nature of the complaint.",
                "The full complaints process, response timeframes and escalation routes will be published here once approved."],
         items=[("How to contact us", "Email info@skyre.com.sa with \"Complaint\" in the subject line."), ("Information to include", "Your contact details, any policy or treaty reference, and a description of the issue."), ("Process and timeframes", "Approved process steps and response timeframes will be published here.")]),
    dict(slug="regulatory", title="Regulatory disclosures", tag="Disclosures", short="Entity and regulatory information.",
         paras=["Sky Re (Sky Universal Company) is a licensed reinsurance Managing General Agency headquartered in Riyadh, Kingdom of Saudi Arabia. Sky Re underwrites on behalf of reinsurers under delegated authority and does not retain risk on its own balance sheet.",
                "Licence details, legal entity information and regulatory statements will be published here once confirmed. No illustrative numbers are presented as company facts."],
         items=[("Legal entity information", "Registered name, address and entity details to be confirmed."), ("Regulatory statements", "Licence references and supervisory information to be confirmed."), ("Public disclosures", "Any further required disclosures will be listed here.")]),
]


def build_legal():
    cards = "".join(f'''<a class="card legal-card" href="{l["slug"]}.html" data-reveal>
          <svg class="cres" viewBox="212 216 118 118" aria-hidden="true"><use href="#sr-star" /></svg>
          <span class="tag">{l["tag"]}</span>
          <h3 class="h3">{E(l["title"])}</h3>
          <p class="small">{E(l["short"])}</p>
          <span class="link-u">Read <span aria-hidden="true">→</span></span>
        </a>''' for l in LEGAL)
    body = phero("rays", crumbs(("Resources", None), ("Legal & Regulatory", None)), "Legal &amp; Regulatory",
                 "Information you can <em>find clearly.</em>",
                 "A directory for public legal, privacy, complaints and regulatory information. Final wording is being prepared by Sky Re's compliance team.")
    body += f'''
  <section class="sec" aria-label="Policies and disclosures">
    <div class="wrap">
      {head("Public Information", 'Policies &amp; <em>disclosures</em>')}
      <div class="grid-3 legal-grid">{cards}</div>
      <p class="note" data-reveal>Approved licence numbers, regulatory statements, legal entity details and complaint timeframes will be supplied by Sky Re.</p>
    </div>
  </section>
'''
    body += cta("Need a point <em>of contact?</em>", "Our contact directory can help direct your enquiry.", ("Contact Sky Re", "contact.html"))
    shell("legal.html", "Legal & Regulatory — Sky Re", "Privacy, cookies, website terms, complaints and regulatory disclosures for Sky Re.", "legal", body, noindex=True)

    for i, l in enumerate(LEGAL):
        paras = "".join(f"<p>{E(p)}</p>" for p in l["paras"])
        others = "".join(f'<a href="{o["slug"]}.html">{E(o["title"])}</a>' for o in LEGAL if o is not l)
        body = phero(None, crumbs(("Legal & Regulatory", "legal.html"), (l["title"], None)), f"Legal &amp; Regulatory · {l['tag']}", E(l["title"]),
                     "Plain-language summary for design review. Final wording will be supplied and approved by Sky Re's legal and regulatory advisers.")
        body += f'''
  <section class="sec sec--tight">
    <div class="wrap legal">
      <nav aria-label="Other policies">{others}</nav>
      <div>
        <article class="art-body" data-reveal>{paras}</article>
        <div style="margin-top:50px">{ilist(l["items"])}</div>
      </div>
    </div>
  </section>
'''
        body += cta("Need more <em>information?</em>", "Find the appropriate contact.", ("Contact directory", "contact.html"), ("All policies", "legal.html"))
        shell(f"{l['slug']}.html", f"{l['title']} — Sky Re", l["short"], "legal", body, noindex=True)


# ---------------------------------------------------------------- Portfolio details
def build_portfolios():
    for i, p in enumerate(PF):
        prev, nxt = PF[i - 1], PF[(i + 1) % len(PF)]
        t1, t2, t3 = p["tabs"]
        chips = lambda xs: '<div class="chips">' + "".join(f'<span class="chip">{E(x)}</span>' for x in xs) + "</div>"
        scope = '<ul class="scope">' + "".join(f"<li>{E(x)}</li>" for x in p["scope"]) + "</ul>"
        kind = "Treaty · Proportional & Non-Proportional" if p["group"] == "tr" else "Direct & Facultative"
        subj = p["name"].replace(" ", "%20")
        body = f'''  <section class="pfd-hero">
    <div class="wrap pfd">
      <div>
        {crumbs(("Portfolios", "portfolios.html"), (p["name"], None))}
        <p class="eyebrow">Portfolio {i + 1:02d} · {E(p["cat"])}</p>
        <h1 class="d1" data-split data-now>{E(p["name"])}</h1>
        <p class="lead" style="margin-top:24px" data-reveal>{E(p["intro"])}</p>
        <div class="btns" style="margin-top:34px" data-reveal>
          <a class="btn btn--gold" href="mailto:underwriting@skyre.com.sa?subject={subj}%20enquiry" data-magnetic>Email {E(p["name"])} underwriting {STAR_IC}</a>
        </div>
      </div>
      <div class="pf__vis" data-reveal="scale" data-cursor="Explore">
        <canvas data-pf="{p["id"]}" aria-hidden="true"></canvas>
        <div class="pf__top"><span class="mono">Portfolio {i + 1:02d}</span><span class="mono">Live diagram</span></div>
        <p class="pf__hint">{E(p["hint"])}</p>
        <div class="pf__readout" aria-hidden="true"><small></small><b></b></div>
      </div>
    </div>
  </section>

  <section class="sec sec--tight" aria-label="At a glance">
    <div class="wrap">
      <div class="facts">
        <div data-reveal><small>Line of business</small><b>{E(p["name"])}</b></div>
        <div data-reveal><small>Class</small><b>{E(kind)}</b></div>
        <div data-reveal><small>Region</small><b>Kingdom of Saudi Arabia</b></div>
        <div data-reveal><small>Specialist contact</small><b><a href="mailto:underwriting@skyre.com.sa?subject={subj}%20enquiry">Underwriting desk</a></b></div>
      </div>
    </div>
  </section>

  <section class="sec sec--tight" aria-label="Coverage">
    <div class="wrap pfd-cols">
      <div data-reveal><p class="eyebrow">{E(t1)}</p>{chips(p["prod"])}</div>
      <div data-reveal><p class="eyebrow">{E(t2)}</p>{scope}</div>
      <div data-reveal><p class="eyebrow">{E(t3)}</p>{chips(p["exp"])}</div>
    </div>
  </section>

  <section class="sec sec--tight" aria-label="Underwriting perspective">
    <div class="wrap">
      <div class="statement" data-reveal>
        <span class="mono">Underwriting perspective</span>
        <p>Every exposure has a context. Appetite, limits, exclusions and capacity remain subject to approved product information and specialist review, and are always set within the authority delegated to us by our reinsurers.</p>
      </div>
      <nav class="pager" aria-label="Other portfolios">
        <a href="{prev["id"]}.html" class="pager__prev"><span class="mono">Previous portfolio</span><b>← {E(prev["name"])}</b></a>
        <a href="portfolios.html" class="pager__all"><span class="mono">Overview</span><b>All portfolios</b></a>
        <a href="{nxt["id"]}.html" class="pager__next"><span class="mono">Next portfolio</span><b>{E(nxt["name"])} →</b></a>
      </nav>
    </div>
  </section>
'''
        body += cta(f"Discuss a <em>{E(p['name'].lower())}</em> enquiry", "Connect with our underwriting desk. This website does not quote, bind or accept submissions.", ("underwriting@skyre.com.sa", f"mailto:underwriting@skyre.com.sa?subject={subj}%20enquiry"), ("Treaty structure explorer", "portfolios.html#explorer"))
        shell(f"{p['id']}.html", f"{p['name']} — Portfolios — Sky Re", p["intro"], p["id"], body, ("assets/js/pages/portfolios.js",))


if __name__ == "__main__":
    build_news()
    build_broker()
    build_claims()
    build_careers()
    build_legal()
    build_portfolios()
