import './OptionButton.css';

export default function OptionButton({
  option,
  onClick,
  selected,
  checkbox,
  checked,
}) {
  const classes = `option-btn ${selected ? "selected" : ""} ${
    checkbox && checked ? "checked" : ""
  }`;

  return (
    <button
      className={classes}
      onClick={onClick}
    >
      {checkbox && <input type="checkbox" readOnly checked={!!checked} />}
      <span>{option.label}</span>
    </button>
  );
}
