import { TextareaHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Reusable form textarea with validation error display
 */
const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] outline-none transition resize-none ${error
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-white'
                        } ${className}`}
                    {...props}
                />

                {error && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span className="material-icons text-sm">error</span>
                        {error.message}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
