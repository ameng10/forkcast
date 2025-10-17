---
timestamp: 'Thu Oct 16 2025 22:43:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_224305.087853c1.md]]'
content_id: 2b1166b6c03d846bfc03e907355e87f40d8ec6e9c21600c91a453b109f0be850
---

# implement: PersonalQA using the following framework. Fix any formatting and modularity issues and make sure the specification matches code made. Write the code in typescript. Edit the following so that you use MongoDB when a database is needed and use asyncs when needed. Remember that this is an app that many users will use at the same time, but only the user will be able to access their own qa's.

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
