import { ProviderStore, KlasaClient } from 'klasa';

// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const {
  Provider,
  util: { mergeDefault, mergeObjects, isObject },
} = require('klasa');
const { MongoClient: Mongo } = require('mongodb');

module.exports = class extends Provider {
  constructor(
    client: KlasaClient,
    store: ProviderStore,
    file: string[],
    directory: string
  ) {
    super(client, store, file, directory, {
      description: 'Allows use of MongoDB functionality throughout Klasa',
    });
    this.db = null;
  }

  async init() {
    const connection = mergeDefault(
      {
        host: 'localhost',
        port: 27017,
        db: 'klasa',
        options: {},
      },
      this.client.options.providers.mongodb
    );

    // If full connection string is provided, use that, otherwise fall back to individual parameters
    const connectionString =
      this.client.options.providers.mongodb.connectionString ||
      `mongodb://${connection.user}:${connection.password}@${connection.host}:${
        connection.port
      }/${connection.db}`;

    const mongoClient = await Mongo.connect(
      connectionString,
      mergeObjects(connection.options, { useNewUrlParser: true })
    );

    this.db = mongoClient.db(connection.db);
  }

  /* Table methods */

  get exec() {
    return this.db;
  }

  hasTable(table: string) {
    return this.db
      .listCollections()
      .toArray()
      .then((collections: any[]) =>
        collections.some((col) => col.name === table)
      );
  }

  createTable(table: string) {
    return this.db.createCollection(table);
  }

  deleteTable(table: string) {
    return this.db.dropCollection(table);
  }

  /* Document methods */

  getAll(table: string, filter: any[] = []) {
    if (filter.length)
      return this.db
        .collection(table)
        .find({ id: { $in: filter } }, { _id: 0 })
        .toArray();
    return this.db
      .collection(table)
      .find({}, { _id: 0 })
      .toArray();
  }

  getKeys(table: string) {
    return this.db
      .collection(table)
      .find({}, { id: 1, _id: 0 })
      .toArray();
  }

  get(table: string, id: string) {
    return this.db.collection(table).findOne(resolveQuery(id));
  }

  has(table: string, id: string) {
    return this.get(table, id).then(Boolean);
  }

  getRandom(table: string) {
    return this.db.collection(table).aggregate({ $sample: { size: 1 } });
  }

  create(table: string, id: string, doc = {}) {
    return this.db
      .collection(table)
      .insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
  }

  delete(table: string, id: string) {
    return this.db.collection(table).deleteOne(resolveQuery(id));
  }

  update(table: string, id: string, doc: any) {
    return this.db.collection(table).updateOne(resolveQuery(id), {
      $set: isObject(doc) ? flatten(doc) : parseEngineInput(doc),
    });
  }

  replace(table: string, id: string, doc: any) {
    return this.db
      .collection(table)
      .replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
  }
};

const resolveQuery = (query: any) => (isObject(query) ? query : { id: query });

function flatten(obj: any, path = '') {
  let output = {} as { [key: string]: any };
  for (const [key, value] of Object.entries(obj)) {
    if (isObject(value))
      output = Object.assign(
        output,
        flatten(value, path ? `${path}.${key}` : key)
      );
    else output[path ? `${path}.${key}` : key] = value;
  }
  return output;
}

function parseEngineInput(updated: any[]) {
  return Object.assign(
    {},
    ...updated.map((entry) => ({ [entry.data[0]]: entry.data[1] }))
  );
}
