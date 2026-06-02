import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

// Tên collection trên Firestore
const COLLECTION_NAME = "properties";
const propertiesCollectionRef = collection(db, COLLECTION_NAME);

export const PropertiesService = {

    // Lấy danh sách properties
    async getProperties() {
        try {
            const q = query(
                propertiesCollectionRef,
                where("status", "==", "ACTIVE")
            );
            const querySnapshot = await getDocs(q);
            const properties = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, data: properties };

        } catch (error) {
            console.error("Lỗi khi lấy danh sách khu trọ: ", error);
            return { success: false, error: error.message };
        }
    },
}
