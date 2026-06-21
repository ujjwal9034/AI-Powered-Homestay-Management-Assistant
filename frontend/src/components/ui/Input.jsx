/**
 * Input — Reusable form input component with label and responsive styling.
 *
 * Props:
 * - label: Label text displayed above the input
 * - placeholder: Placeholder text
 * - type: Input type (default: 'text')
 * - id: Input id (auto-generated from label if not provided)
 * - className: Additional classes for the wrapper
 * - ...rest: Forwarded to <input>
 */
export default function Input({
  label,
  placeholder = '',
  type = 'text',
  id,
  className = '',
  ...rest
}) {
  // Derive a safe id from the label if none provided
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all duration-200 dark:bg-dark-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-primary-500/30 dark:focus:border-primary-500"
        {...rest}
      />
    </div>
  )
}
