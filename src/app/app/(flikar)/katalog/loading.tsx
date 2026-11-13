/** Skelett i Testers mått: toppraden, Mitt test och korten. */
export default function KatalogLaddar() {
  return (
    <div aria-busy="true" aria-label="Laddar Tester">
      <div className="tk-topprad">
        <div className="tk-skelett" style={{ width: 90, height: 20, flex: '0 0 auto' }} />
        <div style={{ flex: 1 }} />
        <div className="tk-skelett" style={{ width: 36, height: 36, borderRadius: '50%', margin: 4 }} />
      </div>
      <div className="tk-pad tk-stack" style={{ paddingTop: 0 }}>
        <div className="tk-rader">
          <div className="tk-rad">
            <div className="tk-skelett" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div style={{ flex: 1, display: 'grid', gap: 6 }}>
              <div className="tk-skelett" style={{ width: '60%', height: 14 }} />
              <div className="tk-skelett" style={{ width: '45%', height: 11 }} />
            </div>
          </div>
        </div>
        <div className="tk-skelett" style={{ width: 110, height: 11, marginTop: 6 }} />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="tk-tkort">
            <div className="tk-skelett" style={{ width: 64, height: 64, borderRadius: 16 }} />
            <div style={{ flex: 1, display: 'grid', gap: 6 }}>
              <div className="tk-skelett" style={{ width: '55%', height: 14 }} />
              <div className="tk-skelett" style={{ width: '40%', height: 11 }} />
              <div className="tk-skelett" style={{ width: '100%', height: 5 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
