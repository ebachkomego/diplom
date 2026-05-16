import React from 'react';

const KPICard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`kpi-card glass-panel ${colorClass || ''}`}>
    <div className="kpi-content">
      <div className="kpi-text">
        <p className="kpi-title">{title}</p>
        <h3 className="kpi-value">{value}</h3>
      </div>
      <div className="kpi-icon-wrapper">
        <Icon size={22} />
      </div>
    </div>
  </div>
);

export default KPICard;
