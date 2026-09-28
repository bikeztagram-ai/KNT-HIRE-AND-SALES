import React from "react";

const stock = [
 {name:"Daewoo D15S", image:"/knt-stock-daewoo.jpg", fuel:"Diesel", description:"Practical used forklift photographed in the KNT workshop."},
 {name:"Mitsubishi Grendia 20", image:"/knt-stock-grendia.jpg", fuel:"LPG", description:"Clean Grendia 20 with genuine KNT workshop photography."},
 {name:"Mitsubishi FG25N", image:"/knt-stock-mitsubishi.jpg", fuel:"Petrol / LPG", description:"Mitsubishi truck currently presented as part of KNT stock."}
];

export default function PublicSite(){
 return <div className="public-site">
  <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":"KNT Hire & Sales Ltd","telephone":"+44 1377 200523","url":"/","address":{"@type":"PostalAddress","streetAddress":"2 Wood Lane","addressLocality":"Driffield","postalCode":"YO25 6DU","addressCountry":"GB"},"areaServed":"East Yorkshire"})}</script>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header">
   <a className="brand" href="#top"><img src="/knt-logo.webp?v=3" alt="KNT Hire & Sales Ltd" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/knt-logo.svg"}}/></a>
   <nav aria-label="Main navigation"><a className="active" href="#top">Home</a><a href="#stock">Forklifts for Sale</a><a href="#hire">Hire</a><a href="#services">Servicing</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
   <div className="header-meta"><a className="header-phone" href="tel:01377200523"><b>01377 253324</b><span>Mon - Fri 8:00 - 17:00</span></a><a className="header-location" href="#contact"><b>Driffield</b><span>East Yorkshire</span></a></div>
   <a className="header-call" href="tel:01377200523">Call KNT</a>
  </header>
  <main id="main-content" className="public-main">
   <section className="hero" id="top">
    <div className="hero-copy"><p className="eyebrow">DRIFFIELD · EAST YORKSHIRE</p><h1>Quality forklifts<br/><span>Hire | Sales | Servicing</span></h1><p>KNT Hire & Sales Ltd supply quality used forklifts, offer flexible hire options and provide expert servicing and repairs across East Yorkshire and beyond.</p><div className="actions"><a className="primary" href="#stock">⌕ &nbsp; View forklifts for sale&nbsp; →</a><a className="secondary" href="#contact">Enquire now&nbsp; →</a></div></div>
    <div className="hero-photo"><img src="/knt-hero.jpg" alt="KNT forklifts in the workshop" /></div>
   </section>
   <section className="service-strip" id="hire" aria-label="KNT services">
    <a href="#contact"><span className="service-icon">◈</span><b>HIRE</b><small>Short & long term hire</small></a>
    <a href="#stock"><span className="service-icon">▣</span><b>SALES</b><small>Quality used forklifts</small></a>
    <a href="#services"><span className="service-icon">⌁</span><b>SERVICING</b><small>Repairs & maintenance</small></a>
    <a href="#contact"><span className="service-icon">⚙</span><b>PARTS</b><small>Advice & support</small></a>
   </section>
   <section className="section stock-section" id="stock"><div className="section-head"><div><p className="eyebrow">LATEST STOCK</p><h2>Forklifts for sale</h2></div><a className="text-link" href="#contact">View all stock&nbsp; →</a></div><div className="stock-grid">{stock.map(item=><Stock key={item.name} {...item}/>)}</div></section>
   <section className="services-panel section" id="services"><div className="services-intro"><p className="eyebrow">OUR SERVICES</p><h2>Supporting your business</h2><p>From single forklift hire to full fleet support, KNT Hire & Sales Ltd provide a reliable and professional service.</p><a className="secondary dark-button" href="#contact">Find out more&nbsp; →</a></div><div className="service-cards"><ServiceCard image="/knt-stock-grendia.jpg" title="Forklift Hire" text="Short & long term hire options available."/><ServiceCard image="/knt-stock-daewoo.jpg" title="Servicing & Repairs" text="Keep your fleet running at its best."/><ServiceCard image="/knt-stock-mitsubishi.jpg" title="Parts & Attachments" text="Genuine parts and practical support."/><ServiceCard image="/knt-hero.jpg" title="Sales" text="Quality used forklifts in stock." crop/></div></section>
   <section className="about-band section" id="about"><div><p className="eyebrow">ABOUT KNT</p><h2>Forklift specialists based in Driffield.</h2></div><p>KNT Hire & Sales Ltd combines used forklift sales, hire, servicing, repairs and practical support for businesses across East Yorkshire and beyond.</p></section>
   <section className="contact section" id="contact"><p className="eyebrow">GET IN TOUCH</p><h2>Talk to KNT about your forklift requirements.</h2><div className="contact-grid"><div><a className="primary" href="tel:01377200523">01377 200523</a><a className="secondary" href="https://wa.me/447702813510" target="_blank" rel="noreferrer">Message KNT on WhatsApp</a></div><div><b>2 Wood Lane</b><span>Driffield, YO25 6DU</span></div><div><b>Opening hours</b><span>Mon - Fri · 8:00 - 17:00</span></div></div></section>
  </main>
  <footer><img src="/knt-logo.webp?v=3" alt="KNT Hire & Sales Ltd" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/knt-logo.svg"}}/><span>© KNT Hire & Sales Ltd</span><a href="/app">KNT App</a></footer>
 </div>;
}
function Stock({name,image,fuel,description}){return <article className="stock-card"><a className="stock-photo" href="#contact"><img src={image} alt={name}/><span>View details&nbsp; →</span></a><div className="stock-body"><small>USED FORKLIFT · AVAILABLE</small><h3>{name}</h3><div className="spec-line"><span>▣ {fuel}</span><span>📍 Driffield, East Yorkshire</span></div><p>{description}</p><a className="stock-enquire" href="#contact">Enquire about this machine&nbsp; →</a></div></article>}
function ServiceCard({image,title,text,crop}){return <article className="service-card"><img className={crop?"crop":""} src={image} alt=""/><div><span className="service-badge">✦</span><h3>{title}</h3><p>{text}</p></div></article>}
