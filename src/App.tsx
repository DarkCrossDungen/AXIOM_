import React from 'react';
import { useTheme } from './ThemeContext';
import { Sidebar } from './components/Sidebar';
import { LivePreview } from './components/LivePreview';
import { PropertyInspector } from './components/PropertyInspector';
import { BottomPanel } from './components/BottomPanel';
import { ChatPanel } from './components/ChatPanel';
import { Filmstrip } from './components/Filmstrip';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { NexusPanel } from './components/NexusPanel';
import { PPTPanel } from './components/PPTPanel';
import { ThreeDViewer } from './components/ThreeDViewer';

export default function App() {
  const { colors } = useTheme();
  const [showPlans, setShowPlans] = React.useState(false);
  const [showPPT, setShowPPT] = React.useState(false);
  const [show3D, setShow3D] = React.useState(false);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', color: colors.textPrimary, fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: colors.bgPrimary, overflow: 'hidden' }}>
      {/* Global Pro Tools Sidebar */}
      <Sidebar
        onUpgrade={() => setShowPlans(true)}
        onOpenPPT={() => setShowPPT(true)}
        onOpen3D={() => setShow3D(true)}
      />

      {/* Modal Overlays */}
      {showPlans && <SubscriptionPlans onClose={() => setShowPlans(false)} />}
      {showPPT && <PPTPanel onClose={() => setShowPPT(false)} />}
      {show3D && <ThreeDViewer onClose={() => setShow3D(false)} />}
      <NexusPanel />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
         {/* Top Section: Chat + Filmstrip + Canvas + Inspector */}
         <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <ChatPanel />
            <Filmstrip />
            <main style={{ flex: 1, position: 'relative' }}>
              <LivePreview />
            </main>
            <PropertyInspector />
         </div>

         {/* Bottom Section: Node Graph / Timeline */}
         <BottomPanel />
      </div>
    </div>
  );
}
