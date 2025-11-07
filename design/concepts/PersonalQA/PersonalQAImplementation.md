import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { Empty, ID } from "@utils/types.ts";

//
// UTILITY: Types and Enums
//

// Generic parameter for the concept
type User = ID;

// IDs for the collections managed by this concept
type Fact = ID;
type QA = ID;
type Draft = ID;

export enum FactSource {
  MEAL = "meal",
  CHECK_IN = "check_in",
  INSIGHT = "insight",
  BEHAVIOR = "behavior",
}

type ISODateString = string;
type InputDate = Date | string | number;

/**
 * a set of Facts with
 *   an owner User
 *   an at Date
 *   a content String
 *   a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR
 */
type FactDoc = {
  _id: Fact;
  owner: User;
  at: ISODateString;
  content: string;
  source: FactSource;
};

/**
 * a set of QAs with
 *   an owner User
 *   a question String
 *   an answer String
 *   a citedFacts set of Fact
 *   an optional confidence Number
 *   an at Date
 */
type QADoc = {
  _id: QA;
  owner: User;
  question: string;
  answer: string;
  citedFacts: Fact[];
  confidence?: number;
  at: ISODateString;
};

/**
 * a set of Drafts with
 *   an owner User
 *   a question String
 *   a raw String
 *   a validated Flag
 *   an at Date
 */
type DraftDoc = {
  _id: Draft;
  owner: User;
  question: string;
  raw: unknown; // Represents a flexible JSON structure
  validated: boolean;
  at: ISODateString;
};

/**
 * a Templates set of Users with
 *   a name String
 *   a text String
 */
type TemplateDoc = {
  _id: User; // The User ID is the identifier for the template
  name: string;
  text: string;
};

const PREFIX = "PersonalQA";

//
// UTILITY: Pure Helper Functions
//

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

const DEFAULT_TEMPLATE =
  `Use a combination of the facts below and a web search to answer the user's question.
Do not copy facts verbatim. Give a couple short, confident sentences.

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

/**
 * @concept PersonalQA - Enable a user to get synthesized answers to questions based on a personal knowledge base of ingested facts.
 */
export default class PersonalQAConcept {
  private readonly facts: Collection<FactDoc>;
  private readonly qas: Collection<QADoc>;
  private readonly drafts: Collection<DraftDoc>;
  private readonly templates: Collection<TemplateDoc>;

  constructor(private readonly db: Db) {
    this.facts = db.collection(`${PREFIX}_facts`);
    this.qas = db.collection(`${PREFIX}_qas`);
    this.drafts = db.collection(`${PREFIX}_drafts`);
    this.templates = db.collection(`${PREFIX}_templates`);
  }

  //
  // ACTIONS
  //

  /**
   * ingestFact (owner: User, at: Date, content: String, source: FactSource): (fact: Fact)
   *
   * **requires** true
   *
   * **effects** creates a new Fact with the given properties, owned by `owner`; returns the new Fact's ID
   */
  async ingestFact(
    { owner, at, content, source }: {
      owner: User;
      at: InputDate;
      content: string;
      source: FactSource;
    },
  ): Promise<{ fact: Fact }> {
    const _id = freshID() as Fact;
    const doc: FactDoc = {
      _id,
      owner,
      at: iso(at),
      content,
      source,
    };
    await this.facts.insertOne(doc as any);
    return { fact: _id };
  }

  /**
   * forgetFact (requester: User, owner: User, factId: Fact): (ok: Flag) or (error: String)
   *
   * **requires** `requester` is the same as `owner`
   *
   * **effects** if the Fact `factId` exists and is owned by `owner`, it is deleted and `ok: true` is returned. otherwise, an error is returned.
   */
  async forgetFact(
    { requester, owner, factId }: {
      requester: User;
      owner: User;
      factId: Fact;
    },
  ): Promise<{ ok: true } | { error: string }> {
    if (requester !== owner) {
      return { error: "not_owner" };
    }
    const res = await this.facts.deleteOne({
      _id: factId,
      owner: owner,
    } as any);
    if (res.deletedCount !== 1) {
      return { error: "fact_not_found" };
    }
    return { ok: true };
  }

  /**
   * ask (requester: User, question: String): (qa: QADoc)
   *
   * **requires** true
   *
   * **effects** creates a new QA entry by analyzing the user's existing facts to answer the `question`; returns the new QA object
   */
  async ask(
    { requester, question }: { requester: User; question: string },
  ): Promise<{ qa: QADoc }> {
    const pool = await this.facts.find({ owner: requester })
      .toArray() as FactDoc[];
    const qTokens = tokenize(question);
    const hinted = categoryHintsFromQuestion(question);

    if (pool.length === 0) {
      const qa: QADoc = {
        _id: freshID() as QA,
        owner: requester,
        question: question,
        answer:
          "I couldn't find enough information to answer that yet. I have 0 facts recorded for you right now.",
        citedFacts: [],
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return { qa };
    }

    const candidates = pool
      .map((f) => ({ f, score: relevanceScore(qTokens, f) }))
      .filter((x) => x.score > 0 || hinted.has(x.f.source));

    if (candidates.length === 0) {
      const qa: QADoc = {
        _id: freshID() as QA,
        owner: requester,
        question: question,
        answer:
          `I have ${pool.length} facts recorded for you, but none directly address your question. You can add more details or ask about topics mentioned in your facts.`,
        citedFacts: [],
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return { qa };
    }

    const ranked = candidates.sort((a, b) =>
      (b.score - a.score) || a.f.at.localeCompare(b.f.at)
    );
    const top = ranked.slice(0, 10).map((r) => r.f);

    const answer = conservativeSummary(question, top);
    const citedFacts = top.map((f) => f._id);
    const qa: QADoc = {
      _id: freshID() as QA,
      owner: requester,
      question: question,
      answer,
      citedFacts,
      at: iso(new Date()),
    };
    await this.qas.insertOne(qa as any);
    return { qa };
  }

  /**
   * askLLM (requester: User, question: String, optional k: Number): (qa: QADoc)
   *
   * **requires** true
   *
   * **effects** creates a new QA entry by using an external LLM to answer the `question` based on the user's `k` most recent facts; returns the new QA object
   */
  async askLLM(
    { requester, question, k }: {
      requester: User;
      question: string;
      k?: number;
    },
  ): Promise<{ qa: QADoc }> {
    const pool = await this.facts.find({ owner: requester })
      .toArray() as FactDoc[];
    const topK = k ?? 12;
    const selection = selectTopK<FactDoc>(pool, topK);

    const apiKey = (typeof Deno !== "undefined" && Deno.env?.get)
      ? (Deno.env.get("GOOGLE_API_KEY") ?? Deno.env.get("GEMINI_API_KEY") ?? "")
      : "";
    const forceGemini = (typeof Deno !== "undefined" && Deno.env?.get)
      ? (Deno.env.get("PERSONALQA_FORCE_GEMINI") === "1")
      : false;

    if (!apiKey) {
      if (forceGemini) {
        throw new Error(
          "GOOGLE_API_KEY/GEMINI_API_KEY is not set but PERSONALQA_FORCE_GEMINI=1",
        );
      }
      const answer = conservativeSummary(question, selection);
      const qa: QADoc = {
        _id: freshID() as QA,
        owner: requester,
        question,
        answer,
        citedFacts: selection.map((f) => f._id),
        confidence: 0.2,
        at: iso(new Date()),
      };
      await this.qas.insertOne(qa as any);
      return { qa };
    }

    const userTpl = await this.templates.findOne({ _id: requester } as any) as
      | TemplateDoc
      | null;
    const template = userTpl?.text ?? DEFAULT_TEMPLATE;
    const prompt = fillTemplate(template, selection, question);
    const { GeminiLLM } = await import("@utils/gemini.ts");
    const llm = new GeminiLLM({ apiKey });
    const text = (await llm.executeLLM(prompt)).trim();
    const answerText = text.length > 0
      ? text
      : conservativeSummary(question, selection);

    const draft: DraftDoc = {
      _id: freshID() as Draft,
      owner: requester,
      question,
      raw: { prompt, response: text },
      validated: true,
      at: iso(new Date()),
    };
    await this.drafts.insertOne(draft as any);

    const qa: QADoc = {
      _id: freshID() as QA,
      owner: requester,
      question,
      answer: answerText,
      citedFacts: selection.map((f) => f._id),
      confidence: 0.9,
      at: iso(new Date()),
    };
    await this.qas.insertOne(qa as any);
    return { qa };
  }

  /**
   * setTemplate (requester: User, name: String, template: String): (ok: Flag)
   *
   * **requires** true
   *
   * **effects** creates or updates the LLM prompt template for the `requester`; returns `ok: true`
   */
  async setTemplate(
    { requester, name, template }: {
      requester: User;
      name: string;
      template: string;
    },
  ): Promise<Empty | { ok: true }> {
    await this.templates.updateOne(
      { _id: requester } as any,
      { $set: { name: name, text: template } } as any,
      { upsert: true },
    );
    return { ok: true };
  }

  //
  // QUERIES
  //

  /**
   * _getUserFacts (owner: User): (FactDoc)
   *
   * **requires** user exists
   *
   * **effects** returns all facts for the given `owner`
   */
  async _getUserFacts({ owner }: { owner: User }): Promise<FactDoc[]> {
    return await this.facts.find({ owner }).toArray();
  }

  /**
   * _getUserQAs (owner: User): (QADoc)
   *
   * **requires** user exists
   *
   * **effects** returns all QAs for the given `owner`
   */
  async _getUserQAs({ owner }: { owner: User }): Promise<QADoc[]> {
    return await this.qas.find({ owner }).toArray();
  }

  /**
   * _getUserDrafts (owner: User): (DraftDoc)
   *
   * **requires** user exists
   *
   * **effects** returns all drafts for the given `owner`
   */
  async _getUserDrafts({ owner }: { owner: User }): Promise<DraftDoc[]> {
    return await this.drafts.find({ owner }).toArray();
  }
}
