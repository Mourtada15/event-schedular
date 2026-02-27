import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../controllers/event.controller.js';
import { statusEnum } from '../models/Event.js';

export const eventRouter = Router();

const baseEventSchema = z
  .object({
    title: z.string().min(2).max(180),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    location: z.string().max(250).optional().default(''),
    description: z.string().max(3000).optional().default(''),
    status: z.enum(statusEnum).optional().default('upcoming'),
    tags: z.array(z.string().min(1).max(40)).optional().default([])
  })
  .refine((value) => value.endAt > value.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt']
  });

const updateEventSchema = z
  .object({
    title: z.string().min(2).max(180).optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    location: z.string().max(250).optional(),
    description: z.string().max(3000).optional(),
    status: z.enum(statusEnum).optional(),
    tags: z.array(z.string().min(1).max(40)).optional()
  })
  .refine((value) => {
    if (value.startAt && value.endAt) return value.endAt > value.startAt;
    return true;
  }, {
    message: 'endAt must be after startAt',
    path: ['endAt']
  });

const querySchema = z.object({
  query: z.string().optional(),
  status: z.enum(statusEnum).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  location: z.string().optional(),
  tags: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional()
});

eventRouter.use(requireAuth);
eventRouter.get('/', validate(querySchema, 'query'), listEvents);
eventRouter.post('/', validate(baseEventSchema), createEvent);
eventRouter.get('/:id', getEvent);
eventRouter.put('/:id', validate(updateEventSchema), updateEvent);
eventRouter.delete('/:id', deleteEvent);
