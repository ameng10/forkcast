---
timestamp: 'Thu Oct 16 2025 22:55:24 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_225524.c65b352e.md]]'
content_id: d3cc4eda0d0c11f36ed530dfb111b069716d255c8c3413f1148272dac603ce88
---

# response:

Here's the concept design and TypeScript implementation for `PersonalQA`, adhering to the provided framework and Simple State Form (SSF) specifications.

***

## Concept Design: PersonalQA

### Concept: PersonalQA \[User, Fact, Question, Answer, Time]

**purpose** Answer a user’s food questions using their own meals, check-ins, and insights.

**principle** The assistant maintains a private fact base of normalized statements (from meals, check-ins, insights, behavior changes) and answers questions by citing those facts.

### State (Simple State Form)

The generic parameters `User`, `Fact`, `Question`, `Answer`, `Time` are instantiated as concrete types in the implementation. `User` is treated as an object-type, `Fact`, `Question`, `Answer` as parameter-types, and `Time` maps to the primitive-type `Date`.

```
// Declaration of the Fact entity
a set of Facts with
  an owner User                             // A reference to a User entity
  an at Date                                // The timestamp when the fact was recorded
  a content Fact                            // The actual content of the fact (e.g., "fried food linked to lower energy")
  a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR // The origin of the fact

// Declaration of the QA (Question-Answer) entity
a set of QAs with
  an owner User                             // A reference to the User who asked the question
  a question Question                       // The text of the question asked
  an answer Answer                          // The generated answer to the question
  a citedFacts set of Facts                 // A collection of Facts that were used to formulate the answer
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

The following TypeScript code implements the `PersonalQA` concept using in-memory `Map`s for state storage, simulating asynchronous database operations for better real-world applicability.

```typescript
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// --- 1. Generic Parameter Types & Primitive Types Instantiation ---
// These types represent the generic parameters [User, Fact, Question, Answer, Time]
// from the concept definition, mapped to concrete TypeScript types.
type UserId = string;
type FactContent = string; // The descriptive content of a fact
type QuestionText = string;
type AnswerText = string;
type TimeStamp = Date;     // Maps to SSF's 'Date' primitive type

// --- 2. Enumeration Type (from SSF) ---
// Corresponds to 'a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR'
enum FactSource {
    MEAL = "meal",
    CHECK_IN = "check_in",
    INSIGHT = "insight",
    BEHAVIOR = "behavior",
}

// --- 3. State Interfaces (Derived from SSF Declarations) ---

// Represents a unique identifier for a Fact
type FactId = string;

/**
 * Interface for a Fact entity.
 * Corresponds to 'a set of Facts with...' in SSF.
 */
interface Fact {
    id: FactId;
    owner: UserId;
    at: TimeStamp;
    content: FactContent;
    source: FactSource;
}

// Represents a unique identifier for a QA (Question-Answer) entry
type QaId = string;

/**
 * Interface for a QA entity.
 * Corresponds to 'a set of QAs with...' in SSF.
 * 'citedFacts set of Facts' is represented as an array of Fact IDs.
 */
interface QA {
    id: QaId;
    owner: UserId;
    question: QuestionText;
    answer: AnswerText;
    citedFacts: FactId[]; // Array of Fact IDs that supported the answer
}

// --- 4. PersonalQA Concept Implementation ---

/**
 * Implements the PersonalQA concept's state and actions.
 * Uses in-memory Maps for storage, simulating async operations.
 */
class PersonalQAConcept {
    private facts: Map<FactId, Fact>; // Stores all ingested facts
    private qas: Map<QaId, QA>;       // Stores all asked questions and their answers

    constructor() {
        this.facts = new Map<FactId, Fact>();
        this.qas = new Map<QaId, QA>();
    }

    /**
     * Action: Ingests a new fact into the system.
     * This method adds a new Fact object to the collection of facts.
     *
     * @param owner The user who owns this fact.
     * @param at The timestamp when the fact was recorded.
     * @param content The descriptive content of the fact.
     * @param source The origin of the fact (e.g., meal, check_in).
     * @returns A promise that resolves to the newly created Fact object.
     *
     * Effects: add a fact
     */
    public async ingestFact(owner: UserId, at: TimeStamp, content: FactContent, source: FactSource): Promise<Fact> {
        const newFact: Fact = {
            id: uuidv4(), // Generate a unique ID for the new fact
            owner,
            at,
            content,
            source,
        };
        // Simulate an asynchronous database write operation
        await new Promise(resolve => setTimeout(resolve, 50)); // Short delay
        this.facts.set(newFact.id, newFact);
        console.log(`[Concept] Fact ingested for user ${owner}: "${newFact.content.substring(0, 40)}..." (ID: ${newFact.id})`);
        return newFact;
    }

    /**
     * Action: Removes an existing fact from the system.
     * This method removes a Fact from the collection, provided the requester is the owner.
     *
     * @param requester The user requesting the fact removal.
     * @param owner The owner of the fact to be removed.
     * @param factId The ID of the fact to be removed.
     * @returns A promise that resolves to true if the fact was successfully removed, false otherwise.
     *
     * Requires: fact with factId exists for owner AND requester = owner
     * Effects: remove the fact
     */
    public async forgetFact(requester: UserId, owner: UserId, factId: FactId): Promise<boolean> {
        // Simulate an asynchronous database read operation
        await new Promise(resolve => setTimeout(resolve, 30));
        const factToRemove = this.facts.get(factId);

        // Precondition checks
        if (!factToRemove) {
            console.warn(`[Concept] ForgetFact failed: Fact with ID '${factId}' not found.`);
            return false;
        }
        if (factToRemove.owner !== owner) {
             console.warn(`[Concept] ForgetFact failed: Fact with ID '${factId}' is not owned by user '${owner}'.`);
            return false;
        }
        if (requester !== owner) {
            console.warn(`[Concept] ForgetFact failed: Requester '${requester}' is not the owner '${owner}' of fact ID '${factId}'.`);
            return false;
        }

        // Simulate an asynchronous database write operation
        await new Promise(resolve => setTimeout(resolve, 50));
        this.facts.delete(factId);
        console.log(`[Concept] Fact ID '${factId}' forgotten for user '${owner}'.`);
        return true;
    }

    /**
     * Action: Processes a user's question and generates an answer based on their facts.
     * This method retrieves relevant facts, generates a simulated answer, and stores the QA.
     *
     * @param requester The user asking the question.
     * @param question The question asked by the user.
     * @returns A promise that resolves to an object containing the generated answer and the IDs of the facts it cited.
     *
     * Requires: requester exists (assumed true for any UserId in this mock; a real system might check a 'Users' collection)
     * Effects: produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts
     */
    public async ask(requester: UserId, question: QuestionText): Promise<{ answer: AnswerText, citedFacts: FactId[] }> {
        // Precondition check: requester exists. In this mock, we assume any UserId string is valid.
        // In a real system, `await this.usersCollection.findById(requester)` might be performed.
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async check

        // Retrieve facts owned by the requester
        // Simulate an asynchronous database read operation
        await new Promise(resolve => setTimeout(resolve, 100));
        const userFacts = Array.from(this.facts.values()).filter(fact => fact.owner === requester);

        // --- Simulated Answer Generation Logic ---
        // This is a simplified placeholder. In a real system, this would involve NLP,
        // an LLM, or a sophisticated rule engine to derive an answer from facts.
        let answerText: AnswerText = "I couldn't find enough information in your facts to answer that specific question.";
        const citedFactIds: FactId[] = [];
        const questionLower = question.toLowerCase();

        // Simple keyword matching for demonstration purposes
        const relevantFacts = userFacts.filter(fact =>
            questionLower.includes(fact.source.toLowerCase()) || // Check if source keyword is in question
            questionLower.split(/\s+/).some(word => fact.content.toLowerCase().includes(word)) // Check for content keywords
        );

        if (relevantFacts.length > 0) {
            answerText = `Based on your personal records, here's what I found:\n`;
            relevantFacts.forEach((fact, index) => {
                answerText += `- ${fact.content} (from ${fact.source} at ${fact.at.toLocaleDateString()})\n`;
                citedFactIds.push(fact.id);
            });
            answerText += `\nI hope this information is helpful!`;
        } else if (userFacts.length > 0) {
             answerText = `I have ${userFacts.length} facts recorded for you, but none directly address "${question}". Maybe try rephrasing?`;
        }

        // --- Store QA ---
        const newQA: QA = {
            id: uuidv4(), // Generate a unique ID for the QA entry
            owner: requester,
            question,
            answer: answerText,
            citedFacts: citedFactIds,
        };
        // Simulate an asynchronous database write operation
        await new Promise(resolve => setTimeout(resolve, 70));
        this.qas.set(newQA.id, newQA);
        console.log(`[Concept] Stored QA for user '${requester}': "${question.substring(0, 30)}..." -> "${answerText.substring(0, 50)}..."`);

        return { answer: answerText, citedFacts: citedFactIds };
    }

    // --- Helper methods for demonstration (not part of concept actions) ---
    public async getAllFacts(): Promise<Fact[]> {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async read
        return Array.from(this.facts.values());
    }

    public async getAllQAs(): Promise<QA[]> {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async read
        return Array.from(this.qas.values());
    }
}

// --- Example Usage ---
async function demonstratePersonalQA() {
    console.log("--- Initializing PersonalQA Concept ---");
    const personalQA = new PersonalQAConcept();

    const aliceId: UserId = "user-alice-123";
    const bobId: UserId = "user-bob-456";
    const charlieId: UserId = "user-charlie-789"; // A user with no facts

    console.log("\n--- Ingesting Facts for Alice ---");
    const fact1 = await personalQA.ingestFact(aliceId, new Date('2023-01-15T10:00:00Z'), "late_night + fried food linked to lower energy (conf 0.82)", FactSource.INSIGHT);
    const fact2 = await personalQA.ingestFact(aliceId, new Date('2023-01-16T18:30:00Z'), "ate a large pasta meal for dinner", FactSource.MEAL);
    const fact3 = await personalQA.ingestFact(aliceId, new Date('2023-01-17T08:00:00Z'), "reported high energy levels after consistent sleep", FactSource.CHECK_IN);
    const fact4 = await personalQA.ingestFact(aliceId, new Date('2023-01-18T12:00:00Z'), "daily meditation improves focus", FactSource.BEHAVIOR);
    const fact5 = await personalQA.ingestFact(aliceId, new Date('2023-01-19T09:00:00Z'), "discovered positive link between hydration and mood", FactSource.INSIGHT);

    console.log("\n--- Ingesting Facts for Bob ---");
    const bobFact1 = await personalQA.ingestFact(bobId, new Date('2023-02-01T09:00:00Z'), "morning runs consistently improve mood and alertness", FactSource.BEHAVIOR);

    console.log("\n--- Alice asks questions ---");
    const question1 = "What have I learned about my energy?";
    const { answer: answer1, citedFacts: citedFacts1 } = await personalQA.ask(aliceId, question1);
    console.log(`\nAlice's Question: "${question1}"`);
    console.log(`Alice's Answer: \n${answer1}`);
    console.log(`Cited Fact IDs: ${citedFacts1.join(', ')}`);
    console.log("------------------------------------------");

    const question2 = "Tell me about my recent meals.";
    const { answer: answer2, citedFacts: citedFacts2 } = await personalQA.ask(aliceId, question2);
    console.log(`\nAlice's Question: "${question2}"`);
    console.log(`Alice's Answer: \n${answer2}`);
    console.log(`Cited Fact IDs: ${citedFacts2.join(', ')}`);
    console.log("------------------------------------------");

    const question3 = "How does meditation affect me?";
    const { answer: answer3, citedFacts: citedFacts3 } = await personalQA.ask(aliceId, question3);
    console.log(`\nAlice's Question: "${question3}"`);
    console.log(`Alice's Answer: \n${answer3}`);
    console.log(`Cited Fact IDs: ${citedFacts3.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Bob asks a question ---");
    const question4 = "How can I improve my mood?";
    const { answer: answer4, citedFacts: citedFacts4 } = await personalQA.ask(bobId, question4);
    console.log(`\nBob's Question: "${question4}"`);
    console.log(`Bob's Answer: \n${answer4}`);
    console.log(`Cited Fact IDs: ${citedFacts4.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Charlie asks a question (no facts) ---");
    const question5 = "What should I eat for dinner?";
    const { answer: answer5, citedFacts: citedFacts5 } = await personalQA.ask(charlieId, question5);
    console.log(`\nCharlie's Question: "${question5}"`);
    console.log(`Charlie's Answer: \n${answer5}`);
    console.log(`Cited Fact IDs: ${citedFacts5.join(', ')}`);
    console.log("------------------------------------------");

    console.log("\n--- Attempting to forget a fact (requester mismatch) ---");
    const forgetAttempt1 = await personalQA.forgetFact(bobId, aliceId, fact1.id); // Bob tries to forget Alice's fact
    console.log(`Forget attempt successful? ${forgetAttempt1}`);

    console.log("\n--- Attempting to forget a non-existent fact ---");
    const forgetAttempt2 = await personalQA.forgetFact(aliceId, aliceId, "non-existent-id-xyz");
    console.log(`Forget attempt successful? ${forgetAttempt2}`);

    console.log("\n--- Alice forgets one of her facts ---");
    const forgetAttempt3 = await personalQA.forgetFact(aliceId, aliceId, fact2.id);
    console.log(`Forget attempt successful? ${forgetAttempt3}`);

    console.log("\n--- Alice asks a meal-related question again after forgetting a fact ---");
    const question6 = "Tell me about my recent meals."; // The large pasta meal fact was forgotten
    const { answer: answer6, citedFacts: citedFacts6 } = await personalQA.ask(aliceId, question6);
    console.log(`\nAlice's Question: "${question6}"`);
    console.log(`Alice's Answer: \n${answer6}`);
    console.log(`Cited Fact IDs: ${citedFacts6.join(', ')}`);
    console.log("------------------------------------------");


    console.log("\n--- Final State Check ---");
    console.log("All Facts:", await personalQA.getAllFacts());
    console.log("All QAs:", await personalQA.getAllQAs());
}

// Execute the demonstration
demonstratePersonalQA();
```
