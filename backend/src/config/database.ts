import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/all-india-logistics', {
    });
    console.log('MongoDB connected');

    // This is a one-time fix to remove an old, incorrect index from the database.
    // The index was likely created by a previous version of the schema.
    try {
      const lorryReceiptsCollection = conn.connection.collection('lorryreceipts');
      const indexExists = await lorryReceiptsCollection.indexExists('id_1');
      if (indexExists) {
        await lorryReceiptsCollection.dropIndex('id_1');
        console.log('Successfully dropped legacy index "id_1" from lorryreceipts collection.');
      }
    } catch (indexError) {
        console.error('Could not drop legacy index from lorryreceipts. This might be okay if it was already removed.', indexError);
    }

    try {
      const invoicesCollection = conn.connection.collection('invoices');
      const indexExists = await invoicesCollection.indexExists('id_1');
      if (indexExists) {
        await invoicesCollection.dropIndex('id_1');
        console.log('Successfully dropped legacy index "id_1" from invoices collection.');
      }
    } catch (indexError) {
        console.error('Could not drop legacy index from invoices. This might be okay if it was already removed.', indexError);
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
