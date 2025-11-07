---
timestamp: 'Fri Nov 07 2025 00:50:48 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_005048.6f4b2ed6.md]]'
content_id: 9693eee801914db8adcfdb4cc14c2b124edc743c76509b268a43634dd74149dc
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

// --- Required Imports ---
import { Collection, Document, MongoClient, WithId } from "mongodb"; // MongoDB driver
import { Empty, ID } from "@utils/types.ts";

// Minimal database interface used when instantiated with a Db from the server
interface MinimalDb {
collection<T extends Document = Document>(name: string): Collection<T>;
databaseName?: string;
name?: string;
}

// --- Generic Type Definitions ---
// These interfaces define the minimal structure required for generic User and FoodItem types.
// In a real application, these would be richer interfaces or classes managed by other concepts.
// We assume User has a unique 'id' for comparison purposes.
type UserId = ID;

interface User {
id: UserId;
// Add other relevant user properties here, e.g., name: string;
}

// For FoodItem, we assume it's an object with an ID and perhaps other properties
// that we want to embed directly into the meal document for a denormalized collection.
interface FoodItem {
id: string; // Unique ID for the food item (e.g., from a central food database)
name: string; // The display name of the food item
// You can add more properties here if they are part of the FoodItem concept,
// e.g., calories: number, category: string, etc.
}

// --- State Modeling Language Enums and Errors ---

export enum MealStatus {
ACTIVE = "active",
DELETED = "deleted",
}

/\*\*

* Custom Error class for permission-related failures.
  \*/
  export class PermissionError extends Error {
  constructor(message: string) {
  super(message);
  this.name = "PermissionError";
  }
  }

// --- MongoDB Document Structure ---
// This interface defines how a Meal document is stored in MongoDB.
// It uses `ownerId` to reference a User, and embeds `FoodItem` objects directly.
export interface MealDocument {
\_id: string; // MongoDB's unique ID for the meal, typically a UUID generated by the app.
ownerId: UserId; // The ID of the user who owns this meal.
at: Date; // The date and time the meal was consumed.
items: FoodItem\[]; // An array of embedded FoodItem objects.
notes?: string; // Optional notes for the meal.
status: MealStatus; // The current status of the meal (active/deleted).
}

// --- Meal Class (In-memory representation of a Meal) ---
/\*\*

* Represents a single meal entry within the MealLog concept.
* It is generic over the User and FoodItem types, hydrating `ownerId` into a `User` object.
  \*/
  class Meal\<U extends User, F extends FoodItem> {
  public readonly id: string; // Unique identifier for the meal (UUID)
  public readonly owner: U;
  public at: Date;
  public items: F\[];
  public notes?: string;
  public status: MealStatus;

/\*\*

* Private constructor to enforce creation via static factory methods
* (e.g., `createNewMeal`) or controlled instantiation (e.g., `fromDocument`).
  \*/
  private constructor(
  id: string,
  owner: U,
  at: Date,
  items: F\[],
  status: MealStatus,
  notes?: string,
  ) {
  this.id = id;
  this.owner = owner;
  this.at = at;
  this.items = items;
  this.notes = notes;
  this.status = status;
  }

/\*\*

* Factory method for creating a new Meal based on concept's `submit` action parameters.
* This handles initial status and ID generation.
* @param owner The user who owns this meal.
* @param at The date and time the meal was consumed.
* @param items An array of food items included in the meal.
* @param notes Optional notes for the meal.
* @returns A new `Meal` instance.
* @throws Error if owner is invalid or items is empty.
  \*/
  public static createNewMeal\<U extends User, F extends FoodItem>(
  owner: U,
  at: Date,
  items: F\[],
  notes?: string,
  ): Meal\<U, F> {
  if (!owner || !owner.id) {
  throw new Error(
  "Meal owner cannot be undefined or null and must have an ID.",
  );
  }
  if (!items || items.length === 0) {
  throw new Error("A meal must contain at least one food item.");
  }
  // Generate a unique ID for the meal (e.g., using Node.js's crypto module or a UUID library).
  const newMealId = crypto.randomUUID();
  return new Meal(newMealId, owner, at, items, MealStatus.ACTIVE, notes);
  }

/\*\*

* Factory method for hydrating a Meal object from a MongoDB document.
* @param doc The MongoDB document to convert.
* @param owner The hydrated User object corresponding to `doc.ownerId`.
* @returns A `Meal` instance.
  \*/
  public static fromDocument\<U extends User, F extends FoodItem>(
  doc: WithId<MealDocument>,
  owner: U,
  ): Meal\<U, F> {
  return new Meal(
  doc.\_id,
  owner,
  doc.at,
  doc.items as F\[], // Type assertion for generic FoodItem
  doc.status,
  doc.notes,
  );
  }

/\*\*

* Converts the current Meal object into a MongoDB document structure for storage.
* @returns A `MealDocument` representation of the meal.
  \*/
  public toDocument(): MealDocument {
  return {
  \_id: this.id,
  ownerId: this.owner.id,
  at: this.at,
  items: this.items,
  notes: this.notes,
  status: this.status,
  };
  }

/\*\*

* Provides a string representation for debugging and logging.
  \*/
  public toString(): string {
  return (
  `Meal(ID=${this.id.substring(0, 8)}..., OwnerID=${this.owner.id}, ` +
  `Time=${this.at.toISOString()}, Status=${this.status})`
  );
  }
  }

// --- MealLog Concept Implementation ---
/\*\*

* Concept: MealLog \[User, FoodItem]
*
* Purpose: Capture meals quickly with minimal friction.
*
* Principle: A user records a meal with time, items, and an optional note;
* ```
         meals can be edited or deleted. This concept stores facts only.
  ```
*
* This class implements the MealLog concept, managing a collection of Meal objects
* persisted in MongoDB. It ensures that actions adhere to the defined requirements and effects.
  \*/
  export class MealLogConcept\<U extends User, F extends FoodItem> {
  private dbClient?: MongoClient;
  private dbFromServer?: MinimalDb;
  private ownsClient = false;
  private dbName: string;
  private mealsCollection?: Collection<MealDocument>;
  // A resolver function to fetch a full User object given a UserId.
  // This maintains the independence of the MealLog concept from the User concept's implementation.
  private userResolver: (userId: UserId) => Promise\<U | undefined>;

/\*\*

* Initializes the MealLog concept.
* @param mongoUri The MongoDB connection URI (e.g., "mongodb://localhost:27017").
* @param dbName The name of the database to use.
* @param userResolver An asynchronous function to retrieve a User object by its ID.
  \*/
  // Overload 1: Standard constructor used in tests (client or URI string)
  constructor(
  mongo: string | MongoClient,
  dbName: string,
  userResolver: (userId: UserId) => Promise\<U | undefined>,
  );
  // Overload 2: Adapter constructor used by concept\_server (Db only)
  constructor(db: MinimalDb);
  // Implementation
  constructor(
  mongoOrDb: string | MongoClient | MinimalDb,
  dbName?: string,
  userResolver?: (userId: UserId) => Promise\<U | undefined>,
  ) {
  if (typeof mongoOrDb === "string") {
  this.dbClient = new MongoClient(mongoOrDb);
  this.ownsClient = true;
  this.dbName = dbName!;
  } else if (mongoOrDb instanceof MongoClient) {
  this.dbClient = mongoOrDb;
  this.dbName = dbName!;
  } else {
  // Received a Db from the concept server
  this.dbFromServer = mongoOrDb;
  this.dbName = mongoOrDb.databaseName ?? mongoOrDb.name ?? "";
  }

```
// If no resolver provided (server path), use a permissive default that hydrates minimal user shape
```

```
this.userResolver = userResolver ??
  ((userId: UserId) => Promise.resolve({ id: userId } as unknown as U));
```

}

/\*\*

* Establishes the connection to MongoDB and sets up the collection.
* Must be called before any other database operations.
  \*/
  public async connect(): Promise<Empty> {
  if (this.dbFromServer) {
  // Server provided Db; treat as already connected
  this.mealsCollection = this.dbFromServer.collection<MealDocument>(
  "Meals",
  );
  return {};
  }
  if (this.dbClient) {
  if (this.ownsClient) {
  await this.dbClient.connect();
  }
  this.mealsCollection = this.dbClient.db(this.dbName).collection<
  MealDocument
  > ("Meals");
  > } else {
  > throw new Error("No database available to connect.");
  > }
  > return {};
  > }

/\*\*

* Closes the MongoDB connection.
  \*/
  public async disconnect(): Promise<Empty> {
  if (this.dbFromServer) {
  // Do not close external server-managed connections
  this.mealsCollection = undefined;
  return {};
  }
  if (this.dbClient && this.ownsClient) {
  await this.dbClient.close();
  }
  this.mealsCollection = undefined;
  return {};
  }

\#collection(): Collection<MealDocument> {
// Lazily initialize when provided a Db directly (server-managed)
if (!this.mealsCollection && this.dbFromServer) {
this.mealsCollection = this.dbFromServer.collection<MealDocument>(
"Meals",
);
}
if (!this.mealsCollection) {
throw new Error("MealLogConcept is not connected. Call connect() first.");
}
return this.mealsCollection;
}

// Exposed for API: return a JSON-friendly description, not the raw collection object
public getCollection(): { name: string } {
const col = this.#collection();
// @ts-ignore - driver provides 'collectionName'
const name =
(col as unknown as { collectionName?: string }).collectionName ?? "Meals";
return { name };
}

/\*\*

* Internal helper to retrieve a raw Meal document from MongoDB by its ID.
* @param mealId The unique ID of the meal.
* @returns The MongoDB document if found, otherwise null.
  \*/
  // Overloads: support API-style object or positional string
  async #getMealDocumentById(
  mealId: string,
  ): Promise\<WithId<MealDocument> | null>;
  async #getMealDocumentById(
  args: { mealId: string },
  ): Promise\<WithId<MealDocument> | null>;
  async #getMealDocumentById(
  mealIdOrArgs: string | { mealId: string },
  ): Promise\<WithId<MealDocument> | null> {
  const mealId = typeof mealIdOrArgs === "string"
  ? mealIdOrArgs
  : mealIdOrArgs.mealId;
  const collection = this.#collection();
  const result = await collection.findOne({ \_id: mealId });
  return result;
  }

/\*\*

* Internal helper to retrieve a fully hydrated `Meal` object from MongoDB by its ID.
* This involves fetching the document and then resolving the `User` object.
* @param mealId The unique ID of the meal.
* @returns The `Meal` object if found and owner resolved, otherwise undefined.
  \*/
  async #getMealObjectById(
  mealId: string,
  ): Promise\<Meal\<U, F> | undefined>;
  async #getMealObjectById(
  args: { mealId: string },
  ): Promise\<Meal\<U, F> | undefined>;
  async #getMealObjectById(
  mealIdOrArgs: string | { mealId: string },
  ): Promise\<Meal\<U, F> | undefined> {
  const mealId = typeof mealIdOrArgs === "string"
  ? mealIdOrArgs
  : mealIdOrArgs.mealId;
  const doc = await this.#getMealDocumentById(mealId);
  if (!doc) return undefined;

```
const owner = await this.userResolver(doc.ownerId);
```

```
if (!owner) {
  // Data inconsistency: ownerId in meal document refers to a non-existent user.
  console.error(
    `Owner with ID ${doc.ownerId} not found for meal ${mealId}. Skipping hydration.`,
  );
  return undefined;
}
return Meal.fromDocument(doc, owner);
```

}

// --- Actions ---

/\*\*

* Action: submit
* Purpose: Records a new meal entry.
*
* @param owner The user submitting the meal.
* @param at The time the meal was consumed.
* @param items An array of food items in the meal.
* @param notes Optional notes for the meal.
* @returns The newly created `Meal` object.
*
* Requires:
* * `owner` is a valid `User` object (not undefined/null, has an `id`).
* * `items` is nonempty.
*
* Effects:
* * Creates a new `Meal` instance with status `ACTIVE`.
* * Inserts the new meal's document into the MongoDB `Meals` collection.
*
* Throws:
* * Error: If `owner` is invalid or `items` is empty.
    \*/
    // Overloads: positional (tests) and object (API)
    public async submit(
    owner: U,
    at: Date,
    items: F\[],
    notes?: string,
    ): Promise\<Meal\<U, F>>;
    public async submit(
    args: {
    owner?: U;
    ownerId?: UserId;
    at: Date | string;
    items: F\[];
    notes?: string;
    },
    ): Promise\<Meal\<U, F>>;
    public async submit(
    ownerOrArgs: U | {
    owner?: U;
    ownerId?: UserId;
    at: Date | string;
    items: F\[];
    notes?: string;
    },
    at?: Date,
    items?: F\[],
    notes?: string,
    ): Promise\<Meal\<U, F>> {
    let owner: U;
    let atDate: Date;
    let theItems: F\[];
    let theNotes: string | undefined;

```
if (
```

```
  typeof ownerOrArgs === "object" && "items" in ownerOrArgs &&
  (at === undefined)
) {
  const args = ownerOrArgs as {
    owner?: U;
    ownerId?: UserId;
    at: Date | string;
    items: F[];
    notes?: string;
  };
  owner = args.owner ?? (await this.userResolver(args.ownerId as UserId))!;
  atDate = args.at instanceof Date ? args.at : new Date(args.at);
  theItems = args.items;
  theNotes = args.notes;
} else {
  owner = ownerOrArgs as U;
  atDate = at as Date;
  theItems = items as F[];
  theNotes = notes;
}

const newMeal = Meal.createNewMeal(owner, atDate, theItems, theNotes);
const mealDoc = newMeal.toDocument();
const collection = this.#collection();
await collection.insertOne(mealDoc);
return newMeal;
```

}

/\*\*

* Action: edit
* Purpose: Modifies an existing meal entry.
*
* @param caller The user attempting to edit the meal.
* @param mealId The unique ID of the meal to be edited.
* @param items Optional new array of food items.
* @param notes Optional new notes string.
* @returns A Promise that resolves when the meal is successfully edited.
*
* Requires:
* * `mealId` refers to an existing `Meal` document.
* * `caller` is the owner of the `meal` (compared by `id`).
* * `meal` status is `ACTIVE`.
* * If `items` is provided, it must be nonempty.
*
* Effects:
* * Updates the `items` and/or `notes` fields of the `Meal` document in MongoDB.
*
* Throws:
* * Error: If the meal does not exist, is not active, or updated items are empty.
* * PermissionError: If `caller` is not the owner of the meal.
    \*/
    public async edit(
    caller: U,
    mealId: string,
    items?: F\[],
    notes?: string,
    ): Promise<void>;
    public async edit(
    args: {
    caller?: U;
    callerId?: UserId;
    mealId: string;
    items?: F\[];
    notes?: string;
    at?: Date | string;
    },
    ): Promise\<Empty | { error: string }>;
    public async edit(
    callerOrArgs: U | {
    caller?: U;
    callerId?: UserId;
    mealId: string;
    items?: F\[];
    notes?: string;
    at?: Date | string;
    },
    mealId?: string,
    items?: F\[],
    notes?: string,
    ): Promise\<void | (Empty | { error: string })> {
    let caller: U;
    let id: string;
    let newItems: F\[] | undefined = items;
    let newNotes: string | undefined = notes;
    const isObjectForm = typeof callerOrArgs === "object" &&
    mealId === undefined;
    let newAt: Date | undefined;

```
if (isObjectForm) {
```

```
  const args = callerOrArgs as {
    caller?: U;
    callerId?: UserId;
    mealId: string;
    items?: F[];
    notes?: string;
    at?: Date | string;
  };
  caller = args.caller ??
    (await this.userResolver(args.callerId as UserId))!;
  id = args.mealId;
  newItems = args.items;
  newNotes = args.notes;
  if (args.at !== undefined) {
    const parsed = args.at instanceof Date ? args.at : new Date(args.at);
    if (isNaN(parsed.getTime())) {
      return { error: "Invalid 'at' timestamp. Use ISO-8601 or Date." };
    }
    newAt = parsed;
  }
} else {
  caller = callerOrArgs as U;
  id = mealId as string;
}
// Requirements check
const collection = this.#collection();
const mealDoc = await this.#getMealDocumentById(id);
if (!mealDoc) {
  if (isObjectForm) {
    return { error: `Meal with ID '${id}' does not exist.` };
  }
  throw new Error(`Meal with ID '${id}' does not exist.`);
}
// Compare users by their unique ID
if (mealDoc.ownerId !== caller.id) {
  if (isObjectForm) {
    return { error: "Caller is not the owner of this meal." };
  }
  throw new PermissionError("Caller is not the owner of this meal.");
}
if (mealDoc.status !== MealStatus.ACTIVE) {
  const msg =
    `Cannot edit a meal that is not active. Current status: ${mealDoc.status}`;
  if (isObjectForm) return { error: msg };
  throw new Error(msg);
}
if (newItems !== undefined && newItems.length === 0) {
  const msg = "Items array cannot be empty when updating.";
  if (isObjectForm) return { error: msg };
  throw new Error(msg);
}

// Effects
const updateFields: Partial<MealDocument> = {};
if (newItems !== undefined) {
  updateFields.items = newItems;
}
if (newNotes !== undefined) {
  updateFields.notes = newNotes;
}
if (newAt !== undefined) {
  updateFields.at = newAt;
}

if (Object.keys(updateFields).length > 0) {
  await collection.updateOne(
    { _id: id },
    { $set: updateFields },
  );
}
if (isObjectForm) return {};
```

}

/\*\*

* Action: delete
* Purpose: Marks a meal entry as deleted.
*
* @param caller The user attempting to delete the meal.
* @param mealId The unique ID of the meal to be deleted.
* @returns A Promise that resolves when the meal status is successfully updated.
*
* Requires:
* * `mealId` refers to an existing `Meal` document.
* * `caller` is the owner of the `meal` (compared by `id`).
* * `meal` status is `ACTIVE`.
*
* Effects:
* * Sets the `status` of the `Meal` document to `DELETED` in MongoDB.
*
* Throws:
* * Error: If the meal does not exist or is not active.
* * PermissionError: If `caller` is not the owner of the meal.
    \*/
    public async delete(caller: U, mealId: string): Promise<void>;
    public async delete(
    args: { caller?: U; callerId?: UserId; mealId: string },
    ): Promise\<Empty | { error: string }>;
    public async delete(
    callerOrArgs: U | { caller?: U; callerId?: UserId; mealId: string },
    mealId?: string,
    ): Promise\<void | (Empty | { error: string })> {
    let caller: U;
    let id: string;
    const isObjectForm = typeof callerOrArgs === "object" &&
    mealId === undefined;
    if (isObjectForm) {
    const args = callerOrArgs as {
    caller?: U;
    callerId?: UserId;
    mealId: string;
    };
    caller = args.caller ??
    (await this.userResolver(args.callerId as UserId))!;
    id = args.mealId;
    } else {
    caller = callerOrArgs as U;
    id = mealId as string;
    }
    // Requirements check
    const collection = this.#collection();
    const mealDoc = await this.#getMealDocumentById(id);
    if (!mealDoc) {
    if (isObjectForm) {
    return { error: `Meal with ID '${id}' does not exist.` };
    }
    throw new Error(`Meal with ID '${id}' does not exist.`);
    }
    // Compare users by their unique ID
    if (mealDoc.ownerId !== caller.id) {
    if (isObjectForm) {
    return { error: "Caller is not the owner of this meal." };
    }
    throw new PermissionError("Caller is not the owner of this meal.");
    }
    if (mealDoc.status !== MealStatus.ACTIVE) {
    const msg =
    `Cannot delete a meal that is not active. Current status: ${mealDoc.status}`;
    if (isObjectForm) return { error: msg };
    throw new Error(msg);
    }

```
// Effects
```

```
await collection.updateOne(
  { _id: id },
  { $set: { status: MealStatus.DELETED } },
);
if (isObjectForm) return {};
```

}

// --- Utility Methods (not formal actions, but helpful for concept interaction) ---

/\*\*

* Retrieves meals associated with a specific owner.
* @param ownerId The ID of the user whose meals are to be retrieved.
* @param includeDeleted If true, includes meals marked as deleted; otherwise, only active meals.
* @returns A Promise that resolves to an array of Meal objects owned by the specified user.
  \*/
  public async getMealsForOwner(
  ownerId: UserId,
  includeDeleted?: boolean,
  ): Promise\<Meal\<U, F>\[]>;
  public async getMealsForOwner(
  args: { ownerId: UserId; includeDeleted?: boolean },
  ): Promise\<Meal\<U, F>\[]>;
  public async getMealsForOwner(
  ownerOrArgs: UserId | { ownerId: UserId; includeDeleted?: boolean },
  includeDeleted: boolean = false,
  ): Promise\<Meal\<U, F>\[]> {
  const ownerId = typeof ownerOrArgs === "string"
  ? ownerOrArgs
  : ownerOrArgs.ownerId;
  includeDeleted = typeof ownerOrArgs === "string"
  ? includeDeleted
  : (ownerOrArgs.includeDeleted ?? false);
  const query: Document = { ownerId: ownerId };
  if (!includeDeleted) {
  query.status = MealStatus.ACTIVE;
  }

```
const collection = this.#collection();
```

```
const mealDocs = await collection.find(query).toArray();
const meals: Meal<U, F>[] = [];

// For each meal document, try to resolve the owner and construct the Meal object
for (const doc of mealDocs) {
  const owner = await this.userResolver(doc.ownerId);
  if (owner) {
    meals.push(Meal.fromDocument(doc, owner));
  } else {
    console.warn(
      `Owner with ID ${doc.ownerId} not found for meal ${doc._id}. Skipping meal.`,
    );
  }
}
return meals;
```

}

/\*\*

* Retrieves a meal by its unique ID.
* @param mealId The unique ID of the meal to retrieve.
* @param callerId Optional. If provided, enforces that the caller is the owner of the meal.
* ```
              This helps restrict read access to user's own logs.
  ```
* @returns A Promise that resolves to the Meal object if found, otherwise undefined.
* @throws PermissionError if `callerId` is provided and does not match the meal's owner.
  \*/
  public async getMealById(
  mealId: string,
  callerId?: UserId,
  ): Promise\<Meal\<U, F> | undefined>;
  public async getMealById(
  args: { mealId: string; callerId?: UserId },
  ): Promise\<Meal\<U, F> | { error: string } | undefined>;
  public async getMealById(
  mealOrArgs: string | { mealId: string; callerId?: UserId },
  callerId?: UserId,
  ): Promise\<Meal\<U, F> | { error: string } | undefined> {
  const mealId = typeof mealOrArgs === "string"
  ? mealOrArgs
  : mealOrArgs.mealId;
  callerId = typeof mealOrArgs === "string" ? callerId : mealOrArgs.callerId;
  const meal = await this.#getMealObjectById(mealId);
  if (meal && callerId && meal.owner.id !== callerId) {
  // If a callerId is provided, and it doesn't match the owner, deny access.
  // This implements the implied "only the user will be able to access their own meal logs" for read operations.
  if (typeof mealOrArgs === "string") {
  throw new PermissionError(
  "Caller is not authorized to view this meal.",
  );
  } else {
  return { error: "Caller is not authorized to view this meal." };
  }
  }
  return meal;
  }
  }

// Export for test usage
export default MealLogConcept;
