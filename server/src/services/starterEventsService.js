import { Event } from '../models/Event.js';

function at(hour, minute, dayOffset) {
  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hour,
    minute,
    0,
    0
  );
  return date.toISOString();
}

function buildStarterEvents(ownerId) {
  return [
    {
      ownerId,
      title: 'Weekly Team Sync',
      startAt: at(10, 0, 1),
      endAt: at(11, 0, 1),
      location: 'Conference Room A',
      description: 'Status updates, blockers, and priorities for the week.',
      status: 'upcoming',
      tags: ['team', 'sync']
    },
    {
      ownerId,
      title: 'Product Planning Session',
      startAt: at(14, 0, 2),
      endAt: at(15, 30, 2),
      location: 'Zoom',
      description: 'Review roadmap options and align on next milestones.',
      status: 'attending',
      tags: ['planning', 'product']
    },
    {
      ownerId,
      title: 'Customer Feedback Review',
      startAt: at(9, 30, 4),
      endAt: at(10, 30, 4),
      location: 'War Room',
      description: 'Analyze top user pain points and agree on follow-up actions.',
      status: 'maybe',
      tags: ['customers', 'research']
    }
  ];
}

export async function createStarterEventsForUser(userId) {
  const ownerId = userId.toString();
  const existingCount = await Event.countDocuments({ ownerId });
  if (existingCount > 0) return;

  await Event.insertMany(buildStarterEvents(ownerId), { ordered: true });
}
