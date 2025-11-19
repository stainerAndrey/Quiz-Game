import { useMemo } from "react";
import ParticipantApp from "./components/ParticipantApp.jsx";
import PresenterApp from "./components/PresenterApp.jsx";
import Scoreboard from "./components/Scoreboard.jsx";

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function App() {
  const query = useQuery();
  const isPresenter = query.get("presenter") === "1";
  const isScoreboardOnly = query.get("scoreboard") === "1";

  if (isScoreboardOnly) {
    return (
      <div style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        padding: 'clamp(0.5rem, 2vw, 1rem)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <h1>Quiz Scoreboard</h1>
        <Scoreboard />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      padding: 'clamp(0.5rem, 2vw, 1rem)',
      maxWidth: isPresenter ? '1600px' : '1400px',
      margin: '0 auto',
      width: '100%',
    }}>
      {isPresenter ? <PresenterApp /> : <ParticipantApp />}
    </div>
  );
}
