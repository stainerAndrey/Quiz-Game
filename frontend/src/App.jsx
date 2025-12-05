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
  const baseFontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const scoreboardPadding = 'clamp(1rem, 3vw, 3rem)';
  const containerPadding = isPresenter ? 'clamp(1rem, 3vw, 2.75rem)' : 'clamp(0.75rem, 3vw, 2rem)';

  if (isScoreboardOnly) {
    return (
      <div style={{
        fontFamily: baseFontFamily,
        padding: scoreboardPadding,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
        <h1>Quiz Scoreboard</h1>
        <Scoreboard />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: baseFontFamily,
      padding: containerPadding,
      maxWidth: isPresenter ? '1600px' : '1400px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      {isPresenter ? <PresenterApp /> : <ParticipantApp />}
    </div>
  );
}
