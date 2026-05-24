interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onCommit?: () => void;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onCommit,
}: SliderControlProps) {
  return (
    <div className="slider-field">
      <div className="slider-field__row">
        <label className="control-field__label">{label}</label>
        <span className="control-field__value">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        aria-label={label}
      />
    </div>
  );
}
