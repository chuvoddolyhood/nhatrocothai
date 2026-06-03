import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../firebase/config";

const COLLECTION_NAME = "contracts";
const contractsCollectionRef = collection(db, COLLECTION_NAME);

export const ContractService = {
    // Đăng ký (Thêm mới) hợp đồng
    async addContract(contractData) {
        try {
            const newContract = {
                propertyId: contractData.propertyId || '',
                roomId: contractData.roomId || '',
                tenantIds: contractData.tenantIds || [],
                representativeTenantId: contractData.representativeTenantId || '',
                depositAmount: Number(contractData.depositAmount) || 0,
                monthlyRent: Number(contractData.monthlyRent) || 0,
                billingDay: Number(contractData.billingDay) || 1,
                startDate: contractData.startDate ? new Date(contractData.startDate) : serverTimestamp(),
                endDate: contractData.endDate ? new Date(contractData.endDate) : null,
                status: contractData.status || 'ACTIVE', // ACTIVE, EXPIRED, TERMINATED
                createdBy: contractData.createdBy || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(contractsCollectionRef, newContract);

            // TODO: Ở đây bạn có thể thêm logic gọi RoomService.updateRoom để cập nhật 
            // currentContractId cho phòng và đổi status phòng thành "RENTED" (nếu cần).

            return { success: true, id: docRef.id, ...newContract };
        } catch (error) {
            console.error("Lỗi khi tạo hợp đồng mới: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy danh sách hợp đồng (có thể lọc theo propertyId, roomId, status)
    async getContracts(filters = {}) {
        try {
            let q = query(contractsCollectionRef);

            if (filters.status) {
                q = query(q, where("status", "==", filters.status));
            }
            if (filters.roomId) {
                q = query(q, where("roomId", "==", filters.roomId));
            }

            const querySnapshot = await getDocs(q);
            const contracts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, data: contracts };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy chi tiết một hợp đồng
    async getContractById(contractId) {
        try {
            const contractDoc = doc(db, COLLECTION_NAME, contractId);
            const docSnap = await getDoc(contractDoc);
            
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: "Không tìm thấy hợp đồng" };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật hợp đồng
    async updateContract(contractId, contractData) {
        try {
            const contractDoc = doc(db, COLLECTION_NAME, contractId);
            const updatedContract = {
                ...contractData,
                updatedAt: serverTimestamp()
            };

            // Loại bỏ undefined
            Object.keys(updatedContract).forEach(key => {
                if (updatedContract[key] === undefined) {
                    delete updatedContract[key];
                }
            });

            await updateDoc(contractDoc, updatedContract);

            return { success: true, id: contractId, ...updatedContract };
        } catch (error) {
            console.error("Lỗi khi cập nhật hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Thay đổi trạng thái hợp đồng (Chấm dứt / Hết hạn)
    async updateContractStatus(contractId, status) {
        try {
            const contractDoc = doc(db, COLLECTION_NAME, contractId);
            await updateDoc(contractDoc, {
                status: status, // 'TERMINATED' hoặc 'EXPIRED'
                updatedAt: serverTimestamp()
            });

            // TODO: Ở đây bạn có thể thêm logic giải phóng phòng khi hợp đồng bị TERMINATED
            
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    }
};
