---
timestamp: 'Thu Oct 16 2025 17:58:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_175822.de90d249.md]]'
content_id: 8bdd50744d23c17d241309f936428459401118d13a732a4f7553e8d3b7e33ee2
---

# response:

Here's the concept design for `MealLog` and its corresponding implementation, addressing formatting, modularity, and ensuring the specification aligns with the code.

***

## Concept: MealLog \[User, FoodItem]

**purpose** Capture meals quickly with minimal friction.

**principle** A user records a meal with time, items, and an optional note; meals can be edited or deleted. This concept stores facts only.

**state**

* A set of Meals with:
  * owner: User
  * at: Time
  * items: Set(FoodItem)
  * notes: String (optional)
  * status: {active, deleted}

**actions**

* `submit(owner: User, at: Time, items: Set(FoodItem), notes?: String): (meal: Meal)`
  * **requires:** owner exists and items is nonempty
  * **effects:** create an active meal and return it
* `edit(caller: User, meal: Meal, items?: Set(FoodItem), notes?: String)`
  * **requires:** meal exists in this log, caller is the owner of the meal, and meal status is active
  * **effects:** update provided fields
* `delete(caller: User, meal: Meal)`
  * **requires:** meal exists in this log, caller is the owner of the meal, and meal status is active
  * **effects:** set meal status = deleted

***

## Code Implementation

```python
import datetime
from enum import Enum, auto
from typing import TypeVar, Generic, Set, Optional, List, Dict
import uuid

# Define generic types for User and FoodItem
U = TypeVar('U')  # Represents a generic User type
F = TypeVar('F')  # Represents a generic FoodItem type

# --- State Modeling Language ---

class MealStatus(Enum):
    """
    Represents the possible states of a meal entry.
    """
    ACTIVE = auto()
    DELETED = auto()

class Meal(Generic[U, F]):
    """
    Represents a single meal entry within the MealLog concept.
    """
    meal_id: uuid.UUID
    owner: U
    at: datetime.datetime
    items: Set[F]
    notes: Optional[str]
    status: MealStatus

    def __init__(self, owner: U, at: datetime.datetime, items: Set[F], notes: Optional[str] = None):
        """
        Initializes a new active meal.
        Raises ValueError if items is empty.
        """
        if not items:
            raise ValueError("A meal must contain at least one food item.")

        self.meal_id = uuid.uuid4()
        self.owner = owner
        self.at = at
        self.items = items
        self.notes = notes
        self.status = MealStatus.ACTIVE

    def __repr__(self) -> str:
        """Provides a string representation for debugging."""
        return (f"Meal(ID={self.meal_id!s:.8s}..., Owner={self.owner}, "
                f"Time={self.at.isoformat()}, Status={self.status.name})")

# --- Concept Implementation ---

class MealLog(Generic[U, F]):
    """
    Concept: MealLog [User, FoodItem]

    Purpose: Capture meals quickly with minimal friction.

    Principle: A user records a meal with time, items, and an optional note;
               meals can be edited or deleted. This concept stores facts only.

    This concept maintains a collection of Meal objects, allowing for submission,
    editing, and deletion of meals while adhering to defined requirements.
    """
    _meals: Dict[uuid.UUID, Meal[U, F]] # Stores meals, keyed by their unique ID

    def __init__(self):
        """
        Initializes an empty MealLog.
        """
        self._meals = {}

    def _get_meal_by_id(self, meal_id: uuid.UUID) -> Optional[Meal[U, F]]:
        """
        Helper method to retrieve a meal from the internal storage by its ID.
        """
        return self._meals.get(meal_id)

    # --- Actions ---

    def submit(self, owner: U, at: datetime.datetime, items: Set[F], notes: Optional[str] = None) -> Meal[U, F]:
        """
        Action: submit
        Purpose: Records a new meal entry.

        Requires:
        - `owner` exists (is not None).
        - `items` is nonempty.

        Effects:
        - Creates a new `Meal` instance with status `ACTIVE`.
        - Adds the new meal to the log.
        - Returns the newly created `Meal` object.

        Raises:
        - ValueError: If `owner` is None or `items` is empty.
        """
        # Requirements check
        if owner is None:
            raise ValueError("Owner cannot be None.")
        if not items:
            raise ValueError("Items set cannot be empty.")

        # Effects
        new_meal = Meal(owner=owner, at=at, items=items, notes=notes)
        self._meals[new_meal.meal_id] = new_meal
        return new_meal

    def edit(self, caller: U, meal: Meal[U, F], items: Optional[Set[F]] = None, notes: Optional[str] = None):
        """
        Action: edit
        Purpose: Modifies an existing meal entry.

        Requires:
        - `meal` exists in this log (identified by its ID).
        - `caller` is the owner of the `meal`.
        - `meal` status is `ACTIVE`.
        - If `items` is provided, it must be nonempty.

        Effects:
        - Updates the `items` and/or `notes` fields of the `meal` if provided.

        Raises:
        - ValueError: If the meal does not exist, is not active, or updated items are empty.
        - PermissionError: If `caller` is not the owner of the meal.
        """
        # Requirements check
        tracked_meal = self._get_meal_by_id(meal.meal_id)
        if tracked_meal is None:
            raise ValueError(f"Meal with ID {meal.meal_id} does not exist in this log.")
        if tracked_meal.owner != caller: # Assumes generic User objects support equality comparison
            raise PermissionError("Caller is not the owner of this meal.")
        if tracked_meal.status != MealStatus.ACTIVE:
            raise ValueError("Cannot edit a meal that is not active or has been deleted.")

        # Effects
        if items is not None:
            if not items:
                raise ValueError("Items set cannot be empty when updating.")
            tracked_meal.items = items
        if notes is not None:
            tracked_meal.notes = notes

    def delete(self, caller: U, meal: Meal[U, F]):
        """
        Action: delete
        Purpose: Marks a meal entry as deleted.

        Requires:
        - `meal` exists in this log (identified by its ID).
        - `caller` is the owner of the `meal`.
        - `meal` status is `ACTIVE`.

        Effects:
        - Sets the `status` of the `meal` to `DELETED`.

        Raises:
        - ValueError: If the meal does not exist or is not active.
        - PermissionError: If `caller` is not the owner of the meal.
        """
        # Requirements check
        tracked_meal = self._get_meal_by_id(meal.meal_id)
        if tracked_meal is None:
            raise ValueError(f"Meal with ID {meal.meal_id} does not exist in this log.")
        if tracked_meal.owner != caller: # Assumes generic User objects support equality comparison
            raise PermissionError("Caller is not the owner of this meal.")
        if tracked_meal.status != MealStatus.ACTIVE:
            raise ValueError("Cannot delete a meal that is not active.")

        # Effects
        tracked_meal.status = MealStatus.DELETED

    # --- Utility Methods (not formal actions, but helpful for concept interaction) ---

    def get_meals_for_owner(self, owner: U, include_deleted: bool = False) -> List[Meal[U, F]]:
        """
        Retrieves meals associated with a specific owner.
        Args:
            owner: The user whose meals are to be retrieved.
            include_deleted: If True, includes meals marked as deleted.
        Returns:
            A list of Meal objects owned by the specified user.
        """
        return [
            meal for meal in self._meals.values()
            if meal.owner == owner and (include_deleted or meal.status == MealStatus.ACTIVE)
        ]

    def get_meal_by_id(self, meal_id: uuid.UUID) -> Optional[Meal[U, F]]:
        """
        Retrieves a meal by its unique ID.
        Returns None if no meal with the given ID is found.
        """
        return self._get_meal_by_id(meal_id)

```
