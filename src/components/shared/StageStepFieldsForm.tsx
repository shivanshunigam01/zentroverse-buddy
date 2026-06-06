import type { StageFieldDef } from "@/domain/stages/c0-stage-fields";

type Props = {
  fields: StageFieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
};

export function StageStepFieldsForm({ fields, values, onChange, disabled }: Props) {
  if (fields.length === 0) return null;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={values[field.key] ?? ""}
          onChange={(v) => onChange(field.key, v)}
          disabled={disabled || field.readOnly}
        />
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: StageFieldDef;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const label = (
    <label className="mb-1.5 block text-[10px] font-bold uppercase leading-snug tracking-wide text-muted-foreground">
      {field.label}
    </label>
  );
  const className = `input-app w-full px-3 py-2 text-sm`;
  const wrapClass = field.fullWidth ? "sm:col-span-2" : "min-w-0";

  if (field.type === "select") {
    return (
      <div className={wrapClass}>
        {label}
        <select
          className={className}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value || "__empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {field.hint && <p className="mt-1 text-[10px] text-muted-foreground">{field.hint}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={wrapClass}>
        {label}
        <textarea
          className={`${className} min-h-[72px]`}
          value={value}
          disabled={disabled}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className={wrapClass}>
        {label}
        <input
          type="number"
          className={className}
          value={value}
          disabled={disabled}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className={wrapClass}>
        {label}
        <input
          type="date"
          className={className}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {label}
      <input
        type="text"
        className={className}
        value={value}
        disabled={disabled}
        readOnly={field.readOnly}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
