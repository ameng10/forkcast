---
timestamp: 'Thu Oct 16 2025 22:46:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_224601.83da8698.md]]'
content_id: 6543a6199bc11da7ff6d99dfda68f7e7c6de42944dcbbd4ef1b268fb449f09fa
---

# response:

## Concept Design: PersonalQA

### Concept: PersonalQA \[User, Fact, Question, Answer, Time]

**purpose** Answer a user’s food questions using their own meals, check-ins, and insights.

**principle** The assistant maintains a private fact base of normalized statements (from meals, check-ins, insights, behavior changes) and answers questions by citing those facts.

### State (Simple State Form)

```
// Parameter types (User, Fact, Question, Answer, Time) are instantiated as concrete types in the implementation.
// In SSF, 'User' is treated as an object-type, and 'Fact', 'Question', 'Answer' as parameter-types.
// 'Time' is represented by the primitive-type 'Date'.

a set of Facts with
  an owner User             // Refers to a User entity (object-type)
  an at Date                // Timestamp for the fact (primitive-type)
  a content Fact            // The content of the fact (parameter-type)
  a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR // Enumerated source

a set of QAs with
  an owner User             // Refers to a User entity (object-type)
  a question Question       // The question asked (parameter-type)
  an answer Answer          // The answer generated (parameter-type)
  a citedFacts set of Facts // A set of Facts that supported the answer
```

### Actions

* `ingestFact(owner: User, at: Time, content: Fact, source: String)`
  * **effects:** add a fact
* `forgetFact(requester: User, owner: User, factId: String)`
  * **requires:** fact with `factId` exists for `owner` AND `requester` = `owner`
  * **effects:** remove the fact
* `ask(requester: User, question: Question): (answer: Answer, citedFacts: Set(Fact))`
  * **requires:** requester exists
  * **effects:** produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts

***

## TypeScript Implementation

The following TypeScript code implements the `PersonalQA` concept. It uses an in-memory store to represent the state, demonstrating the structure and actions.

```typescript
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// --- 1. Generic Parameter Types & Primitive Types ---
// As defined in the concept: [User, Fact, Question, Answer, Time]
// These are instantiated as concrete types for the implementation.
type UserId = string;
type FactContent = string; // The actual content of a fact, e.g., "late_night + fried linked to lower energy (conf 0.82)"
type QuestionText = string;
type AnswerText = string;
type TimeStamp = Date;

// --- 2. Enumeration Types ---
// Corresponds to 'a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR'
enum FactSource {
    MEAL = "meal",
    CHECK_IN = "check_in",
    INSIGHT = "insight",
    BEHAVIOR = "behavior",
}

// --- 3. State Interfaces (Based on SSF Declarations) ---

// Represents a unique identifier for a Fact
type FactId = string;

/**
 * Represents a single piece of information or insight.
 * Corresponds to 'a set of Facts with...'
 */
interface Fact {
    id: FactId;
    owner: UserId;
    at: TimeStamp;
    content: FactContent;
    source: FactSource;
}

// Represents a unique identifier for a QA entry
type QaId = string;

/**
 * Represents a stored Question and its Answer, along with the facts that informed it.
 * Corresponds to 'a set of QAs with...'
 */
interface QA {
    id: QaId;
    owner: UserId;
    question: QuestionText;
    answer: AnswerText;
    // 'citedFacts set of Facts' implies a collection of Fact identities.
    citedFacts: FactId[];
}

// --- 4. PersonalQA Concept Implementation ---

class PersonalQAConcept {
    // In-memory store for demonstration. In a real application, this would interact with a database.
    private facts: Map<FactId, Fact>;
    private qas: Map<QaId, QA>;

    constructor() {
        this.facts = new Map<FactId, Fact>();
        this.qas = new Map<QaId, QA>();
    }

    /**
     * Action: Ingests a new fact into the system.
     * @param owner The user who owns this fact.
     * @param at The timestamp when the fact was recorded.
     * @param content The descriptive content of the fact.
     * @param source The origin of the fact (e.g., meal, check_in).
     * @returns The newly created Fact object.
     *
     * Effects: add a fact
     */
    public ingestFact(owner: UserId, at: TimeStamp, content: FactContent, source: FactSource): Fact {
        const newFact: Fact = {
            id: uuidv4(),
            owner,
            at,
            content,
            source,
        };
        this.facts.set(newFact.id, newFact);
        console.log(`[Concept] Fact ingested for user ${owner}: ${newFact.content} (ID: ${newFact.id})`);
        return newFact;
    }

    /**
     * Action: Removes an existing fact from the system.
     * @param requester The user requesting the fact removal.
     * @param owner The owner of the fact to be removed.
     * @param factId The ID of the fact to be removed.
     * @returns true if the fact was successfully removed, false otherwise.
     *
     * Requires: fact with factId exists for owner AND requester = owner
     * Effects: remove the fact
     */
    public forgetFact(requester: UserId, owner: UserId, factId: FactId): boolean {
        const factToRemove = this.facts.get(factId);

        // Precondition check: fact exists and requester is the owner
        if (!factToRemove) {
            console.warn(`[Concept] ForgetFact failed: Fact with ID ${factId} not found.`);
            return false;
        }
        if (factToRemove.owner !== owner) {
             console.warn(`[Concept] ForgetFact failed: Fact with ID ${factId} is not owned by ${owner}.`);
            return false;
        }
        if (requester !== owner) {
            console.warn(`[Concept] ForgetFact failed: Requester ${requester} is not the owner ${owner} of fact ID ${factId}.`);
            return false;
        }

        this.facts.delete(factId);
        console.log(`[Concept] Fact ID ${factId} forgotten for user ${owner}.`);
        return true;
    }

    /**
     * Action: Processes a user's question and generates an answer based on their facts.
     * @param requester The user asking the question.
     * @param question The question asked by the user.
     * @returns An object containing the generated answer and the IDs of the facts it cited.
     *
     * Requires: requester exists (assumed true for any UserId in this mock)
     * Effects: produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts
     */
    public ask(requester: UserId, question: QuestionText): { answer: AnswerText, citedFacts: FactId[] } {
        // Precondition check: requester exists (in this mock, we assume any UserId is valid)
        // In a real system, you might check if `requester` exists in a 'Users' set.

        const userFacts = Array.from(this.facts.values()).filter(fact => fact.owner === requester);

        // --- Simulated Answer Generation Logic ---
        // This is a simplified placeholder. In a real system, this would involve NLP, LLM,
        // or a sophisticated rule engine to derive an answer from facts.
        let answerText: AnswerText = "I couldn't find enough information in your facts to answer that.";
        const citedFactIds: FactId[] = [];
        const questionLower = question.toLowerCase();

        const relevantFacts = userFacts.filter(fact =>
            questionLower.includes(fact.source.toLowerCase()) ||
            questionLower.split(' ').some(word => fact.content.toLowerCase().includes(word))
        );

        if (relevantFacts.length > 0) {
            answerText = `Based on your past records, here's what I found:\n`;
            relevantFacts.forEach((fact, index) => {
                answerText += `- ${fact.content} (from ${fact.source} at ${fact.at.toLocaleDateString()})\n`;
                citedFactIds.push(fact.id);
            });
            answerText += `\nI hope this helps!`;
        }

        // --- Store QA ---
        const newQA: QA = {
            id: uuidv4(),
            owner: requester,
            question,
            answer: answerText,
            citedFacts: citedFactIds,
        };
        this.qas.set(newQA.id, newQA);
        console.log(`[Concept] Stored QA for user ${requester}: "${question}" -> "${answerText.substring(0, 50)}..."`);

        return { answer: answerText, citedFacts: citedFactIds };
    }

    // --- Helper for demonstration (not part of concept actions) ---
    public getAllFacts(): Fact[] {
        return Array.from(this.facts.values());
    }

    public getAllQAs(): QA[] {
        return Array.from(this.qas.values());
    }
}

// --- Example Usage ---
async function demonstratePersonalQA() {
    console.log("--- Initializing PersonalQA Concept ---");
    const personalQA = new PersonalQAConcept();

    const aliceId: UserId = "user-alice";
    const bobId: UserId = "user-bob";

    console.log("\n--- Ingesting Facts for Alice ---");
    const fact1 = personalQA.ingestFact(aliceId, new Date('2023-01-15T10:00:00Z'), "late_night + fried linked to lower energy (conf 0.82)", FactSource.INSIGHT);
    const fact2 = personalQA.ingestFact(aliceId, new Date('2023-01-16T18:30:00Z'), "ate a large pasta meal", FactSource.MEAL);
    const fact3 = personalQA.ingestFact(aliceId, new Date('2023-01-17T08:00:00Z'), "reported high energy levels", FactSource.CHECK_IN);
    const fact4 = personalQA.ingestFact(aliceId, new Date('2023-01-18T12:00:00Z'), "daily meditation improves focus", FactSource.BEHAVIOR);

    console.log("\n--- Ingesting Facts for Bob ---");
    personalQA.ingestFact(bobId, new Date('2023-02-01T09:00:00Z'), "morning runs improve mood", FactSource.BEHAVIOR);

    console.log("\n--- Alice asks a question ---");
    const question1 = "What have I learned about my energy levels?";
    const { answer: answer1, citedFacts: citedFacts1 } = personalQA.ask(aliceId, question1);
    console.log(`\nAlice's Question: "${question1}"`);
    console.log(`Alice's Answer: \n${answer1}`);
    console.log(`Cited Fact IDs: ${citedFacts1.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Alice asks another question (less direct) ---");
    const question2 = "Tell me about my recent meals.";
    const { answer: answer2, citedFacts: citedFacts2 } = personalQA.ask(aliceId, question2);
    console.log(`\nAlice's Question: "${question2}"`);
    console.log(`Alice's Answer: \n${answer2}`);
    console.log(`Cited Fact IDs: ${citedFacts2.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Bob asks a question ---");
    const question3 = "How can I improve my mood?";
    const { answer: answer3, citedFacts: citedFacts3 } = personalQA.ask(bobId, question3);
    console.log(`\nBob's Question: "${question3}"`);
    console.log(`Bob's Answer: \n${answer3}`);
    console.log(`Cited Fact IDs: ${citedFacts3.join(', ')}`);
    console.log("------------------------------------------");


    console.log("\n--- Attempting to forget a fact (requester mismatch) ---");
    const forgetAttempt1 = personalQA.forgetFact(bobId, aliceId, fact1.id); // Bob tries to forget Alice's fact
    console.log(`Forget attempt successful? ${forgetAttempt1}`);

    console.log("\n--- Attempting to forget a non-existent fact ---");
    const forgetAttempt2 = personalQA.forgetFact(aliceId, aliceId, "non-existent-id");
    console.log(`Forget attempt successful? ${forgetAttempt2}`);

    console.log("\n--- Alice forgets one of her facts ---");
    const forgetAttempt3 = personalQA.forgetFact(aliceId, aliceId, fact2.id);
    console.log(`Forget attempt successful? ${forgetAttempt3}`);

    console.log("\n--- Alice asks a question again after forgetting a fact ---");
    const question4 = "Tell me about my recent meals."; // This meal fact was forgotten
    const { answer: answer4, citedFacts: citedFacts4 } = personalQA.ask(aliceId, question4);
    console.log(`\nAlice's Question: "${question4}"`);
    console.log(`Alice's Answer: \n${answer4}`);
    console.log(`Cited Fact IDs: ${citedFacts4.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Current State ---");
    console.log("All Facts:", personalQA.getAllFacts());
    console.log("All QAs:", personalQA.getAllQAs());
}

// Execute the demonstration
demonstratePersonalQA();
```
