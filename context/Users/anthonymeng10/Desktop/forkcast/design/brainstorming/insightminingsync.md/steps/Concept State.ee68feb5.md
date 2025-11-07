---
timestamp: 'Fri Nov 07 2025 13:31:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_133120.e9d9a6b0.md]]'
content_id: ee68feb5f5d55bf322c07ecbbd8134ecfd8e25c0350ca298c131c3abc6d99dd4
---

# Concept State: Simple State Form

## Motivation

Simple State Form (SSF) is a syntax for data modeling that is designed to be both easy to read (by technical and non-technical people alike) and also easily translatable into a database schema (either by an LLM or by a conventional parser). It is intended to be compatible with collection databases (such as MongoDB), relational databases (such as SQLLite), relational modeling languages (such as Alloy), and also graph databases (such as Neo and GraphQL). SSF was motivated by the need for a simple language for state declarations for concepts in concept design.

## Examples

A set of users, each with a username and password, both strings:

```
a set of Users with
  a username String
  a password String
```

A set of users, each with a set of followers who are users:

```
a set of Users with
  a followers set of Users
```

A set of users, each with a profile (using the ability to omit a field name, so that the implicit field name is "profile"):

```
a set of Users with
  a Profile
```

A set of users with a status that is enumerated:

```
a set of Users with
  a status of PENDING or REGISTERED
```

A singleton set used for global settings

```
an element GlobalSettings with
  a deployed Flag
  an applicationName String
  an apiKey String
```

A set of users, and a subset that have been banned on a particular date and by a particular user:

```
a set of Users with
  a username String
  a password String

a Banned set of Users with
  a bannedOn Date
  a bannedBy User
```

A subset without any relations:

```
a set of Users with
  a username String
  a password String

a Banned set of Users
```

A set of items, classified into books and movies:

```
a set of Items with
  a title String
  a created Date

a Books set of Items with
  an isbn String
  a pageCount Number
  an author Person
  
a Movies set of Items with
   an imdb String
   a director String 
   an actors set of Persons

a set of Persons with
   a name String
   a dob Date
```

A mapping defined separately on a set, using a subset (defining a relation called *followers* mapping users in the subset *Followed* to users):

```
a set of Users with
  a username String
  a password String
  
a Followed set of Users with
  a followers set of Users
```

An implicitly named field (called *profile*, relating *Users* to *Profiles*)

```
a set of Users with 
  a Profile
```

An implicitly named set-typed field (called *options*, relating *Questions* to Options)

```
a set of Questions with 
  a set of Options
```

A model of a simple folder scheme in which folders and files have names:

```
a set of Folders with
  an optional parent Folder
  a name String
  
a RootFolder element of Folder

a set of Files with 
  a Folder
  a name String
```

A model of a Unix like scheme in which names are local to directories:

```
a set of FileSystemObjects

a Files set of FileSystemObjects

a Directories set of FileSystemObjects with
  a set of Entries
  
a RootDirectory element of Directories

a set of Entries with
  a name String
  a member FileSystemObject
```

## Two views of a declaration

Consider a declaration such as:

```
a set of Users with
  a username String
  a password String
```

There are different ways to view this:

* **Collection of objects or documents**. In this view, the declaration introduces a collection of structured objects or documents, in this case a collection of users, each of which has a username and a password.
* **Set and relations**. In this view, the declaration introduces a set of identifiers (say {u1, u2, u3}), and two relations, one called username that maps each user to their username (say {(u1, "Alice"), (u2, "Bob"), (u3, "Carol")}), and one called password that maps each user to their password (say {(u1, "foo"), (u2, "bar"), (u3, "baz")}).

The collection of objects view is probably how non-technical readers will prefer to understand the declaration, and most of the time that view will suffice. But the sets and relations view is more correct, and addresses some subtle points more straightforwardly. Here are some examples of these subtleties:

* **Shared substructure**. The collection of objects view might appear to suggest that these objects cannot "share" sub-objects, but that is not the case. In this model for book clubs, for example, the collection of objects view might seem to suggest that a book club somehow "owns" a book, which makes it confusing that a member of the club also seems to own books (the ones they've read). But there is no such issue; the sets and relation view makes it clear that the same book (identifier) can be a book in a book club and in the set of books read by a member:

  ```
    a set of BookClubs with
     a set of Books
     a set of Members

    a set of Books with
     a title String
     an author String	

    a set of Members with
     a read set of Books
  ```

* **Multiple structures**. The relational view makes it easier to understand how multiple declarations can define structural aspects of the "same object." In the two declarations below, for example, a user acquires a username and password from the first, and an avatar and display name from the second. This kind of separation of concerns is commonly exploited in concept design; in this case, the first declaration might belong to an authentication concept and the second to a user profile concept:

  ```
    a set of Users with
      a username String
      a password String

    a set of Users with
      an Avatar
      a displayName String
  ```

* **Defining associations**. The relational view also makes it easier to grasp how an association can be defined. For example, a declaration in one concept may define the expected, inherent structure of an object, and a declaration in another may define an object's association with another object. For example, in these declarations the first defines the conventional structure of an email address, and the second maps each email address to the server that hosts its email account:

  ```
    a set of EmailAddresses with
      a username String
      a Domain

    a set of EmailAddresses with 
      a Server
  ```

* **Generic types**. A concept can treat some types as parameters, which means that they are generic and instantiated on use. For example, a commenting concept may associate comments with generic "items," which in a particular system will turn out to be articles, or posts, etc. In this case, there will generally be declarations in different concepts that declare sets that will actually be the same set when the concepts are instantiated. For example, a posting concept might declare a set of posts with content and author, and a commenting concept might declare a set of items each of which is associated with a set of comments, where the items will turn out to be the posts:

  ```
    a set of Items with
     a set of Comments

    a set of Posts with 
     a content String
     an author User
  ```

## Declaration structure, navigation & invariants

The way that declarations are structured does *not* imply anything about what navigation pattern is supported. In particular, there is no implication from a set declaration of an expected iteration over the set, or that going from the "parent" to the "child" is supported but not the reverse. So if we write

```
a set of Users with
  a Group
```

for example, this does *not* mean that to find the users associated with a given group necessarily requires iterating through all the users, and that if this navigation were desired it would be preferable to write

```
a set of Groups with
  a set of Users
```

so that given a group one could "navigate" directly to the group's users. On the contrary, which of these is preferred depends on two factors. First, in some cases, one might seem more natural; for example, preferring the second if one wanted to emphasize the nature of groups. Second, there may be a multiplicity constraint that one formulation will allow, obviating the need to make the constraint explicit. In this case, for example, the first declaration makes it clear that each user belongs to only one group, whereas to assert this in the presence of the second declaration, an additional constraint would have to be noted informally.

## Grammar

* *schema* ::= ( *set-decl* | *subset-decl* )\*
* *set-decl* ::= \[ "a" | "an" ]  ("element" | "set") \[ "of" ] *object-type* \[ "with" *field-decl* + ]
* *subset-decl* ::= \[ "a" | "an" ]  *sub-type*  ("element" | "set") \[ "of" ] ( *object-type* | *sub-type* ) \[ "with" *field-decl* + ]
* *field-decl* ::=  \[ "a" | "an" ] \["optional"] \[*field-name*] (*scalar-type*  | *set-type*)
* *scalar-type* ::= *object-type* | *parameter-type* | *enumeration-type* | *primitive-type*
* *set-type* ::= ("set" | "seq" ) \[ "of" ] *scalar-type*
* *enumeration-type* ::= "of" (*enum-constant* "or" )+ *enum-constant*

## Grammar conventions

* \[ x ] means x is optional
* In ( x ), the parens used for grouping, and do not appear in the actual language
* a | b means either a or b
* x \* means an iteration of zero or more of x
* x + means an iteration of one or more of x

## Grammar constraints

* A *field-name* may be omitted only for declaring a field of *object-type* or *parameter-type*. Omitting the field name is equivalent to including a name that is the same as the name of the type but with the first character in lower case.
* The hierarchy that is specified by *subset-decls* cannot contain cycles. Thus, a *subset-decl* may not, for example, declare a subset with a *sub-type* that is the same as the *sub-type* that it is a subset of.
* The *field-names* within a *set-decl* or *subset-decl* must be unique. Also, within all the decls that are in the hierarchy beneath a *set-decl*, *field-names* must be unique.
* A *field-decl* that has a *set-type* cannot use the *optional* keyword.

## Lexical considerations: identifiers

* The identifiers *enum-constant*, *field-name*, *sub-type*, *object-type*, *parameter-type* and *primitive-type* are sequences of alphabetic characters, digits and underscores, starting with an alphabetic character. The alphabetic characters in an *enum-constant* must all be uppercase. A *field-name* must start with a lower case alphabetic character. A *subset-name*, *object-type*, *parameter-type* or *primitive-type* must start with an upper case alphabetic character.
* The standard values from which a *primitive-type* is drawn are "Number", "String", "Flag", "Date", "DateTime".

## Lexical considerations: layout

* The language is whitespace-sensitive to ensure unambiguous parsing
* Each declaration must occupy a single line
* Field declarations must be indented beneath the set declarations they belong to
* Types can optionally be pluralized, so "a set of Strings" is equivalent to "a set of String"
* Type names must always be capitalized ("User") and field and collection names are not capitalized ("email")
* Enumeration values (and no other names or types) are in uppercase
* The name of a field can be omitted only for an object type or a set of object types, in which case the implicit name of the field is the lowercased version of the type name, singular for a scalar and plural for a set.

## Overview of Key Semantic Features

The key semantic features of SSF are: the ability to declare sets of objects, along with relations that map them to other objects or primitive values, and subsets of these sets, with additional relations. A basic set of primitive types is provided, as well as enumerations. The language is first-order, so an object can be mapped to a set of objects or scalars, but not to a set of sets. Union types are currently not supported.

* Set and subset declarations introduce sets of objects, named by *object-types* and *sub-types*. Every member of a subset is expected also to be a member of the corresponding superset. For a regular object type, adding an object to a set will typically correspond to creating the object; in contrast, adding an object to a subset involves taking an existing object and making it belong to the subset. This is not true for a parameter type, which represents objects allocated elsewhere, and which can therefore be added to a top level set without needing to be created.
* The subsets of a set can overlap. Subsets offer a way both to classify objects (in a traditional subtype hierarchy) and also a way to declare relations on existing sets without extending the set declaration.
* When the keyword "element" is used rather than "set" in a set or subset declaration, the declared set is constrained to contain exactly one object.
* The value of an object is just its identity, so an object should not be thought of as a composite. But the notion of an object (as in object-oriented programming) is naturally represented as an object with fields, where the fields are considered to be relations mapping the object (identity) to other values.
* Every field can be viewed as a relation that maps an object to a set of values that may be empty or may contain a single value or multiple values. An optional scalar field corresponds to the empty case. A field with a set type should *not* be declared as optional; instead an empty set should be used when there is no value to map to.
* A field that is declared with the seq keyword is like one declared with the set keyword, except that the elements are ordered.

## Translation into MongoDB

A schema can be translated into a MongoDB database as follows:

* Each set or subset decl is represented as a collection in MongoDB, with the documents in the collection having the fields that are specified for that set or subset.
* The name of the MongoDB collection should generally match the name given for the set in SSF, which may be singular or plural. It is important, of course, that the name be used consistently, so if the SSF model sometimes uses the singular form and sometimes the plural, only one of these should be used.
* A singleton set is likewise represented as a collection, with the constraint that the collection must contain exactly one document.
* Fields are translated directly into properties of the collection's document. When the SSF model omits a field name, the implicit field name (obtained from the type) should be used as the property name.
* A field of set type is represented as an array of the given type.
* A field of enumeration type is represented simply as a string, using the enumeration constants as the possible string values.
* A field of the primitive type Flag is represented with a boolean value.
* A field of the primitive type Number is represented with an integer value.
* A field of the primitive type Date or DateTime is represented with Mongo's BSON Date datatype.

When an object of an object type (but not of a parameter type) is inserted into a set, a new document is added and a fresh identifier is generated and associated with the document. When an object is inserted into a subset, or an object of a parameter type is inserted into a set, a new document is added but its identifier is the old identifier of the object that the document represents.

This default translation, due to being rather simplistic, is inconsistent with the earlier claim that the declaration structure does not imply that some navigations are more efficient than others. Should this be a problem, it would be better to preserve the representation independence of the declarations, and allow richer transformations.

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
CHECK\_IN = "check\_in",
INSIGHT = "insight",
BEHAVIOR = "behavior",
}

type ISODateString = string;
type InputDate = Date | string | number;

/\*\*

* a set of Facts with
* an owner User
* an at Date
* a content String
* a source of MEAL or CHECK\_IN or INSIGHT or BEHAVIOR
  \*/
  type FactDoc = {
  \_id: Fact;
  owner: User;
  at: ISODateString;
  content: string;
  source: FactSource;
  };

/\*\*

* a set of QAs with
* an owner User
* a question String
* an answer String
* a citedFacts set of Fact
* an optional confidence Number
* an at Date
  \*/
  type QADoc = {
  \_id: QA;
  owner: User;
  question: string;
  answer: string;
  citedFacts: Fact\[];
  confidence?: number;
  at: ISODateString;
  };

/\*\*

* a set of Drafts with
* an owner User
* a question String
* a raw String
* a validated Flag
* an at Date
  \*/
  type DraftDoc = {
  \_id: Draft;
  owner: User;
  question: string;
  raw: unknown; // Represents a flexible JSON structure
  validated: boolean;
  at: ISODateString;
  };

/\*\*

* a Templates set of Users with
* a name String
* a text String
  \*/
  type TemplateDoc = {
  \_id: User; // The User ID is the identifier for the template
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

function selectTopK\<T extends { at: ISODateString }>(arr: T\[], k: number) {
return \[...arr].sort(sortByAtAsc).slice(-k);
}

function conservativeSummary(question: string, facts: FactDoc\[]): string {
if (facts.length === 0) return "Insufficient data to answer yet.";
const bits = facts.slice(-3).map((f) => f.content).join(" | ");
return `Based on your recent facts: ${bits}. I would need more data to be confident about “${question}”.`;
}

function tokenize(s: string): Set<string> {
return new Set(
(s.toLowerCase().match(/\[a-z0-9]+/g) ?? \[]).filter((t) => t.length >= 3),
);
}

function categoryHintsFromQuestion(q: string): Set<FactSource> {
const out = new Set<FactSource>();
const s = q.toLowerCase();
if (/(^|\W)insights?(\W|$)/.test(s)) out.add(FactSource.INSIGHT);
if (/(^|\W)check\[ \_-]?in(s)?(\W|$)/.test(s)) out.add(FactSource.CHECK\_IN);
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

const DEFAULT\_TEMPLATE =
\`Use a combination of the facts below and a web search to answer the user's question.
Do not copy facts verbatim. Give a couple short, confident sentences.

Question: {{question}}
Facts:
{{factsText}}\`;

function fillTemplate(template: string, facts: FactDoc\[], question: string) {
const factsText = facts.map((f) =>
`- ${f.content} (src:${f.source}, at:${f.at})`
).join("\n");
return template
.replace("{{question}}", question)
.replace("{{factsText}}", factsText);
}

/\*\*

* @concept PersonalQA - Enable a user to get synthesized answers to questions based on a personal knowledge base of ingested facts.
  \*/
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

/\*\*

* ingestFact (owner: User, at: Date, content: String, source: FactSource): (fact: Fact)
*
* **requires** true
*
* **effects** creates a new Fact with the given properties, owned by `owner`; returns the new Fact's ID
  \*/
  async ingestFact(
  { owner, at, content, source }: {
  owner: User;
  at: InputDate;
  content: string;
  source: FactSource;
  },
  ): Promise<{ fact: Fact }> {
  const \_id = freshID() as Fact;
  const doc: FactDoc = {
  \_id,
  owner,
  at: iso(at),
  content,
  source,
  };
  await this.facts.insertOne(doc as any);
  return { fact: \_id };
  }

/\*\*

* forgetFact (requester: User, owner: User, factId: Fact): (ok: Flag) or (error: String)
*
* **requires** `requester` is the same as `owner`
*
* **effects** if the Fact `factId` exists and is owned by `owner`, it is deleted and `ok: true` is returned. otherwise, an error is returned.
  \*/
  async forgetFact(
  { requester, owner, factId }: {
  requester: User;
  owner: User;
  factId: Fact;
  },
  ): Promise<{ ok: true } | { error: string }> {
  if (requester !== owner) {
  return { error: "not\_owner" };
  }
  const res = await this.facts.deleteOne({
  \_id: factId,
  owner: owner,
  } as any);
  if (res.deletedCount !== 1) {
  return { error: "fact\_not\_found" };
  }
  return { ok: true };
  }

/\*\*

* ask (requester: User, question: String): (qa: QADoc)
*
* **requires** true
*
* **effects** creates a new QA entry by analyzing the user's existing facts to answer the `question`; returns the new QA object
  \*/
  async ask(
  { requester, question }: { requester: User; question: string },
  ): Promise<{ qa: QADoc }> {
  const pool = await this.facts.find({ owner: requester })
  .toArray() as FactDoc\[];
  const qTokens = tokenize(question);
  const hinted = categoryHintsFromQuestion(question);

```
if (pool.length === 0) {
```

```
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
```

}

/\*\*

* askLLM (requester: User, question: String, optional k: Number): (qa: QADoc)
*
* **requires** true
*
* **effects** creates a new QA entry by using an external LLM to answer the `question` based on the user's `k` most recent facts; returns the new QA object
  \*/
  async askLLM(
  { requester, question, k }: {
  requester: User;
  question: string;
  k?: number;
  },
  ): Promise<{ qa: QADoc }> {
  const pool = await this.facts.find({ owner: requester })
  .toArray() as FactDoc\[];
  const topK = k ?? 12;
  const selection = selectTopK<FactDoc>(pool, topK);

```
const apiKey = (typeof Deno !== "undefined" && Deno.env?.get)
```

```
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
```

}

/\*\*

* setTemplate (requester: User, name: String, template: String): (ok: Flag)
*
* **requires** true
*
* **effects** creates or updates the LLM prompt template for the `requester`; returns `ok: true`
  \*/
  async setTemplate(
  { requester, name, template }: {
  requester: User;
  name: string;
  template: string;
  },
  ): Promise\<Empty | { ok: true }> {
  await this.templates.updateOne(
  { \_id: requester } as any,
  { $set: { name: name, text: template } } as any,
  { upsert: true },
  );
  return { ok: true };
  }

//
// QUERIES
//

/\*\*

* \_getUserFacts (owner: User): (FactDoc)
*
* **requires** user exists
*
* **effects** returns all facts for the given `owner`
  \*/
  async \_getUserFacts({ owner }: { owner: User }): Promise\<FactDoc\[]> {
  return await this.facts.find({ owner }).toArray();
  }

/\*\*

* \_getUserQAs (owner: User): (QADoc)
*
* **requires** user exists
*
* **effects** returns all QAs for the given `owner`
  \*/
  async \_getUserQAs({ owner }: { owner: User }): Promise\<QADoc\[]> {
  return await this.qas.find({ owner }).toArray();
  }

/\*\*

* \_getUserDrafts (owner: User): (DraftDoc)
*
* **requires** user exists
*
* **effects** returns all drafts for the given `owner`
  \*/
  async \_getUserDrafts({ owner }: { owner: User }): Promise\<DraftDoc\[]> {
  return await this.drafts.find({ owner }).toArray();
  }
  }
