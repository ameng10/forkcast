// deno-lint-ignore-file no-explicit-any
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

export enum FactSource {
  MEAL = "meal",
  CHECK_IN = "check_in",
  INSIGHT = "insight",
  BEHAVIOR = "behavior",
}

type ISODateString = string; // stored as ISO string in DB
type InputDate = Date | string | number;

type FactDoc = {
  _id: ID;
  owner: ID;
  at: ISODateString;
  content: string;
  source: FactSource;
};

type QADoc = {
  _id: ID;
  owner: ID;
  question: string;
  answer: string;
  citedFacts: ID[];
  confidence?: number;
  at: ISODateString;
};

type DraftDoc = {
  _id: ID;
  owner: ID;
  question: string;
  raw: unknown;
  validated: boolean;
  at: ISODateString;
};

const PREFIX = "PersonalQA";

function iso(d: InputDate): ISODateString {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "number") return new Date(d).toISOString();
  const s = String(d);
  const parsed = new Date(s);
  if (isNaN(parsed.getTime())) {
    throw new TypeError(
      "Invalid date input for 'at'. Expected Date/string/number.",
    );
  }
  return parsed.toISOString();
}

function sortByAtAsc(a: { at: ISODateString }, b: { at: ISODateString }) {
  return a.at < b.at ? -1 : a.at > b.at ? 1 : 0;
}

function selectTopK<T extends { at: ISODateString }>(arr: T[], k: number) {
  return [...arr].sort(sortByAtAsc).slice(-k);
}

function conservativeSummary(question: string, facts: FactDoc[]): string {
  if (facts.length === 0) return "Insufficient data to answer yet.";
  const bits = facts.slice(-3).map((f) => f.content).join(" | ");
  return `Based on your recent facts: ${bits}. I would need more data to be confident about “${question}”.`;
}

function tokenize(s: string): Set<string> {
  return new Set(
    (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => t.length >= 3),
  );
}

function categoryHintsFromQuestion(q: string): Set<FactSource> {
  const out = new Set<FactSource>();
  const s = q.toLowerCase();
  if (/(^|\W)insights?(\W|$)/.test(s)) out.add(FactSource.INSIGHT);
  if (/(^|\W)check[ _-]?in(s)?(\W|$)/.test(s)) out.add(FactSource.CHECK_IN);
  if (/(^|\W)meal(s)?(\W|$)/.test(s)) out.add(FactSource.MEAL);
  if (/(^|\W)behavior(s)?(\W|$)/.test(s)) out.add(FactSource.BEHAVIOR);
  return out;
}

function relevanceScore(qTokens: Set<string>, f: FactDoc): number {
  const ftokens = tokenize(f.content);
  let overlap = 0;
  for (const t of ftokens) if (qTokens.has(t)) overlap++;
  return overlap;
}

export default class PersonalQAConcept {
  private db: any;
  private facts; // collection
  private qas; // collection
  private drafts; // collection
  private templates; // collection

  constructor(db: any) {
    this.db = db;
    this.facts = db.collection(`${PREFIX}_facts`);
    this.qas = db.collection(`${PREFIX}_qas`);
    this.drafts = db.collection(`${PREFIX}_drafts`);
    this.templates = db.collection(`${PREFIX}_templates`);
  }

  async ingestFact(args: {
    owner: ID;
    at: InputDate;
    content: string;
    source: FactSource;
  }) {
    const _id = freshID();
    const doc: FactDoc = {
      _id,
      owner: args.owner,
      at: iso(args.at),
      content: args.content,
      source: args.source,
    };
    await this.facts.insertOne(doc as any);
    return { fact: _id };
  }

  async forgetFact(args: { requester: ID; owner: ID; factId: ID }) {
    if (args.requester !== args.owner) return { error: "not_owner" } as const;
    const res = await this.facts.deleteOne({
      _id: args.factId,
      owner: args.owner,
    } as any);
    if (res.deletedCount !== 1) return { error: "fact_not_found" } as const;
    return { ok: true } as const;
  }

  async ask(args: { requester: ID; question: string }) {
    const pool = await this.facts.find({ owner: args.requester })
      .toArray() as FactDoc[];
    const qTokens = tokenize(args.question);
    const hinted = categoryHintsFromQuestion(args.question);

    if (pool.length === 0) {
      const qa: QADoc = {
        _id: freshID(),
        owner: args.requester,
        question: args.question,
        answer:
          "I couldn't find enough information to answer that yet. I have 0 facts recorded for you right now.",
        citedFacts: [],
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return qa;
    }

    // Compute relevance by category hints OR token overlap
    const candidates: Array<{ f: FactDoc; score: number }> = pool
      .map((f: FactDoc) => ({ f, score: relevanceScore(qTokens, f) }))
      .filter((x: { f: FactDoc; score: number }) =>
        x.score > 0 || hinted.has(x.f.source)
      );

    if (candidates.length === 0) {
      const qa: QADoc = {
        _id: freshID(),
        owner: args.requester,
        question: args.question,
        answer:
          `I have ${pool.length} facts recorded for you, but none directly address your question. You can add more details or ask about topics mentioned in your facts.`,
        citedFacts: [],
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return qa;
    }

    // Rank by score (desc), then recency (asc)
    const ranked = candidates.sort((
      a: { f: FactDoc; score: number },
      b: { f: FactDoc; score: number },
    ) => (b.score - a.score) || a.f.at.localeCompare(b.f.at));
    const top = ranked.slice(0, 10).map((r: { f: FactDoc; score: number }) =>
      r.f
    );

    const answer = conservativeSummary(args.question, top);
    const citedFacts = top.map((f: FactDoc) => f._id);
    const qa: QADoc = {
      _id: freshID(),
      owner: args.requester,
      question: args.question,
      answer,
      citedFacts,
      at: iso(new Date()),
    };
    await this.qas.insertOne(qa as any);
    return qa;
  }

  async askLLM(args: { requester: ID; question: string; k?: number }) {
    const pool = await this.facts.find({ owner: args.requester })
      .toArray() as FactDoc[];
    const k = args.k ?? 12;
    const selection = selectTopK<FactDoc>(pool, k);

    const apiKey = (typeof Deno !== "undefined" && Deno.env?.get)
      ? (Deno.env.get("GEMINI_API_KEY") ?? "")
      : "";

    // Fallback behavior when no API key or to keep tests hermetic
    if (!apiKey) {
      const answer = conservativeSummary(args.question, selection);
      const qa: QADoc = {
        _id: freshID(),
        owner: args.requester,
        question: args.question,
        answer,
        citedFacts: selection.map((f) => f._id),
        confidence: 0.2,
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return qa;
    }

    // Use Gemini via REST when GOOGLE_API_KEY is available
    const userTpl = await this.templates.findOne(
      { _id: args.requester } as any,
    ) as
      | { _id: ID; name: string; text: string }
      | null;
    const template = userTpl?.text ?? DEFAULT_TEMPLATE;
    const prompt = fillTemplate(template, selection, args.question);

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
        encodeURIComponent(apiKey)
      }`;
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: { temperature: 0.4 },
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      // Consume body to avoid resource leak in Deno tests
      try {
        await resp.text();
      } catch (_) {
        try {
          await resp.body?.cancel();
        } catch (_) { /* ignore */ }
      }
      // On failure, store a QA with fallback answer
      const answer = conservativeSummary(args.question, selection);
      const qa: QADoc = {
        _id: freshID(),
        owner: args.requester,
        question: args.question,
        answer,
        citedFacts: selection.map((f) => f._id),
        confidence: 0.2,
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return qa;
    }

    const data = await resp.json();
    const text = (extractGeminiText(data) ?? "").trim();
    const answerText = text.length > 0
      ? text
      : conservativeSummary(args.question, selection);

    // Store the raw exchange as a draft (validated immediately)
    const draft: DraftDoc = {
      _id: freshID(),
      owner: args.requester,
      question: args.question,
      raw: { prompt, response: text },
      validated: true,
      at: iso(new Date()),
    };
    await this.drafts.insertOne(draft as any);

    const qa: QADoc = {
      _id: freshID(),
      owner: args.requester,
      question: args.question,
      answer: answerText,
      citedFacts: selection.map((f) => f._id),
      confidence: 0.5,
      at: iso(new Date()),
    };
    await this.qas.insertOne(qa as any);
    return qa;
  }

  async setTemplate(args: { requester: ID; name: string; template: string }) {
    await this.templates.updateOne(
      { _id: args.requester } as any,
      { $set: { name: args.name, text: args.template } } as any,
      { upsert: true },
    );
    return { ok: true } as const;
  }

  // Query helpers used by tests
  async _getUserFacts(args: { owner: ID }) {
    return await this.facts.find({ owner: args.owner }).toArray();
  }
  async _getUserQAs(args: { owner: ID }) {
    return await this.qas.find({ owner: args.owner }).toArray();
  }
  async _getUserDrafts(args: { owner: ID }) {
    return await this.drafts.find({ owner: args.owner }).toArray();
  }
}

// --- Gemini helpers and prompt template ---
const DEFAULT_TEMPLATE =
  `Answer the user's question strictly using some of the facts below. If there are no facts, do a web search. Be concise. If the question
  is personal to the user and cannot be answered with facts or a web search, say so clearly.

Question: {{question}}
Facts:
{{factsText}}`;

function fillTemplate(template: string, facts: FactDoc[], question: string) {
  const factsText = facts.map((f) =>
    `- ${f.content} (src:${f.source}, at:${f.at})`
  ).join("\n");
  return template
    .replace("{{question}}", question)
    .replace("{{factsText}}", factsText);
}

function extractGeminiText(res: any): string | null {
  const parts = res?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    for (const p of parts) {
      if (p?.text && typeof p.text === "string") return p.text as string;
    }
  }
  const alts = res?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof alts === "string" ? alts : null;
}

// JSON parsing helper removed: we now treat Gemini output as plain text.
