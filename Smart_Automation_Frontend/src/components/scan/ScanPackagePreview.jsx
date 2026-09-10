// Original illustration standing in for an uploaded product photo, annotated
// with mock OCR bounding boxes to visualize field extraction.
export default function ScanPackagePreview({ className = '' }) {
  return (
    <svg viewBox="0 0 380 460" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scanPouch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d9a94a" />
          <stop offset="50%" stopColor="#b9862a" />
          <stop offset="100%" stopColor="#83591a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="380" height="460" fill="#0a1120" />

      <path
        d="M64 46 C64 26 80 12 102 12 L278 12 C300 12 316 26 316 46 L328 400 C328 426 308 444 280 444 L100 444 C72 444 52 426 52 400 Z"
        fill="url(#scanPouch)"
        stroke="#5f4517"
        strokeWidth="2"
      />
      <path d="M78 12 L302 12 L296 -2 C293 -8 287 -12 280 -12 L100 -12 C93 -12 87 -8 84 -2 Z" fill="#6b4d1c" transform="translate(0 14)" />

      <rect x="86" y="118" width="208" height="272" rx="8" fill="#0e1c14" stroke="#2a5c3d" strokeWidth="1.5" />

      {/* MRP */}
      <g>
        <rect x="100" y="132" width="140" height="26" rx="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <text x="106" y="149" fill="#eef2f8" fontSize="12" fontFamily="Manrope, sans-serif" fontWeight="700">MRP ₹ 120.00</text>
      </g>
      <text x="100" y="172" fill="#93a0b8" fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.5">(INCL. OF ALL TAXES)</text>

      {/* Batch */}
      <g>
        <rect x="100" y="184" width="118" height="22" rx="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <text x="106" y="199" fill="#eef2f8" fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="600">BATCH NO.: A1234</text>
      </g>

      {/* Packed date */}
      <g>
        <rect x="100" y="214" width="132" height="22" rx="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <text x="106" y="229" fill="#eef2f8" fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="600">PKD: 01/04/2024</text>
      </g>

      {/* Expiry */}
      <g>
        <rect x="100" y="244" width="140" height="22" rx="3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <text x="106" y="259" fill="#eef2f8" fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="600">EXPIRY: 31/03/2025</text>
      </g>

      {/* FSSAI */}
      <g>
        <rect x="100" y="296" width="176" height="40" rx="4" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <text x="108" y="313" fill="#f2c94c" fontSize="12" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700">fssai</text>
        <text x="108" y="329" fill="#93a0b8" fontSize="8" fontFamily="Inter, sans-serif">LIC. NO. 10012022001031</text>
      </g>

      {/* Missing manufacturer name — flagged */}
      <g>
        <rect x="100" y="348" width="176" height="28" rx="3" fill="none" stroke="#f0473f" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="188" y="366" textAnchor="middle" fill="#f0473f" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">
          Manufacturer name not found
        </text>
      </g>
    </svg>
  )
}