import * as mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/aigis');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});
