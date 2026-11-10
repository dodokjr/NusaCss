import { MotionView } from "nusa-css/native";

export default function App() {
  return (
    <MotionView
      animate={{
        opacity: [0, 1],
        y: [40, 0],
        scale: [0.9, 1]
      }}
      transition={{ duration: 800 }}
    >
      {/* Isi komponen */}
    </MotionView>
  );
}