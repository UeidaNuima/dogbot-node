import * as mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/aigisTest');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});
