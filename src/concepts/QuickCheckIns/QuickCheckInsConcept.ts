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

/**
 * @state a set of CheckIns with
 *   an owner User
 *   an at DateTime
 *   a metric ExternalMetricID
 *   a value Number
 */
interface CheckInDocument {
  _id: CheckIn;
  owner: User;
  at: Date; // Using JavaScript's Date object for DateTime
  metric: ExternalMetricID;
  value: number;
}

/**
 * @state a set of InternalMetrics with
 *   a name String
 * // Note: The _id of InternalMetrics will be of type ExternalMetricID
 */
interface InternalMetricDocument {
  _id: ExternalMetricID; // The ID of the metric, which is of the generic type ExternalMetricID
  name: string;
}

/**
 * @concept QuickCheckIns [User, ExternalMetricID]
 * @purpose Record simple self-reports to correlate with recent meals.
 * @principle A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.
 */
export default class QuickCheckInsConcept {
  checkIns: Collection<CheckInDocument>;
  internalMetrics: Collection<InternalMetricDocument>;

  constructor(private readonly db: Db) {
    this.checkIns = this.db.collection(PREFIX + "checkIns");
    this.internalMetrics = this.db.collection(PREFIX + "internalMetrics");
  }

  /**
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
   */
  async record(
    { owner, at, metric, value }: {
      owner: User;
      at: Date;
      metric: ExternalMetricID;
      value: number;
    },
  ): Promise<{ checkIn: CheckIn } | { error: string }> {
    // Requires: the InternalMetric 'metric' exists
    const existingMetric = await this.internalMetrics.findOne({ _id: metric });
    if (!existingMetric) {
      return { error: `Metric with ID '${metric}' is not defined.` };
    }

    // Effects: create a new CheckIn 'checkIn', set its properties, and return its ID.
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
  }

  /**
   * @action defineMetric
   * @param {object} args - The action arguments.
   * @param {string} args.name - The descriptive name for the new metric.
   * @returns {Promise<{metric: ExternalMetricID} | {error: string}>} The ID of the newly defined metric or an error message.
   *
   * @requires no InternalMetric with 'name' exists
   * @effects create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
   */
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

    // Effects: create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
    const newMetricId = freshID() as ExternalMetricID;
    const result = await this.internalMetrics.insertOne({
      _id: newMetricId,
      name: name,
    });

    if (!result.acknowledged) {
      return { error: "Failed to define metric." };
    }

    return { metric: newMetricId };
  }

  /**
   * @action edit
   * @param {object} args - The action arguments.
   * @param {CheckIn} args.checkIn - The ID of the check-in to edit.
   * @param {User} args.owner - The user attempting to edit (must be the owner of the check-in).
   * @param {ExternalMetricID} [args.metric] - Optional new metric ID to update.
   * @param {number} [args.value] - Optional new numeric value to update.
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error message.
   *
   * @requires the CheckIn 'checkIn' exists, owner of 'checkIn' is 'owner', and if 'metric' is provided, then the InternalMetric 'metric' exists.
   * @effects update provided fields (metric and/or value) of 'checkIn'.
   */
  async edit(
    { checkIn, owner, metric, value }: {
      checkIn: CheckIn;
      owner: User;
      metric?: ExternalMetricID;
      value?: number;
    },
  ): Promise<Empty | { error: string }> {
    // Requires: the CheckIn 'checkIn' exists
    const existingCheckIn = await this.checkIns.findOne({ _id: checkIn });
    if (!existingCheckIn) {
      return { error: `Check-in with ID '${checkIn}' not found.` };
    }

    // Requires: owner of 'checkIn' is 'owner'
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
  }

  /**
   * @action delete
   * @param {object} args - The action arguments.
   * @param {CheckIn} args.checkIn - The ID of the check-in to delete.
   * @param {User} args.owner - The user attempting to delete (must be the owner of the check-in).
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error message.
   *
   * @requires the CheckIn 'checkIn' exists and its owner is 'owner'.
   * @effects permanently remove the check-in document.
   */
  async delete(
    { checkIn, owner }: { checkIn: CheckIn; owner: User },
  ): Promise<Empty | { error: string }> {
    const existingCheckIn = await this.checkIns.findOne({ _id: checkIn });
    if (!existingCheckIn) {
      return { error: `Check-in with ID '${checkIn}' not found.` };
    }
    if (existingCheckIn.owner !== owner) {
      return { error: "You are not the owner of this check-in." };
    }

    const result = await this.checkIns.deleteOne({ _id: checkIn });
    if (result.deletedCount !== 1) {
      return { error: "Failed to delete check-in." };
    }
    return {};
  }

  // --- Queries (Optional, but good for testing and verifying state) ---

  /**
   * @query _getCheckIn
   * @param {object} args - The query arguments.
   * @param {CheckIn} args.checkIn - The ID of the check-in to retrieve.
   * @returns {Promise<CheckInDocument | null>} A specific check-in document by its ID, or null if not found.
   * @effects Returns a specific check-in document by its ID.
   */
  async _getCheckIn(
    { checkIn }: { checkIn: CheckIn },
  ): Promise<CheckInDocument | null> {
    return await this.checkIns.findOne({ _id: checkIn });
  }

  /**
   * @query _getMetricsByName
   * @param {object} args - The query arguments.
   * @param {string} args.name - The name of the internal metric to retrieve.
   * @returns {Promise<InternalMetricDocument | null>} An internal metric document by its name, or null if not found.
   * @effects Returns an internal metric document by its name.
   */
  async _getMetricsByName(
    { name }: { name: string },
  ): Promise<InternalMetricDocument | null> {
    return await this.internalMetrics.findOne({ name: name });
  }

  /**
   * @action deleteMetric
   * @param {object} args - The action arguments.
   * @param {ExternalMetricID} args.metric - The metric ID to delete.
   * @returns {Promise<Empty | {error: string}>} Empty on success or an error.
   *
   * @requires metric exists and no CheckIn documents reference it.
   * @effects permanently remove the InternalMetric document.
   */
  async deleteMetric(
    { metric }: { metric: ExternalMetricID },
  ): Promise<Empty | { error: string }> {
    // Ensure metric exists
    const existing = await this.internalMetrics.findOne({ _id: metric });
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
    const res = await this.internalMetrics.deleteOne({ _id: metric });
    if (res.deletedCount !== 1) {
      return { error: "Failed to delete metric." };
    }
    return {};
  }

  /**
   * @query _listCheckInsByOwner
   * @param {object} args - The query arguments.
   * @param {User} args.owner - The owner whose check-ins are to be listed.
   * @returns {Promise<CheckInDocument[]>} An array of all check-ins belonging to a specific owner.
   * @effects Returns all check-ins belonging to a specific owner.
   */
  async _listCheckInsByOwner(
    { owner }: { owner: User },
  ): Promise<CheckInDocument[]> {
    return await this.checkIns.find({ owner }).toArray();
  }
}
