import * as mongoose from 'mongoose';

beforeAll(() => {
  mongoose.connect('mongodb://localhost/aigis');
});

afterAll(() => {
  mongoose.connection.close();
});
