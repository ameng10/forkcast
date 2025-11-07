---
timestamp: 'Fri Nov 07 2025 10:14:44 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_101444.1cc010fd.md]]'
content_id: d066f69f103fc580820fb4384da4d01f6ea553222cc829ff57b12afd70197882
---

# concept: PersonalQA

**concept** PersonalQA \[User]

**purpose** enable a user to get synthesized answers to questions based on a personal knowledge base of ingested facts

**principle** after a user ingests several facts about their activities, they can ask a question related to those facts and receive a synthesized answer that cites the relevant information

**state**

```
a set of Facts with
  an owner User
  an at Date
  a content String
  a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR

a set of QAs with
  an owner User
  a question String
  an answer String
  a citedFacts set of Fact
  an optional confidence Number
  an at Date

a set of Drafts with
  an owner User
  a question String
  a raw String
  a validated Flag
  an at Date

a Templates set of Users with
  a name String
  a text String
```

**actions**

ingestFact (owner: User, at: Date, content: String, source: String): (fact: Fact)
**requires** true
**effects** creates a new Fact with the given properties, owned by `owner`; returns the new Fact's ID as `fact`

forgetFact (requester: User, owner: User, factId: Fact): (ok: Flag) or (error: String)
**requires** `requester` is the same as `owner`
**effects** if the fact `factId` exists and its owner is `owner`, deletes the fact and returns `ok`; otherwise returns an error

ask (requester: User, question: String): (qa: QA)
**requires** true
**effects** analyzes the `requester`'s existing facts to find those relevant to the `question`; creates a conservative summary as an answer; creates a new QA entry with the question, answer, and cited facts; returns the new QA's ID as `qa`

askLLM (requester: User, question: String, optional k: Number): (qa: QA)
**requires** true
**effects** selects the `k` most recent facts for the `requester`; uses a user-specific or default template to generate a prompt for an external LLM; if an LLM is available, sends the prompt and records the response as the answer; creates a `Draft` to log the LLM interaction; if no LLM is available, generates a conservative summary as the answer; creates a new QA entry with the question, answer, and cited facts; returns the new QA's ID as `qa`

setTemplate (requester: User, name: String, template: String): (ok: Flag)
**requires** true
**effects** creates or updates the LLM prompt template associated with the `requester`, setting its name and text; returns `ok`

**queries**

\_getUserFacts (owner: User): (facts: set of FactDoc)
**requires** `owner` exists
**effects** returns all facts for the given `owner`

\_getUserQAs (owner: User): (qas: set of QADoc)
**requires** `owner` exists
**effects** returns all QAs for the given `owner`

\_getUserDrafts (owner: User): (drafts: set of DraftDoc)
**requires** `owner` exists
**effects** returns all drafts for the given `owner`
