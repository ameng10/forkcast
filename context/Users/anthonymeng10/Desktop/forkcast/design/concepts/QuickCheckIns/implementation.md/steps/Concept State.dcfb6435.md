---
timestamp: 'Fri Nov 07 2025 01:02:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010216.729be6a7.md]]'
content_id: dcfb6435b1ba73c36189e4fc5f4beffb447b08cc9f93fc653adf12a332871830
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

import { Collection, Db } from "mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "QuickCheckIns" + ".";

// Generic types of this concept (User and ExternalMetricID are IDs, not objects with properties known by this concept)
type User = ID;
type ExternalMetricID = ID; // The ID type for metrics managed externally/globally

// Internal entity types defined by the state of this concept
type CheckIn = ID; // CheckIn is an internal ID managed by this concept

/\*\*

* @state a set of CheckIns with
* an owner User
* an at DateTime
* a metric ExternalMetricID
* a value Number
  \*/
  interface CheckInDocument {
  \_id: CheckIn;
  owner: User;
  at: Date; // Using JavaScript's Date object for DateTime
  metric: ExternalMetricID;
  value: number;
  }

/\*\*

* @state a set of InternalMetrics with
* a name String
* // Note: The \_id of InternalMetrics will be of type ExternalMetricID
  \*/
  interface InternalMetricDocument {
  \_id: ExternalMetricID; // The ID of the metric, which is of the generic type ExternalMetricID
  name: string;
  }

/\*\*

* @concept QuickCheckIns \[User, ExternalMetricID]
* @purpose Record simple self-reports to correlate with recent meals.
* @principle A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.
  \*/
  export default class QuickCheckInsConcept {
  checkIns: Collection<CheckInDocument>;
  internalMetrics: Collection<InternalMetricDocument>;

constructor(private readonly db: Db) {
this.checkIns = this.db.collection(PREFIX + "checkIns");
this.internalMetrics = this.db.collection(PREFIX + "internalMetrics");
}

/\*\*

* @action record
* @param {object} args - The action arguments.
* @param {User} args.owner - The user who owns this check-in.
* @param {Date} args.at - The date and time of the check-in.
* @param {ExternalMetricID} args.metric - The ID of the metric being reported (e.g., energy, mood).
* @param {number} args.value - The numeric value for the metric.
* @returns {Promise<{checkIn: CheckIn} | {error: string}>} The ID of the newly created check-in or an error message.
*
* @requires the InternalMetric 'metric' exists
* @effects create a new CheckIn 'checkIn', set its properties, and return its ID.
  \*/
  async record(
  { owner, at, metric, value }: {
  owner: User;
  at: Date;
  metric: ExternalMetricID;
  value: number;
  },
  ): Promise<{ checkIn: CheckIn } | { error: string }> {
  // Requires: the InternalMetric 'metric' exists
  const existingMetric = await this.internalMetrics.findOne({ \_id: metric });
  if (!existingMetric) {
  return { error: `Metric with ID '${metric}' is not defined.` };
  }

```
// Effects: create a new CheckIn 'checkIn', set its properties, and return its ID.
```

```
const newCheckInId = freshID() as CheckIn;
const result = await this.checkIns.insertOne({
  _id: newCheckInId,
  owner,
  at,
  metric,
  value,
});

if (!result.acknowledged) {
  return { error: "Failed to create check-in." };
}

return { checkIn: newCheckInId };
```

}

/\*\*

* @action defineMetric
* @param {object} args - The action arguments.
* @param {string} args.name - The descriptive name for the new metric.
* @returns {Promise<{metric: ExternalMetricID} | {error: string}>} The ID of the newly defined metric or an error message.
*
* @requires no InternalMetric with 'name' exists
* @effects create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
  \*/
  async defineMetric(
  { name }: { name: string },
  ): Promise<{ metric: ExternalMetricID } | { error: string }> {
  // Requires: no InternalMetric with 'name' exists
  const existingMetric = await this.internalMetrics.findOne({ name: name });
  if (existingMetric) {
  return {
  error:
  `Metric with name '${name}' already exists with ID '${existingMetric._id}'.`,
  };
  }

```
// Effects: create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
```

```
const newMetricId = freshID() as ExternalMetricID;
const result = await this.internalMetrics.insertOne({
  _id: newMetricId,
  name: name,
});

if (!result.acknowledged) {
  return { error: "Failed to define metric." };
}

return { metric: newMetricId };
```

}

/\*\*

* @action edit
* @param {object} args - The action arguments.
* @param {CheckIn} args.checkIn - The ID of the check-in to edit.
* @param {User} args.owner - The user attempting to edit (must be the owner of the check-in).
* @param {ExternalMetricID} \[args.metric] - Optional new metric ID to update.
* @param {number} \[args.value] - Optional new numeric value to update.
* @returns {Promise\<Empty | {error: string}>} An empty object on success or an error message.
*
* @requires the CheckIn 'checkIn' exists, owner of 'checkIn' is 'owner', and if 'metric' is provided, then the InternalMetric 'metric' exists.
* @effects update provided fields (metric and/or value) of 'checkIn'.
  \*/
  async edit(
  { checkIn, owner, metric, value }: {
  checkIn: CheckIn;
  owner: User;
  metric?: ExternalMetricID;
  value?: number;
  },
  ): Promise\<Empty | { error: string }> {
  // Requires: the CheckIn 'checkIn' exists
  const existingCheckIn = await this.checkIns.findOne({ \_id: checkIn });
  if (!existingCheckIn) {
  return { error: `Check-in with ID '${checkIn}' not found.` };
  }

```
// Requires: owner of 'checkIn' is 'owner'
```

```
if (existingCheckIn.owner !== owner) {
  return { error: "You are not the owner of this check-in." };
}

// Requires: if 'metric' is provided, then the InternalMetric 'metric' exists
if (metric !== undefined) {
  const existingMetric = await this.internalMetrics.findOne({
    _id: metric,
  });
  if (!existingMetric) {
    return { error: `New metric with ID '${metric}' is not defined.` };
  }
}

// Effects: update provided fields (metric and/or value) of 'checkIn'.
const updateDoc: Partial<CheckInDocument> = {};
if (metric !== undefined) {
  updateDoc.metric = metric;
}
if (value !== undefined) {
  updateDoc.value = value;
}

if (Object.keys(updateDoc).length === 0) {
  // No fields to update, return success as per spec
  return {};
}

const result = await this.checkIns.updateOne(
  { _id: checkIn },
  { $set: updateDoc },
);

if (!result.acknowledged || result.matchedCount === 0) {
  return { error: "Failed to update check-in." };
}

return {};
```

}

/\*\*

* @action delete
* @param {object} args - The action arguments.
* @param {CheckIn} args.checkIn - The ID of the check-in to delete.
* @param {User} args.owner - The user attempting to delete (must be the owner of the check-in).
* @returns {Promise\<Empty | {error: string}>} An empty object on success or an error message.
*
* @requires the CheckIn 'checkIn' exists and its owner is 'owner'.
* @effects permanently remove the check-in document.
  \*/
  async delete(
  { checkIn, owner }: { checkIn: CheckIn; owner: User },
  ): Promise\<Empty | { error: string }> {
  const existingCheckIn = await this.checkIns.findOne({ \_id: checkIn });
  if (!existingCheckIn) {
  return { error: `Check-in with ID '${checkIn}' not found.` };
  }
  if (existingCheckIn.owner !== owner) {
  return { error: "You are not the owner of this check-in." };
  }

```
const result = await this.checkIns.deleteOne({ _id: checkIn });
```

```
if (result.deletedCount !== 1) {
  return { error: "Failed to delete check-in." };
}
return {};
```

}

// --- Queries (Optional, but good for testing and verifying state) ---

/\*\*

* @query \_getCheckIn
* @param {object} args - The query arguments.
* @param {CheckIn} args.checkIn - The ID of the check-in to retrieve.
* @returns {Promise\<CheckInDocument | null>} A specific check-in document by its ID, or null if not found.
* @effects Returns a specific check-in document by its ID.
  \*/
  async \_getCheckIn(
  { checkIn }: { checkIn: CheckIn },
  ): Promise\<CheckInDocument | null> {
  return await this.checkIns.findOne({ \_id: checkIn });
  }

/\*\*

* @query \_getMetricsByName
* @param {object} args - The query arguments.
* @param {string} args.name - The name of the internal metric to retrieve.
* @returns {Promise\<InternalMetricDocument | null>} An internal metric document by its name, or null if not found.
* @effects Returns an internal metric document by its name.
  \*/
  async \_getMetricsByName(
  { name }: { name: string },
  ): Promise\<InternalMetricDocument | null> {
  return await this.internalMetrics.findOne({ name: name });
  }

/\*\*

* @action deleteMetric
* @param {object} args - The action arguments.
* @param {ExternalMetricID} args.metric - The metric ID to delete.
* @returns {Promise\<Empty | {error: string}>} Empty on success or an error.
*
* @requires metric exists and no CheckIn documents reference it.
* @effects permanently remove the InternalMetric document.
  \*/
  async deleteMetric(
  { metric }: { metric: ExternalMetricID },
  ): Promise\<Empty | { error: string }> {
  // Ensure metric exists
  const existing = await this.internalMetrics.findOne({ \_id: metric });
  if (!existing) {
  return { error: `Metric with ID '${metric}' not found.` };
  }
  // Guard: prevent deletion if in use by any check-in
  const inUse = await this.checkIns.findOne({ metric });
  if (inUse) {
  return {
  error:
  "Cannot delete metric: there are existing check-ins referencing this metric.",
  };
  }
  const res = await this.internalMetrics.deleteOne({ \_id: metric });
  if (res.deletedCount !== 1) {
  return { error: "Failed to delete metric." };
  }
  return {};
  }

/\*\*

* @query \_listCheckInsByOwner
* @param {object} args - The query arguments.
* @param {User} args.owner - The owner whose check-ins are to be listed.
* @returns {Promise\<CheckInDocument\[]>} An array of all check-ins belonging to a specific owner.
* @effects Returns all check-ins belonging to a specific owner.
  \*/
  async \_listCheckInsByOwner(
  { owner }: { owner: User },
  ): Promise\<CheckInDocument\[]> {
  return await this.checkIns.find({ owner }).toArray();
  }
  }
