import OpenAI from 'openai';
import { env } from '../config/env.js';

class AIProvider {
  constructor() {
    this.client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;
    this.openAiEnabled = Boolean(this.client);
    this.mode = this.openAiEnabled ? 'openai' : 'stub';
  }

  async complete({ system, prompt, maxTokens = 450 }) {
    if (!this.client || !this.openAiEnabled) {
      this.mode = 'stub';
      return null;
    }

    try {
      const response = await this.client.responses.create({
        model: 'gpt-4.1-mini',
        max_output_tokens: maxTokens,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      });

      this.mode = 'openai';
      const text = (response.output_text || '').trim();
      return text || null;
    } catch (error) {
      this.openAiEnabled = false;
      this.mode = 'stub';
      const message = error && error.message ? error.message : 'Unknown OpenAI error';
      console.error(`OpenAI request failed, falling back to stub mode: ${message}`);
      return null;
    }
  }

  async improveDescription({ title, description }) {
    if (this.client && this.openAiEnabled) {
      const text = await this.complete({
        system: 'You improve event descriptions with clear, professional tone.',
        prompt: `Event title: ${title}\nDraft description:\n${description}\n\nReturn improved text only.`
      });
      if (text) return { text };
    }

    const base = (description && description.trim()) || 'This event brings participants together for a focused session.';
    return {
      text: `${title}: ${base} The session will include clear objectives, structured discussion, and actionable next steps for all participants.`
    };
  }

  async generateAgenda({ title, startAt, endAt, attendeesCount }) {
    if (this.client && this.openAiEnabled) {
      const text = await this.complete({
        system: 'You generate concise event agendas with timeline bullets.',
        prompt: `Title: ${title}\nStart: ${startAt}\nEnd: ${endAt}\nAttendees: ${attendeesCount || 'unknown'}\n\nGenerate a practical timeline agenda.`
      });
      if (text) return { agenda: text };
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    const minutes = Math.max(30, Math.round((end - start) / 60000));
    const segment = Math.max(10, Math.round(minutes / 4));

    return {
      agenda: [
        `- ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Kickoff and context for ${title}`,
        `- +${segment} min Goals alignment and participant introductions (${attendeesCount || 'group'} attendees)`,
        `- +${segment * 2} min Core discussion and decision points`,
        `- +${segment * 3} min Action items, owners, and next milestones`
      ].join('\n')
    };
  }

  async smartSuggestions({ title, location, description }) {
    if (this.client && this.openAiEnabled) {
      const text = await this.complete({
        system: 'You suggest event locations and reminder plans.',
        prompt: `Title: ${title}\nLocation: ${location || 'unspecified'}\nDescription: ${description || 'none'}\n\nReturn JSON with keys: locationIdeas (array), reminders (array).`
      });

      if (text) {
        try {
          const parsed = JSON.parse(text);
          return {
            locationIdeas: Array.isArray(parsed.locationIdeas) ? parsed.locationIdeas : [],
            reminders: Array.isArray(parsed.reminders) ? parsed.reminders : []
          };
        } catch {
          return {
            locationIdeas: ['Central office conference room', 'Quiet coworking meeting space'],
            reminders: ['24 hours before', '2 hours before']
          };
        }
      }
    }

    const haystack = `${title} ${description || ''}`.toLowerCase();
    const isRemote = haystack.includes('webinar') || haystack.includes('remote') || haystack.includes('online');
    const isWorkshop = haystack.includes('workshop') || haystack.includes('training');

    const locationIdeas = isRemote
      ? ['Zoom meeting room', 'Google Meet session']
      : isWorkshop
        ? ['Coworking workshop room', 'Innovation lab classroom']
        : ['Main office meeting room', 'Local cafe private area'];

    const reminders = ['1 week before (prep)', '24 hours before', '1 hour before'];

    if (!location) {
      reminders.push('15 minutes before: confirm location/link');
    }

    return { locationIdeas, reminders };
  }

  async conflictCheck({ startAt, endAt, conflicts }) {
    if (this.client && this.openAiEnabled) {
      const conflictText = conflicts
        .map((c) => `${c.title}: ${new Date(c.startAt).toISOString()} to ${new Date(c.endAt).toISOString()}`)
        .join('\n');

      const text = await this.complete({
        system: 'You summarize schedule conflicts and suggest resolutions.',
        prompt: `Proposed window: ${startAt} to ${endAt}\nConflicts:\n${conflictText || 'None'}\n\nSummarize conflicts and give one recommendation.`
      });

      if (text) return { summary: text };
    }

    if (!conflicts.length) {
      return { summary: 'No conflicts found. The proposed time window is clear.' };
    }

    const summary = conflicts
      .slice(0, 5)
      .map((c) => `- ${c.title} (${new Date(c.startAt).toLocaleString()} - ${new Date(c.endAt).toLocaleString()})`)
      .join('\n');

    return {
      summary: `Found ${conflicts.length} conflicting event(s):\n${summary}\nRecommendation: move by 30-60 minutes or update attendee list.`
    };
  }
}

export const aiProvider = new AIProvider();
