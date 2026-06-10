// Фиксированный «акварельный» фон: пастельные водяные пятна, донные волны
// и едва заметное зерно бумаги. Всё на transform/opacity.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export default function Liquid() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-[16%] -left-[10%] h-[58vh] w-[58vh] rounded-full opacity-[0.5]"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #BDE7E0 0%, transparent 62%)',
          filter: 'blur(80px)',
          animation: 'drift-a 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[20%] -right-[14%] h-[66vh] w-[66vh] rounded-full opacity-[0.45]"
        style={{
          background: 'radial-gradient(circle at 60% 40%, #C4E2F2 0%, transparent 60%)',
          filter: 'blur(100px)',
          animation: 'drift-b 34s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-[22%] left-[16%] h-[60vh] w-[60vh] rounded-full opacity-[0.4]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #D4EFE3 0%, transparent 58%)',
          filter: 'blur(90px)',
          animation: 'drift-c 30s ease-in-out infinite',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-44 opacity-[0.6]">
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[200%]"
          style={{ animation: 'wave-x 38s linear infinite' }}
        >
          <path
            d="M0 90 C 120 60 240 60 360 90 S 600 120 720 90 840 60 960 90 1200 120 1320 90 1440 60 1440 60 V180 H0 Z"
            fill="rgba(15, 110, 99, 0.05)"
          />
        </svg>
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[200%]"
          style={{ animation: 'wave-x 56s linear infinite reverse' }}
        >
          <path
            d="M0 110 C 160 80 320 80 480 110 S 800 140 960 110 1280 80 1440 110 V180 H0 Z"
            fill="rgba(8, 145, 178, 0.045)"
          />
        </svg>
      </div>

      <div
        className="absolute inset-0 opacity-[0.028] mix-blend-multiply"
        style={{ backgroundImage: NOISE }}
      />
    </div>
  )
}
