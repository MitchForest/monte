import type { Component } from 'solid-js';

export const GoldenBeadTray: Component = () => (
  <svg
    width="220"
    height="140"
    viewBox="0 0 220 140"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tray-base-fill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f1d9ab" />
        <stop offset="60%" stop-color="#e3c38b" />
        <stop offset="100%" stop-color="#cfa76a" />
      </linearGradient>
      <linearGradient id="tray-edge-fill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b88a4a" />
        <stop offset="100%" stop-color="#9f7236" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="208" height="122" rx="12" fill="url(#tray-base-fill)" stroke="#8d622d" stroke-width="4" />
    <rect x="2" y="2" width="216" height="20" rx="10" fill="url(#tray-edge-fill)" stroke="#8d622d" stroke-width="3" />
    <rect x="2" y="118" width="216" height="20" rx="10" fill="url(#tray-edge-fill)" stroke="#8d622d" stroke-width="3" />
    <rect x="12" y="26" width="196" height="96" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.08)" stroke-width="2" />
  </svg>
);
