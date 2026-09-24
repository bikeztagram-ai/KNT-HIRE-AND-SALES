import React from "react";
export default function PublicSite(){
 return <div className="public-site">
  <header className="site-header"><a href="#top"><img src="/knt-logo.svg" alt="KNT Hire & Sales Ltd"/></a><nav><a href="#stock">Forklifts for Sale</a><a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a></nav><a className="header-call" href="tel:01377200523">Call KNT</a></header>
  <main id="top">
   <section className="hero"><div><p className="eyebrow">DRIFFIELD · EAST YORKSHIRE</p><h1>Forklift trucks.<br/><span>Hire. Sales. Support.</span></h1><p>KNT Hire & Sales provides forklift hire, used forklift sales and practical support for businesses across East Yorkshire and beyond.</p><div className="actions"><a className="primary" href="#stock">View forklifts for sale</a><a className="secondary" href="#contact">Get in touch</a></div></div><div className="hero-art"><div className="forklift">KNT</div><strong>FORKLIFT TRUCKS</strong></div></section>
   <section className="service-strip" id="services"><div><b>HIRE</b><span>Short & long-term enquiries</span></div><div><b>SALES</b><span>Used forklifts currently available</span></div><div><b>SERVICING</b><span>Maintenance & repairs</span></div><div><b>SUPPORT</b><span>LOLER & compliance workflows</span></div></section>
   <section className="section" id="stock"><p className="eyebrow">CURRENT STOCK</p><h2>Forklifts <em>for sale</em></h2><div className="stock-grid"><Stock name="Daewoo D15S"/><Stock name="Mitsubishi Grendia 20"/></div></section>
   <section className="section dark" id="about"><p className="eyebrow">ABOUT KNT</p><h2>A local forklift business with a practical approach.</h2><p>KNT Hire & Sales Ltd is based in Driffield, East Yorkshire. Machine specifications, hours and prices will only be published after KNT confirms them.</p></section>
   <section className="section contact" id="contact"><p className="eyebrow">GET IN TOUCH</p><h2>Need a forklift?</h2><p>Sales, hire, servicing and repair enquiries.</p><a className="primary" href="tel:01377200523">01377 200523</a><a className="phone" href="tel:07702813510">07702 813510</a><p>2 Wood Lane, Driffield, YO25 6DU</p></section>
  </main><footer><img src="/knt-logo.svg" alt="KNT Hire & Sales Ltd"/><a href="/app">KNT App</a></footer>
 </div>;
}
function Stock({name}){return <article className="stock-card"><div className="machine-art"><span>FORKLIFT</span></div><small>USED FORKLIFT · AVAILABLE</small><h3>{name}</h3><p>Full specification, hours and price to be confirmed by KNT.</p><a href="#contact">Enquire about this machine →</a></article>}
