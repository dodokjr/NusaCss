import { useMotion } from "@nusa-css/react";

export default function App() {
  const {
    ref,
    play,
    pause,
    reverse
  } = useMotion({
    from: {
      opacity: 0,
      y: 50,
      scale: 0.8
    },

    to: {
      opacity: 1,
      y: 0,
      scale: 1
    },

    duration: 800,
    easing: "smooth",
    autoplay: true
  });

  return (
    <div className="container">
      <div ref={ref} className="card">
        <h2>Nusa Motion</h2>
        <p>JavaScript Animation Engine</p>
      </div>

      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reverse}>Reverse</button>
    </div>
  );
}