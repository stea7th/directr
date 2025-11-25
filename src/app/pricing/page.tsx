// src/app/pricing/page.tsx

import "./pricing.css";
import Link from "next/link";

const CREATOR_PRICE_ID = "price_1SAKPiHf9pHXHuQZv6P0NzBA";
const STUDIO_PRICE_ID  = "price_1SAKPTHf9pHXHuQZhXnV7fMT";
const AGENCY_PRICE_ID  = "price_1SAKPSHf9pHXHuQZavT1Luaw";

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <h1>Choose your Directr plan</h1>
      <p className="sub">Start simple, scale when you’re ready.</p>

      <div className="plans">
        {/* Creator */}
        <div className="card">
          <h2>Creator</h2>
          <p className="price">${19}<span>/month</span></p>
          <ul>
            <li>X videos / month</li>
            <li>Basic clipping & captions</li>
            <li>Single workspace</li>
          </ul>

          <form action="/api/checkout" method="POST">
            <input type="hidden" name="priceId" value={CREATOR_PRICE_ID} />
            <button type="submit" className="btn">Start with Creator</button>
          </form>
        </div>

        {/* Studio */}
        <div className="card popular">
          <div className="tag">MOST POPULAR</div>
          <h2>Studio</h2>
          <p className="price">${49}<span>/month</span></p>
          <ul>
            <li>Higher video quota</li>
            <li>Multi-platform outputs</li>
            <li>Priority processing</li>
            <li>2 team seats</li>
          </ul>

          <form action="/api/checkout" method="POST">
            <input type="hidden" name="priceId" value={STUDIO_PRICE_ID} />
            <button type="submit" className="btn">Start with Studio</button>
          </form>
        </div>

        {/* Agency */}
        <div className="card">
          <h2>Agency</h2>
          <p className="price">${99}<span>/month</span></p>
          <ul>
            <li>Bigger video quota</li>
            <li>Shared brand libraries</li>
            <li>Priority support</li>
            <li>5+ team seats</li>
          </ul>

          <form action="/api/checkout" method="POST">
            <input type="hidden" name="priceId" value={AGENCY_PRICE_ID} />
            <button type="submit" className="btn">Start with Agency</button>
          </form>
        </div>
      </div>
    </main>
  );
}
