export default function Icon() {
  // 256×256 SVG, rounded black tile with "d."
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" rx="56" fill="black" />
      <text
        x="50%" y="58%"
        textAnchor="middle"
        fontSize="150"
        fontFamily="Inter, system-ui, Arial, sans-serif"
        fill="#38bdf8"
      >
        d.
      </text>
    </svg>
  );
}
