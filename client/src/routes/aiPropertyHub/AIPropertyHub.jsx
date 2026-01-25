"use client";

import { NavLink } from "react-router-dom";
import "./AIPropertyHub.scss"; // create corresponding SCSS

const AIPropertyHub = () => {
  return (
    <div className="ai-property-hub">
      <h1>Welcome to AI Property Hub</h1>
      <p>
        Our advanced AI analyzes real estate data to help you make better
        property decisions.
      </p>
      <p className="note">
        Note: AI features are currently only available in the local
        development environment due to API key restrictions.
      </p>

      <div className="hub-sections">
        <div className="section">
          <h2>Property Analysis</h2>
          <p>Discover properties matching your requirements with detailed AI insights.</p>
        </div>

        <div className="section">
          <h2>Location Trends</h2>
          <p>Evaluate neighborhood growth, rental yields, and price appreciation.</p>
        </div>

        <div className="section">
          <h2>Investment Insights</h2>
          <p>Get expert recommendations on property investment potential.</p>
          <NavLink to="/investment-insights" className="btn">
            Go to Investment Insights
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AIPropertyHub;
