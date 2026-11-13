/**
 * Skelett i Idags exakta mått (konceptets V.laddar): toppraden, dagkortet,
 * veckoraden, nivån och raderna, med ett långsamt skimmer. Aldrig en snurra.
 */
export default function IdagLaddar() {
  return (
    <div aria-busy="true" aria-label="Laddar Idag">
      <div className="tk-topprad" style={{ paddingTop: 6, paddingBottom: 6 }}>
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <div className="tk-skelett" style={{ width: 120, height: 12 }} />
          <div className="tk-skelett" style={{ width: 200, height: 22 }} />
        </div>
        <div className="tk-skelett" style={{ width: 36, height: 36, borderRadius: '50%', margin: 4 }} />
      </div>
      <div className="tk-pad tk-stack">
        <div className="tk-skelett" style={{ height: 196, borderRadius: 24 }} />
        <div className="tk-kort" style={{ display: 'grid', gap: 12 }}>
          <div className="tk-skelett" style={{ width: 80, height: 11 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="tk-skelett" style={{ width: 34, height: 34, borderRadius: '50%', margin: '0 auto' }} />
            ))}
          </div>
          <div className="tk-skelett" style={{ width: 160, height: 14 }} />
        </div>
        <div className="tk-rader">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="tk-rad">
              <div className="tk-skelett" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                <div className="tk-skelett" style={{ width: '60%', height: 14 }} />
                <div className="tk-skelett" style={{ width: '40%', height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
