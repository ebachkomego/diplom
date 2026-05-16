import React from 'react';
import { Printer } from 'lucide-react';

const PrintActionButton = ({ onClick, label = 'Печать отчёта' }) => (
  <button className="btn-outline no-print" onClick={onClick}>
    <Printer size={16} />
    {label}
  </button>
);

export default PrintActionButton;
