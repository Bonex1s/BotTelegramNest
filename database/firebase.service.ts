import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    const serviceAccount = JSON.parse(
      fs.readFileSync('database/AccountKey.json', 'utf8'),
    );
    if (typeof serviceAccount !== 'object') {
      throw new Error('Service account is not an object');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    this.db = admin.firestore();
  }

  async addUser(name: string, advance: number): Promise<void> {
    try {
      await this.db.collection('users').add({ name, advance });
    } catch (error) {
      console.error('Error adding user: ', error);
    }
  }
  async updateAdvanceForEmployee(
    month: string,
    employeeName: string,
    advanceToAdd: number,
  ): Promise<string> {
    try {
      const docRef = this.db.collection('workers').doc(month);

      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const workersData = docSnapshot.data();

        if (workersData && workersData.hasOwnProperty(employeeName)) {
          const newAdvance = (workersData[employeeName] || 0) + advanceToAdd;

          await docRef.update({ [employeeName]: newAdvance });

          return `Аванс працівника ${employeeName} успішно доданий в ${month}`;
        } else {
          return `Працівник "${employeeName}" не знайден`;
        }
      } else {
        return `Працівник "${employeeName}" не знайден`;
      }
    } catch (error) {
      console.error('Error updating advance for employee: ', error);
      return 'An error occurred while updating advance';
    }
  }

  async getAllDocs(): Promise<
    FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  > {
    try {
      const querySnapshot = await this.db.collection('workers').get();
      return querySnapshot;
    } catch (error) {
      console.error('Error fetching all docs: ', error);
      throw error;
    }
  }
}
