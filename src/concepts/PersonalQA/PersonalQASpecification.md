### Concept: PersonalQA [User, Fact, Question, Answer, Time]

**purpose** Answer a user’s food questions using their own meals, check-ins, and insights.

**principle** The assistant maintains a private fact base of normalized statements (from meals, check-ins, insights, behavior changes) and answers questions by citing those facts.

**state**

- A set of Facts with:
    - owner: User
    - at: Time
    - content: Fact (e.g., “late_night + fried linked to lower energy (conf 0.82)”)
    - source: String ("meal", "check_in", "insight", "behavior")
- A set of QAs with:
    - owner: User
    - question: Question
    - answer: Answer
    - citedFacts: Set(Fact)

**actions**

- `ingestFact(owner: User, at: Time, content: Fact, source: String)`
    - **effects:** add a fact
- `forgetFact(requester: User, owner: User, fact: Fact)`
    - **requires:** fact exists for owner and requester = owner
    - **effects:** remove the fact
- `ask(requester: User, question: Question): (answer: Answer, citedFacts: Set(Fact))`
    - **requires:** requester exists
    - **effects:** produce an answer derived from requester’s Facts; store QA with owner = requester; return answer with citedFacts
