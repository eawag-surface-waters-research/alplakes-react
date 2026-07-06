import React from "react";

const FlagCH = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#da291c" />
    <rect x="8.75" y="3" width="2.5" height="8" fill="#ffffff" />
    <rect x="6" y="5.75" width="8" height="2.5" fill="#ffffff" />
  </svg>
);

const FlagIT = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#009246" />
    <rect x="6.67" width="6.66" height="14" fill="#ffffff" />
    <rect x="13.33" width="6.67" height="14" fill="#ce2b37" />
  </svg>
);

const FlagFR = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#002654" />
    <rect x="6.67" width="6.66" height="14" fill="#ffffff" />
    <rect x="13.33" width="6.67" height="14" fill="#ce1126" />
  </svg>
);

const FlagAT = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#ed2939" />
    <rect y="4.67" width="20" height="4.66" fill="#ffffff" />
  </svg>
);

const FlagDE = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#000000" />
    <rect y="4.67" width="20" height="4.66" fill="#dd0000" />
    <rect y="9.33" width="20" height="4.67" fill="#ffce00" />
  </svg>
);

const FlagSI = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#ffffff" />
    <rect y="4.67" width="20" height="4.66" fill="#005da4" />
    <rect y="9.33" width="20" height="4.67" fill="#ed1c24" />
    <path d="M3 3 L4.5 5.5 L1.5 5.5 Z" fill="#005da4" />
  </svg>
);

const FlagUnknown = () => (
  <svg viewBox="0 0 20 14" className="flag">
    <rect width="20" height="14" fill="#9e9e9e" />
  </svg>
);

const Flags = {
  CH: FlagCH,
  IT: FlagIT,
  FR: FlagFR,
  AT: FlagAT,
  DE: FlagDE,
  SI: FlagSI,
};

export const Flag = ({ code }) => {
  const Component = Flags[code] || FlagUnknown;
  return <Component />;
};

export default Flag;
