import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { conflictCheck, generateAgenda, improveDescription, smartSuggestions } from '../controllers/ai.controller.js';

export const aiRouter = Router();

const improveDescriptionSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().max(3000).optional().default('')
});

const generateAgendaSchema = z
  .object({
    title: z.string().min(2).max(180),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    attendeesCount: z.coerce.number().int().positive().optional()
  })
  .refine((value) => value.endAt > value.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt']
  });

const smartSuggestionsSchema = z.object({
  title: z.string().min(2).max(180),
  location: z.string().max(250).optional(),
  description: z.string().max(3000).optional()
});

const conflictCheckSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date()
  })
  .refine((value) => value.endAt > value.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt']
  });

aiRouter.use(requireAuth);
aiRouter.post('/improve-description', validate(improveDescriptionSchema), improveDescription);
aiRouter.post('/generate-agenda', validate(generateAgendaSchema), generateAgenda);
aiRouter.post('/smart-suggestions', validate(smartSuggestionsSchema), smartSuggestions);
aiRouter.post('/conflict-check', validate(conflictCheckSchema), conflictCheck);
