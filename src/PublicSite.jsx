import React from "react";
import StockVisual from "./StockVisual";

const stock = [
  { id:"daewoo", name:"Daewoo D15S", image:"/stock/daewoo-d15s.webp", tag:"USED FORKLIFT · AVAILABLE", note:"Used forklift currently being prepared for sale. Full specification and price to be confirmed by KNT." },
  { id:"grendia", name:"Mitsubishi Grendia 20", image:"/stock/mitsubishi-grendia-20.webp", tag:"USED FORKLIFT · AVAILABLE", note:"Real KNT stock photography. Full specification and price to be confirmed by KNT." },
  { id:"mitsubishi", name:"Mitsubishi 2.5T", image:"/stock/mitsubishi-fg25.webp", tag:"USED FORKLIFT · AVAILABLE", note:"Used forklift currently being prepared for sale. Model specification and price to be confirmed by KNT." }
];

export default function PublicSite(){
  return <div className="public-site">
    <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":"KNT Hire & Sales Ltd","telephone":"+44 1377 200523","url":"/","address":{"@type":"PostalAddress","streetAddress":"2 Wood Lane","addressLocality":"Driffield","postalCode":"YO25 6DU","addressCountry":"GB"},"areaServed":"East Yorkshire"})}</script>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="KNT Hire & Sales home"><img src="/knt-logo.svg" alt="KNT Hire & Sales Ltd — Forklift Trucks"/></a>
      <nav aria-label="Main navigation">
        <a className="active" href="#top">Home</a><a href="#stock">Forklifts for Sale</a><a href="#hire">Hire</a><a href="#services">Servicing</a><a href="#about">About</a><a href="#contact">Contact</a>
      </nav>
      <div className="header-contact"><a href="tel:01377200523"><b>01377 200523</b><small>Mon - Fri 8:00 - 17:00</small></a><span className="location"><b>📍 Driffield</b><small>East Yorkshire</small></span></div>
      <a className="header-call" href="tel:01377200523">Call KNT</a>
    </header>

    <main id="main-content">
      <section className="hero" id="top">
        <StockVisual hero item={stock[0]} />
        <div className="hero-overlay"/>
        <div className="hero-copy">
          <p className="eyebrow">DRIFFIELD · EAST YORKSHIRE</p>
          <h1>Quality forklifts</h1>
          <div className="hero-lines"><b>HIRE</b><i/> <b>SALES</b><i/> <b>SERVICING</b></div>
          <p className="hero-lead">KNT Hire & Sales Ltd supply quality used forklifts, offer flexible hire options and provide practical servicing and support across East Yorkshire and beyond.</p>
          <div className="hero-actions"><a className="primary" href="#stock">View forklifts for sale →</a><a className="secondary" href="#contact">Enquire now →</a></div>
        </div>
        <div className="hero-stock"><span>REAL KNT STOCK</span><strong>FORKLIFT<br/>TRUCKS</strong></div>
        <div className="hero-services"><a href="#hire"><b>⚑ HIRE</b><small>Short & long-term hire</small></a><a href="#stock"><b>▣ SALES</b><small>Quality used forklifts</small></a><a href="#services"><b>⚒ SERVICING</b><small>Repairs & maintenance</small></a><a href="#contact"><b>⚙ PARTS</b><small>Advice & support</small></a></div>
      </section>

      <section className="stock section" id="stock">
        <div className="section-head"><div><p className="eyebrow">LATEST STOCK</p><h2>Forklifts <em>for sale</em></h2></div><a href="#contact">View all stock →</a></div>
        <div className="stock-grid">{stock.map(item=><article className="stock-card" key={item.id}>
          <StockVisual item={item} />
          <div className="stock-body"><h3>{item.name}</h3><p>{item.note}</p><a className="card-cta" href="#contact">View details →</a></div>
        </article>)}</div>
      </section>

      <section className="services section dark" id="services">
        <div className="services-copy"><p className="eyebrow">OUR SERVICES</p><h2>Supporting your business</h2><p>From a single forklift hire to ongoing fleet support, KNT provides a practical service built around keeping your equipment working.</p><a className="secondary" href="#contact">Find out more →</a></div>
        <div className="service-cards"><a href="#hire"><b>▣</b><h3>Forklift Hire</h3><p>Short & long-term hire options.</p></a><a href="#contact"><b>⚒</b><h3>Servicing & Repairs</h3><p>Keep your fleet running at its best.</p></a><a href="#contact"><b>⚙</b><h3>Parts & Attachments</h3><p>Genuine parts and practical advice.</p></a><a href="#stock"><b>▤</b><h3>Sales</h3><p>Quality used forklifts in stock.</p></a></div>
      </section>

      <section className="section split" id="hire">
        <div><p className="eyebrow">HIRE · SALES · SUPPORT</p><h2>A local forklift business with a practical approach.</h2></div>
        <div><p>KNT Hire & Sales Ltd is based in Driffield, East Yorkshire. We can help with forklift hire, used machine sales, servicing, repairs, parts and compliance support.</p><a className="primary" href="#contact">Talk to KNT →</a></div>
      </section>

      <section className="contact section" id="contact">
        <div><p className="eyebrow">GET IN TOUCH</p><h2>Need a forklift?</h2><p>Sales, hire, servicing and repair enquiries.</p></div>
        <div className="contact-actions"><a className="primary" href="tel:01377200523">01377 200523</a><a href="tel:07702813510">07702 813510</a><a href="https://wa.me/447702813510" target="_blank" rel="noreferrer">WhatsApp enquiry →</a><p>2 Wood Lane, Driffield, YO25 6DU</p></div>
      </section>
    </main>
    <footer><img src="/knt-logo.svg" alt="KNT Hire & Sales Ltd"/><span>© KNT Hire & Sales Ltd · East Yorkshire</span><a href="/app">KNT App →</a></footer>
  </div>;
}