import { Event } from '../models/Event.js';
import { AIUsage } from '../models/AIUsage.js';
import { aiProvider } from '../services/aiProvider.js';
import { ok } from '../utils/response.js';

async function trackUsage(userId, feature) {
  await AIUsage.create({ userId, feature });
}

export async function improveDescription(req, res, next) {
  try {
    const result = await aiProvider.improveDescription(req.body);
    await trackUsage(req.user.id, 'improve-description');
    return ok(res, { ...result, provider: aiProvider.mode });
  } catch (error) {
    return next(error);
  }
}

export async function generateAgenda(req, res, next) {
  try {
    const result = await aiProvider.generateAgenda(req.body);
    await trackUsage(req.user.id, 'generate-agenda');
    return ok(res, { ...result, provider: aiProvider.mode });
  } catch (error) {
    return next(error);
  }
}

export async function smartSuggestions(req, res, next) {
  try {
    const result = await aiProvider.smartSuggestions(req.body);
    await trackUsage(req.user.id, 'smart-suggestions');
    return ok(res, { ...result, provider: aiProvider.mode });
  } catch (error) {
    return next(error);
  }
}

export async function conflictCheck(req, res, next) {
  try {
    const { startAt, endAt } = req.body;

    const conflicts = await Event.find({
      ownerId: req.user.id,
      startAt: { $lt: new Date(endAt) },
      endAt: { $gt: new Date(startAt) }
    })
      .sort({ startAt: 1 })
      .select('title startAt endAt location status');

    const aiSummary = await aiProvider.conflictCheck({
      startAt,
      endAt,
      conflicts
    });

    await trackUsage(req.user.id, 'conflict-check');

    return ok(res, {
      conflicts,
      ...aiSummary,
      provider: aiProvider.mode
    });
  } catch (error) {
    return next(error);
  }
}
