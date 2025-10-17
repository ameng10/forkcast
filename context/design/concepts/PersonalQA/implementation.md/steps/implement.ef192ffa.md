---
timestamp: 'Thu Oct 16 2025 22:47:49 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_224749.b263fc13.md]]'
content_id: ef192ffa42535aa5f84239b39aedd3fe36cf470e8cffd50ee3703f48dca5497b
---

# implement: PersonalQA using the following framework. Fix any formatting and modularity issues and make sure the specification matches code made. Write the code in typescript. Edit the code to use asyncs when needed.

### Concept: PersonalQA \[User, Fact, Question, Answer, Time]

**purpose** Answer a user’s food questions using their own meals, check-ins, and insights.

**principle** The assistant maintains a private fact base of normalized statements (from meals, check-ins, insights, behavior changes) and answers questions by citing those facts.

**state**

* A set of Facts with:
  * owner: User
  * at: Time
  * content: Fact (e.g., “late\_night + fried linked to lower energy (conf 0.82)”)
  * source: String ("meal", "check\_in", "insight", "behavior")
* A set of QAs with:
  * owner: User
  * question: Question
  * answer: Answer
  * citedFacts: Set(Fact)

**actions**

* `ingestFact(owner: User, at: Time, content: Fact, source: String)`
  * **effects:** add a fact
* `forgetFact(requester: User, owner: User, fact: Fact)`
  * **requires:** fact exists for owner and requester = owner
  * **effects:** remove the fact
* `ask(requester: User, question: Question): (answer: Answer, citedFacts: Set(Fact))`
  * **requires:** requester exists
  * **effects:** produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts

Okay, let's design and implement the `PersonalQA` concept using the provided framework, Simple State Form (SSF) for state definition, and TypeScript with MongoDB for persistence.

***
