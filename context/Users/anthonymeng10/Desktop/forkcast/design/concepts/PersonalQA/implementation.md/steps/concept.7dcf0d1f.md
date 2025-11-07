---
timestamp: 'Fri Nov 07 2025 01:10:36 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_011036.cc9fcfb0.md]]'
content_id: 7dcf0d1f7b90fa9bab0740ee89d4a1654dd75b3ee73fd6fb9e375aa22d9417c1
---

# concept: PersonalQA

```
concept PersonalQA [User]

purpose enable a user to get synthesized answers to questions based on a personal knowledge base of ingested facts

principle a user ingests several facts about their daily activities (meals, check-ins, behaviors). later, they ask a question like "how have my meals been lately?". the system finds the most relevant facts, synthesizes a concise answer, and returns it, citing the facts it used.

state
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

actions
ingestFact (owner: User, at: Date, content: String, source: FactSource): (fact: Fact)
forgetFact (requester: User, owner: User, factId: Fact): (ok: Flag)
forgetFact (requester: User, owner: User, factId: Fact): (error: String)
ask (requester: User, question: String): (qa: QADoc)
askLLM (requester: User, question: String, optional k: Number): (qa: QADoc)
setTemplate (requester: User, name: String, template: String): (ok: Flag)

queries
_getUserFacts (owner: User): (FactDoc)
_getUserQAs (owner: User): (QADoc)
_getUserDrafts (owner: User): (DraftDoc)

```
