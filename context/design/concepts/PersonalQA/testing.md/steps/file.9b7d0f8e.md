---
timestamp: 'Thu Oct 16 2025 22:56:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_225607.63a72041.md]]'
content_id: 9b7d0f8e952c712339ab56187464cc185008c72e78e500a0f8c7c6c2909ffe24
---

# file: src/personalqa/PersonalQAConcept.ts

First, I'm updating the `PersonalQAConcept` implementation to correctly use MongoDB collections as per the project's framework, which was implicitly expected from the "Concept Implementation" section in the initial prompt. This aligns the concept with the `testDb` utility and the overall architectural style.

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "PersonalQA" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type FactContent = string; // The descriptive content of a fact
type QuestionText = string;
type AnswerText = string;
type Time = Date;          // Maps to SSF's 'Date' primitive type

// Enumeration Type (from SSF)
enum FactSource {
    MEAL = "meal",
    CHECK_IN = "check_in",
    INSIGHT = "insight",
    BEHAVIOR = "behavior",
}

// Internal entity types, represented as IDs
type FactId = ID;
type QaId = ID;

/**
 * State: A set of Facts with owner, at, content, source.
 * Corresponds to 'a set of Facts with...' in SSF.
 */
interface FactDoc {
  _id: FactId; // MongoDB document ID
  owner: User;
  at: Time;
  content: FactContent;
  source: FactSource;
}

/**
 * State: A set of QAs with owner, question, answer, citedFacts.
 * Corresponds to 'a set of QAs with...' in SSF.
 * 'citedFacts set of Facts' is represented as an array of Fact IDs.
 */
interface QADoc {
  _id: QaId; // MongoDB document ID
  owner: User;
  question: QuestionText;
  answer: AnswerText;
  citedFacts: FactId[]; // Array of Fact IDs that supported the answer
}

/**
 * @concept PersonalQA
 * @purpose Answer a user’s food questions using their own meals, check-ins, and insights.
 */
export default class PersonalQAConcept {
  facts: Collection<FactDoc>;
  qas: Collection<QADoc>;

  constructor(private readonly db: Db) {
    this.facts = this.db.collection(PREFIX + "facts");
    this.qas = this.db.collection(PREFIX + "qas");
  }

  /**
   * Action: Ingests a new fact into the system.
   * @effects add a fact
   */
  public async ingestFact({ owner, at, content, source }: { owner: User; at: Time; content: FactContent; source: FactSource }): Promise<{ fact: FactId }> {
    const factId = freshID() as FactId;
    await this.facts.insertOne({ _id: factId, owner, at, content, source });
    return { fact: factId };
  }

  /**
   * Action: Removes an existing fact from the system.
   * @requires fact with factId exists for owner AND requester = owner
   * @effects remove the fact
   */
  public async forgetFact({ requester, owner, factId }: { requester: User; owner: User; factId: FactId }): Promise<Empty | { error: string }> {
    const factToRemove = await this.facts.findOne({ _id: factId });

    if (!factToRemove) {
      return { error: `Fact with ID '${factId}' not found.` };
    }
    if (factToRemove.owner !== owner) {
      return { error: `Fact with ID '${factId}' is not owned by user '${owner}'.` };
    }
    if (requester !== owner) {
      return { error: `Requester '${requester}' is not the owner '${owner}' of fact ID '${factId}'.` };
    }

    await this.facts.deleteOne({ _id: factId });
    return {};
  }

  /**
   * Action: Processes a user's question and generates an answer based on their facts.
   * @requires requester exists
   * @effects produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts
   */
  public async ask({ requester, question }: { requester: User; question: QuestionText }): Promise<{ answer: AnswerText; citedFacts: FactId[] }> {
    // In a real system, 'requester exists' might involve checking a 'Users' concept.
    // For this concept, any valid ID string is considered an existing requester.

    const userFacts = await this.facts.find({ owner: requester }).toArray();

    // --- Simulated Answer Generation Logic ---
    let answerText: AnswerText = "I couldn't find enough information in your facts to answer that specific question.";
    const citedFactIds: FactId[] = [];
    const questionLower = question.toLowerCase();

    const relevantFacts = userFacts.filter(fact =>
        questionLower.includes(fact.source.toLowerCase()) || // Check if source keyword is in question
        questionLower.split(/\s+/).some(word => fact.content.toLowerCase().includes(word)) // Check for content keywords
    );

    if (relevantFacts.length > 0) {
        answerText = `Based on your personal records, here's what I found:\n`;
        relevantFacts.forEach((fact) => {
            answerText += `- ${fact.content} (from ${fact.source} at ${fact.at.toLocaleDateString()})\n`;
            citedFactIds.push(fact._id);
        });
        answerText += `\nI hope this information is helpful!`;
    } else if (userFacts.length > 0) {
         answerText = `I have ${userFacts.length} facts recorded for you, but none directly address "${question}". Maybe try rephrasing?`;
    }

    // --- Store QA ---
    const qaId = freshID() as QaId;
    await this.qas.insertOne({ _id: qaId, owner: requester, question, answer: answerText, citedFacts: citedFactIds });

    return { answer: answerText, citedFacts: citedFactIds };
  }

  /**
   * Query: Retrieves all facts for a given user.
   */
  public async _getUserFacts({ owner }: { owner: User }): Promise<FactDoc[]> {
    return await this.facts.find({ owner }).toArray();
  }

  /**
   * Query: Retrieves all Q&A entries for a given user.
   */
  public async _getUserQAs({ owner }: { owner: User }): Promise<QADoc[]> {
    return await this.qas.find({ owner }).toArray();
  }
}
```

***
