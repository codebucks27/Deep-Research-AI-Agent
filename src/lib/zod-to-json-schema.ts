/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

type JsonSchema = {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  description?: string;
};

// Helper to get Zod type name (Zod v4 compatible)
function getZodTypeName(schema: any): string {
  // Zod v4 uses _zod.def.type or similar internal structure
  // Try multiple approaches for compatibility
  if (schema?._zod?.def?.type) return schema._zod.def.type;
  if (schema?._def?.typeName) return schema._def.typeName;
  if (schema?.constructor?.name) return schema.constructor.name;
  return 'unknown';
}

/**
 * Converts a Zod schema to JSON Schema format.
 * Updated for Zod v4 compatibility.
 * Handles the subset of Zod types used in this codebase:
 * - z.object()
 * - z.string()
 * - z.boolean()
 * - z.array()
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const typeName = getZodTypeName(schema);

  // Handle ZodObject
  if (typeName === 'object' || typeName === 'ZodObject') {
    // In Zod v4, shape might be accessed via _zod.def.shape or schema.shape
    const shape = (schema as any)._zod?.def?.shape ?? (schema as any).shape ?? {};
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
      // All fields are required unless wrapped in .optional()
      const valueTypeName = getZodTypeName(value);
      if (valueTypeName !== 'optional' && valueTypeName !== 'ZodOptional') {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  // Handle ZodString
  if (typeName === 'string' || typeName === 'ZodString') {
    const result: JsonSchema = { type: 'string' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodBoolean
  if (typeName === 'boolean' || typeName === 'ZodBoolean') {
    const result: JsonSchema = { type: 'boolean' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodNumber
  if (typeName === 'number' || typeName === 'ZodNumber') {
    const result: JsonSchema = { type: 'number' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodArray
  if (typeName === 'array' || typeName === 'ZodArray') {
    // In Zod v4, element type might be at _zod.def.element or schema.element
    const element = (schema as any)._zod?.def?.element ?? (schema as any).element;
    const result: JsonSchema = {
      type: 'array',
      items: element ? zodToJsonSchema(element) : { type: 'string' },
    };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodOptional - unwrap and process inner type
  if (typeName === 'optional' || typeName === 'ZodOptional') {
    const inner = (schema as any)._zod?.def?.innerType ?? (schema as any).unwrap?.();
    if (inner) {
      return zodToJsonSchema(inner);
    }
  }

  // Handle ZodEffects (for .describe() calls that wrap the type)
  if (typeName === 'effects' || typeName === 'ZodEffects') {
    const inner = (schema as any)._zod?.def?.schema ?? (schema as any).innerType?.();
    if (inner) {
      return zodToJsonSchema(inner);
    }
  }

  // Fallback for unknown types
  return { type: 'string' };
}
