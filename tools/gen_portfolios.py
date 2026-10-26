"""Generate portfolios.html from the portfolio content below.

Run:  python tools/gen_portfolios.py && python tools/sync-partials.py
"""
import html
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
E = html.escape

PF = [
    dict(id="property", name="Property", group="df", cat="Direct & Facultative · Property",
         hint="Move across the assets to reveal their protection layers",
         intro="Comprehensive underwriting protection for commercial and industrial assets, utility power generation plants, and landmark mega-projects against physical loss, damage, and business interruption.",
         tabs=("Main Products", "Coverage Scope", "Industry Exposures"),
         prod=["Commercial & Industrial Property", "Power Plants", "Mega Projects Coverage", "Business Interruption (BI) in Low to Medium Risks", "Property Damage"],
         scope=["Physical loss or damage to buildings, plant, equipment, and inventories.", "Natural catastrophe (CAT) endorsements including flood and earthquake.", "Business interruption (BI) protection structured for low to medium risk profiles.", "Optional terrorism add-ons tailored to asset location and profile."],
         exp=["Industrial & Manufacturing Complexes", "Power Generation & Utilities", "Giga & Mega Developments", "Commercial Real Estate & Logistics"]),
    dict(id="engineering", name="Engineering", group="df", cat="Direct & Facultative · Engineering",
         hint="Move along the project to follow cover from groundworks to operation",
         intro="Technical all-risk underwriting for construction, plant erection, machinery breakdown, and renewable energy projects, from groundworks through testing, commissioning, and operation.",
         tabs=("Main Products", "Coverage Scope", "Industry Exposures"),
         prod=["Contractors’ All Risks (CAR)", "Erection All Risks (EAR)", "Machinery Breakdown", "Renewable Energy Projects", "Construction & Installation Risks"],
         scope=["All-risk coverage for construction and installation projects across civil and industrial works.", "Coverage spanning cold/hot testing phases and commissioning handovers.", "Protection against sudden physical machinery and equipment breakdown.", "Potential Advance Loss of Profit (ALOP) extensions following covered project delays."],
         exp=["Civil Infrastructure & Transport", "Solar PV & Wind Renewables", "Industrial Plant Erection", "Heavy Turbines & Plant Machinery"]),
    dict(id="casualty", name="Casualty", group="df", cat="Direct & Facultative · Casualty",
         hint="Point at a third party to see which liability cover responds",
         intro="Specialized liability underwriting spanning Energy and Non-Energy Commercial General Liability, Third-Party Liability, Cyber, Project Liability, and Professional Indemnity.",
         tabs=("Main Products", "Coverage Scope", "Industry Exposures"),
         prod=["Commercial General Liability (CGL) — Energy & Non-Energy", "Third-Party Liability", "Cyber", "Project Liability", "Professional Indemnity (PI)"],
         scope=["Coverage for workplace injuries and operational liability exposures.", "Third-party bodily injury and property damage across Energy and Non-Energy segments.", "Protection against professional negligence, design/advisory errors, and project liability.", "Executive liability and specialized cyber risk coverage."],
         exp=["Energy & Industrial Operators", "Engineering & Advisory Firms", "Digital, Financial & Enterprise Cyber", "Major Project Consortia & Boards"]),
    dict(id="marine", name="Marine Cargo", group="df", cat="Direct & Facultative · Marine Cargo",
         hint="Point at the ship, crane, aircraft or train",
         intro="Transit and project cargo underwriting covering commercial goods, heavy project equipment, and Delay in Start-Up (DSU) across multimodal transport corridors.",
         tabs=("Main Products", "Coverage Scope", "Industry Exposures"),
         prod=["Marine Cargo (Annual or Single Transit)", "Project Cargo Risks Only", "Delay in Start-Up (DSU)", "Goods in Transit (Road, Rail, Air & Sea)", "Infrastructure & Power Project Exposures"],
         scope=["Coverage for an Annual Policy or single transit issued to cover losses occurring to goods during transport by road, rail, air, or sea.", "Coverage for parties involved in constructing infrastructural works, power plants, manufacturing sites, or extensions to such objects.", "Delay in Start-Up (DSU) protection safeguarding scheduled project commissioning."],
         exp=["Heavy-Lift Power & Plant Cargo", "Infrastructure Construction Logistics", "Manufacturing Site Extensions", "Multimodal Supply Chains"]),
    dict(id="energy", name="Energy", group="df", cat="Direct & Facultative · Energy",
         hint="Move from upstream to downstream to inspect each exposure",
         intro="Specialized underwriting across Upstream exploration and production and Downstream refining, gas processing, and petrochemical operations.",
         tabs=("Main Products", "Coverage Scope", "Industry Exposures"),
         prod=["Downstream", "Upstream", "Property Damage", "Business Interruption", "Machinery Breakdown"],
         scope=["Physical Property Damage (PD) for Upstream and Downstream energy assets and facilities.", "Business Interruption (BI) protecting operational cashflows following covered physical loss.", "Machinery Breakdown (MB) for critical compressors, turbines, and processing equipment."],
         exp=["Refineries & Petrochemical Complexes", "Gas Processing & Terminal Assets", "Upstream Production & Drilling Assets", "Critical Rotating & Process Machinery"]),
    dict(id="treaty", name="Treaty Reinsurance", group="tr", cat="Treaty · Proportional & Non-Proportional",
         hint="Move up and down the stack to inspect each layer",
         intro="Proportional (Quota Share & Surplus) and Non-Proportional (Risk XL, Catastrophe XL & Aggregate XL) treaty structures protecting insurer portfolios across Fire, Engineering, and Marine Casualty.",
         tabs=("Treaty Structures", "Coverage Scope", "Covered Portfolios"),
         prod=["Proportional Treaty", "Quota Share (QS)", "Surplus Treaty", "Non-Proportional Treaty", "Risk Excess of Loss (Risk XL)", "Catastrophe Excess of Loss (Cat XL)", "Aggregate Excess of Loss (Agg XL)"],
         scope=["Quota Share (QS) and Surplus treaties across Fire, Engineering, and Marine Casualty classes.", "Excess of Loss structures: Risk Excess of Loss, Catastrophe Excess of Loss, and Aggregate Excess of Loss.", "Physical loss/damage and/or Liability, and Business Interruption of an entire portfolio."],
         exp=["Fire & Property Portfolios", "Engineering Portfolios", "Marine Casualty Books", "Catastrophe & Aggregate Portfolio Protection"]),
]

ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 11L11 1M4 1h7v7" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>'


def chips(items):
    return '<div class="chips">' + ''.join(f'<span class="chip">{E(i)}</span>' for i in items) + '</div>'


def scope(items):
    return '<ul class="scope">' + ''.join(f'<li>{E(i)}</li>' for i in items) + '</ul>'


def article(n, p):
    i = p["id"]
    t1, t2, t3 = p["tabs"]
    subj = p["name"].replace(" ", "%20")
    return f'''
        <article class="pf" id="{i}" data-group="{p["group"]}" aria-labelledby="{i}-h">
          <div class="pf__vis" data-reveal="scale" data-cursor="Explore">
            <canvas data-pf="{i}" aria-hidden="true"></canvas>
            <div class="pf__top"><span class="mono">Portfolio {n:02d}</span><span class="mono">{E(p["cat"])}</span></div>
            <p class="pf__hint">{E(p["hint"])}</p>
            <div class="pf__readout" aria-hidden="true"><small></small><b></b></div>
          </div>
          <div class="pf__body">
            <span class="num-tag">{n:02d} / 06</span>
            <h2 id="{i}-h" data-split>{E(p["name"])}</h2>
            <p class="lead" data-reveal>{E(p["intro"])}</p>
            <div class="tabs" role="tablist" aria-label="{E(p["name"])} details" data-tabs>
              <button class="tab" role="tab" id="{i}-t1" aria-controls="{i}-p1" aria-selected="true">{E(t1)}</button>
              <button class="tab" role="tab" id="{i}-t2" aria-controls="{i}-p2" aria-selected="false" tabindex="-1">{E(t2)}</button>
              <button class="tab" role="tab" id="{i}-t3" aria-controls="{i}-p3" aria-selected="false" tabindex="-1">{E(t3)}</button>
            </div>
            <div class="pf__panel">
              <div class="tabpanel" role="tabpanel" id="{i}-p1" aria-labelledby="{i}-t1">{chips(p["prod"])}</div>
              <div class="tabpanel" role="tabpanel" id="{i}-p2" aria-labelledby="{i}-t2" hidden>{scope(p["scope"])}</div>
              <div class="tabpanel" role="tabpanel" id="{i}-p3" aria-labelledby="{i}-t3" hidden>{chips(p["exp"])}</div>
            </div>
            <div class="pf__cta">
              <a class="mail" href="mailto:underwriting@skyre.com.sa?subject={subj}%20enquiry"><span class="mail__ic">{ARROW}</span><span><b>Email {E(p["name"])} underwriting</b><small>underwriting@skyre.com.sa</small></span></a>
              <a class="link-u" href="{i}.html">Explore the portfolio <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </article>'''


def main():
    tpl = (ROOT / "tools" / "portfolios.tpl.html").read_text(encoding="utf-8")
    arts = ''.join(article(n, p) for n, p in enumerate(PF, 1))
    out = tpl.replace("<!-- @@PORTFOLIOS -->", arts)
    (ROOT / "portfolios.html").write_text(out, encoding="utf-8")
    print("wrote portfolios.html")


if __name__ == "__main__":
    main()
