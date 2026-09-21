import React, { useState, useCallback } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label, name, type = 'text', value, onChange, error, required, placeholder, options, prefix, suffix, disabled
}) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{prefix}</span>}
      {type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 bg-dark-primary border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all ${error ? 'border-red-500' : 'border-white/10'} ${disabled ? 'opacity-50' : ''}`}
        >
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`w-full px-4 py-2.5 bg-dark-primary border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all resize-none ${error ? 'border-red-500' : 'border-white/10'} ${disabled ? 'opacity-50' : ''}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${prefix ? 'pl-8' : 'px-4'} ${suffix ? 'pr-12' : ''} py-2.5 bg-dark-primary border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all ${error ? 'border-red-500' : 'border-white/10'} ${disabled ? 'opacity-50' : ''}`}
        />
      )}
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</span>}
    </div>
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

interface FormError {
  field: string;
  message: string;
}

interface UseFormValidationProps {
  validate: (data: any) => FormError[];
}

export function useFormValidation<T>(initialData: T, validate: (data: T) => FormError[]) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldErrors = validate(data);
    const fieldError = fieldErrors.find(e => e.field === String(field));
    if (fieldError) {
      setErrors(prev => ({ ...prev, [String(field)]: fieldError.message }));
    }
  }, [data, validate]);

  const validateAll = useCallback((): boolean => {
    const fieldErrors = validate(data);
    const newErrors: Record<string, string> = {};
    fieldErrors.forEach(e => { newErrors[e.field] = e.message; });
    setErrors(newErrors);
    return fieldErrors.length === 0;
  }, [data, validate]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return { data, errors, touched, handleChange, handleBlur, validateAll, reset, setData };
}

export function validateRequired(value: any, fieldName: string): FormError | null {
  if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

export function validateEmail(value: string): FormError | null {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { field: 'email', message: 'Invalid email address' };
  }
  return null;
}

export function validateNumber(value: number, min?: number, max?: number, fieldName?: string): FormError | null {
  if (isNaN(value)) return { field: fieldName || 'amount', message: 'Must be a number' };
  if (min !== undefined && value < min) return { field: fieldName || 'amount', message: `Must be at least ${min}` };
  if (max !== undefined && value > max) return { field: fieldName || 'amount', message: `Must be at most ${max}` };
  return null;
}

export function validateMinLength(value: string, min: number, fieldName: string): FormError | null {
  if (value && value.length < min) return { field: fieldName, message: `Must be at least ${min} characters` };
  return null;
}

export function validatePhone(value: string): FormError | null {
  if (value && !/^[\d\s\-\+\(\)]{7,15}$/.test(value)) {
    return { field: 'phone', message: 'Invalid phone number' };
  }
  return null;
}
