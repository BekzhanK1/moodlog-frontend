import { z } from 'zod'
import { FormErrors } from '@mantine/form'

export function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return (values: z.infer<T>): FormErrors => {
    const result = schema.safeParse(values)
    
    if (result.success) {
      return {}
    }

    const errors: FormErrors = {}
    
    result.error.errors.forEach((error) => {
      const path = error.path.join('.')
      if (!errors[path]) {
        errors[path] = error.message
      }
    })

    return errors
  }
}

