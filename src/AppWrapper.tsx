import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'studiolog-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Practice session timer", "Piece and repertoire log", "Progress notes", "Weekly practice goals"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#8b5cf6" color2="#7c3aed" emoji="🎵" name="StudioLog Pro" tagline="Music practice and session logger"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#8b5cf6" emoji="🎵" name="StudioLog Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}