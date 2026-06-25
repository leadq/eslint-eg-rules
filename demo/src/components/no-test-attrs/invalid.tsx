// ❌ INVALID: Using data-testid in a non-test file
export const InvalidCard = () => (
  // "data-testid" is forbidden here
  <div data-testid="user-card" className="card">
    {/* "data-cy" is forbidden here */}
    <button data-cy="submit-btn" type="submit">
      Submit
    </button>
  </div>
);
