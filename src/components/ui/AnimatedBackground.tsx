'use client';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'purple' | 'emerald' | 'amber';
}

export default function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  const colorSchemes = {
    default: {
      orb1: 'rgba(236, 72, 153, 0.08)',
      orb1Secondary: 'rgba(147, 51, 234, 0.05)',
      orb2: 'rgba(59, 130, 246, 0.06)',
      orb2Secondary: 'rgba(139, 92, 246, 0.04)',
      orb3: 'rgba(16, 185, 129, 0.05)',
      orb3Secondary: 'rgba(59, 130, 246, 0.03)',
    },
    purple: {
      orb1: 'rgba(147, 51, 234, 0.08)',
      orb1Secondary: 'rgba(236, 72, 153, 0.05)',
      orb2: 'rgba(236, 72, 153, 0.06)',
      orb2Secondary: 'rgba(139, 92, 246, 0.04)',
      orb3: 'rgba(59, 130, 246, 0.05)',
      orb3Secondary: 'rgba(147, 51, 234, 0.03)',
    },
    emerald: {
      orb1: 'rgba(16, 185, 129, 0.08)',
      orb1Secondary: 'rgba(20, 184, 166, 0.05)',
      orb2: 'rgba(20, 184, 166, 0.06)',
      orb2Secondary: 'rgba(6, 182, 212, 0.04)',
      orb3: 'rgba(59, 130, 246, 0.05)',
      orb3Secondary: 'rgba(16, 185, 129, 0.03)',
    },
    amber: {
      orb1: 'rgba(245, 158, 11, 0.08)',
      orb1Secondary: 'rgba(249, 115, 22, 0.05)',
      orb2: 'rgba(249, 115, 22, 0.06)',
      orb2Secondary: 'rgba(239, 68, 68, 0.04)',
      orb3: 'rgba(234, 179, 8, 0.05)',
      orb3Secondary: 'rgba(245, 158, 11, 0.03)',
    },
  };

  const colors = colorSchemes[variant];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.9 }}>
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: `radial-gradient(circle, ${colors.orb1} 0%, ${colors.orb1Secondary} 40%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: 'float-orb1 25s ease-in-out infinite'
          }}
        />

        <div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: `radial-gradient(circle, ${colors.orb2} 0%, ${colors.orb2Secondary} 40%, transparent 70%)`,
            filter: 'blur(80px)',
            animation: 'float-orb2 30s ease-in-out infinite'
          }}
        />

        <div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: `radial-gradient(circle, ${colors.orb3} 0%, ${colors.orb3Secondary} 40%, transparent 70%)`,
            filter: 'blur(70px)',
            animation: 'float-orb3 20s ease-in-out infinite'
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(150px, -100px) scale(1.2); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }
        @keyframes float-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-200px, 150px) scale(0.8); }
          66% { transform: translate(100px, -80px) scale(1.1); }
        }
        @keyframes float-orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, -80px) scale(1.1); }
        }
      `}} />
    </>
  );
}
