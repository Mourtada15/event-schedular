import { Event } from '../models/Event.js';
import { createStarterEventsForUser } from '../services/starterEventsService.js';
import { fail, ok } from '../utils/response.js';

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildSort(sortRaw) {
  if (!sortRaw) return { startAt: 1 };

  const [field, direction] = sortRaw.split(':');
  const allowed = new Set(['startAt', 'createdAt', 'updatedAt', 'title']);
  if (!allowed.has(field)) return { startAt: 1 };

  return { [field]: direction === 'desc' ? -1 : 1 };
}

export async function listEvents(req, res, next) {
  try {
    const {
      query,
      status,
      from,
      to,
      location,
      tags,
      page = '1',
      limit = '10',
      sort
    } = req.query;

    const filter = { ownerId: req.user.id };

    if (query) {
      filter.$text = { $search: query };
    }

    if (status) {
      filter.status = status;
    }

    const startDate = toDate(from);
    const endDate = toDate(to);
    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) filter.startAt.$gte = startDate;
      if (endDate) filter.startAt.$lte = endDate;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const parsedTags = parseTags(tags);
    if (parsedTags.length) {
      filter.tags = { $all: parsedTags };
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;
    const hasActiveFilters = Boolean(query || status || from || to || location || tags);

    let [items, total] = await Promise.all([
      Event.find(filter).sort(buildSort(sort)).skip(skip).limit(safeLimit),
      Event.countDocuments(filter)
    ]);

    if (!hasActiveFilters && safePage === 1 && total === 0) {
      await createStarterEventsForUser(req.user.id);

      [items, total] = await Promise.all([
        Event.find(filter).sort(buildSort(sort)).skip(skip).limit(safeLimit),
        Event.countDocuments(filter)
      ]);
    }

    return ok(res, {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create({
      ...req.body,
      ownerId: req.user.id
    });

    return ok(res, { event }, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await Event.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!event) return fail(res, 404, 'Event not found');

    return ok(res, { event });
  } catch (error) {
    return next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Event.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!event) return fail(res, 404, 'Event not found');

    const nextStartAt = req.body.startAt ? new Date(req.body.startAt) : event.startAt;
    const nextEndAt = req.body.endAt ? new Date(req.body.endAt) : event.endAt;

    if (nextEndAt <= nextStartAt) {
      return fail(res, 400, 'endAt must be after startAt');
    }

    Object.assign(event, req.body);
    await event.save();

    return ok(res, { event });
  } catch (error) {
    return next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const result = await Event.deleteOne({ _id: req.params.id, ownerId: req.user.id });
    if (!result.deletedCount) return fail(res, 404, 'Event not found');

    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}
