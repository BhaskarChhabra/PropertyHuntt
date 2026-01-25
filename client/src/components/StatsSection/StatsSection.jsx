import React from 'react';
import { BsPeople, BsStar, BsKey, BsGraphUp } from 'react-icons/bs';
import './StatsSection.scss';

function StatsSection() {
  return (
    <div className="stats-section">
      <h3 className="section-pre-title">Trusted Worldwide</h3>
      <h2 className="section-title-main">
        Trusted by <strong>Industry Leaders</strong>
      </h2>
      <p className="section-subtitle-main">
        Join thousands of companies that rely on our platform for smarter and faster real estate decisions.
      </p>

      <div className="boxes">
        <div className="box">
          <div className="icon-wrapper"><BsPeople /></div>
          <h1>200+</h1>
          <h2>Trusted Partners</h2>
        </div>
        <div className="box">
          <div className="icon-wrapper"><BsStar /></div>
          <h1>4.9</h1>
          <h2>Average Rating</h2>
        </div>
        <div className="box">
          <div className="icon-wrapper"><BsKey /></div>
          <h1>50M+</h1>
          <h2>Properties Listed</h2>
        </div>
        <div className="box">
          <div className="icon-wrapper"><BsGraphUp /></div>
          <h1>98%</h1>
          <h2>Success Rate</h2>
        </div>
      </div>
    </div>
  );
}

export default StatsSection;
