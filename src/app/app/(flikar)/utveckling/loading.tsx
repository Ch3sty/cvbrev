/** Skelett i Utvecklings mått: nattkortet med kurvan och korten under. */
export default function UtvecklingLaddar() {
  return (
    <div aria-busy="true" aria-label="Laddar Utveckling">
      <div className="tk-topprad">
        <div className="tk-skelett" style={{ width: 120, height: 20, flex: '0 0 auto' }} />
        <div style={{ flex: 1 }} />
        <div className="tk-skelett" style={{ width: 36, height: 36, borderRadius: '50%', margin: 4 }} />
      </div>
      <div className="tk-pad tk-stack" style={{ paddingTop: 0 }}>
        <div className="tk-skelett" style={{ height: 250, borderRadius: 20 }} />
        <div className="tk-kort" style={{ display: 'grid', gap: 12 }}>
          <div className="tk-skelett" style={{ width: 110, height: 11 }} />
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="tk-skelett" style={{ width: 36, height: 36, borderRadius: 11 }} />
              <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                <div className="tk-skelett" style={{ width: '50%', height: 13 }} />
                <div className="tk-skelett" style={{ width: '100%', height: 6 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="tk-skelett" style={{ height: 120, borderRadius: 20 }} />
      </div>
    </div>
  );
}
