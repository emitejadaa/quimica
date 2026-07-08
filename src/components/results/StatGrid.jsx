export default function StatGrid({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(108px,1fr))', gap: 8 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: '#fff6e6', border: '3px solid #3d2410', borderRadius: 12, padding: '7px 9px',
          boxShadow: '0 5px 0 #3d2410', display: 'flex', flexDirection: 'column', gap: 1,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: '#8a6a45', textTransform: 'uppercase', letterSpacing: '.3px', display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{s.icon}</span>{s.label}
          </div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 16, color: s.danger ? '#c8102e' : '#2b1c0e', lineHeight: 1.1 }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
