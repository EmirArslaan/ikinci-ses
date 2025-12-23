import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Custom hook for form validation with Zod
 * 
 * @param schema - Zod validation schema
 * @returns React Hook Form instance
 */
export function useValidatedForm<TSchema extends z.ZodType<any, any>>(
    schema: TSchema
) {
    type FormData = z.infer<TSchema>;

    return useForm<FormData>({
        resolver: zodResolver(schema) as any,
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
}
