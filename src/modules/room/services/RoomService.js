import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/config";

// Tên collection trên Firestore
const COLLECTION_NAME = "rooms";
const roomsCollectionRef = collection(db, COLLECTION_NAME);

export const RoomService = {
    // Lấy danh sách phòng
    async getRooms() {
        try {
            const q = query(
                roomsCollectionRef,
                where("status", "!=", "ARCHIVED"),
            );
            const querySnapshot = await getDocs(q);
            const rooms = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, data: rooms };

        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Đăng ký (Thêm mới) phòng
    async addRoom(roomData) {
        try {
            const newRoom = {
                propertyId: roomData.propertyId || '',
                roomId: roomData.roomId || '',
                status: roomData.status || 'AVAILABLE',
                currentContractId: roomData.currentContractId || '',
                currentTenantNames: roomData.currentTenantNames || [],
                currentPrice: roomData.currentPrice || '',
                floor: roomData.floor || '',
                area: roomData.area || '',
                createdAt: serverTimestamp(),
                createdBy: roomData.createdBy || '',
                updatedAt: serverTimestamp(),
                updatedBy: roomData.updatedBy || ''
            };

            const docRef = await addDoc(roomsCollectionRef, newRoom);

            return { success: true, id: docRef.id, ...newRoom };

        } catch (error) {
            console.error("Lỗi khi thêm phòng mới: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật phòng
    async updateRoom(roomId, roomData) {
        try {
            const roomDoc = doc(db, COLLECTION_NAME, roomId);
            const updatedRoom = {
                propertyId: roomData.propertyId || '',
                roomId: roomData.roomId || '',
                status: roomData.status || 'AVAILABLE',
                currentContractId: roomData.currentContractId || '',
                currentTenantNames: roomData.currentTenantNames || [],
                currentPrice: roomData.currentPrice || '',
                floor: roomData.floor || '',
                area: roomData.area || '',
                updatedAt: serverTimestamp(),
                updatedBy: roomData.updatedBy || '',
            };

            await updateDoc(roomDoc, updatedRoom);

            return { success: true, id: roomId, ...updatedRoom };

        } catch (error) {
            console.error("Lỗi khi cập nhật phòng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật phòng sang ARCHIVED
    async softDeleteRoom(roomId) {
        try {
            const roomDoc = doc(db, COLLECTION_NAME, roomId);

            await updateDoc(roomDoc, {
                status: 'ARCHIVED',
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa phòng:", error);
            return { success: false, error: error.message };
        }
    }

};
