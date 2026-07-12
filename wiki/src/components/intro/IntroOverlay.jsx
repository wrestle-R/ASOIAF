export function IntroOverlay({ onSkip }) {
  return (
    <div className="intro-overlay" aria-hidden="true">
      <div className="intro-ice" />
      <div className="intro-ember" />
      <div className="intro-glint" />
      <div className="intro-wordmark">
        <span>Wiki of</span>
        <strong>Ice <i>&amp;</i> Fire</strong>
        <small>An archive of the known world</small>
      </div>
      <button
        type="button"
        className="skip-intro"
        onClick={onSkip}
        aria-label="Skip intro animation"
      >
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
