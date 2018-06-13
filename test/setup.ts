import * as mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/aigisTest');
  jest.setTimeout(10000);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});
