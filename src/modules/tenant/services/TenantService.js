import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, getDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/config";

// Tên collection trên Firestore
const COLLECTION_NAME = "tenants";
const tenantsCollectionRef = collection(db, COLLECTION_NAME);

export const TenantService = {
    // Lấy danh sách khách thuê
    async getTenants() {
        try {
            const q = query(
                tenantsCollectionRef,
                where("status", "!=", "ARCHIVED"),
            );
            const querySnapshot = await getDocs(q);
            const tenants = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, data: tenants };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy thông tin chi tiết một khách thuê
    async getTenantById(tenantId) {
        try {
            const tenantDoc = doc(db, COLLECTION_NAME, tenantId);
            const docSnap = await getDoc(tenantDoc);

            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: "Không tìm thấy khách thuê" };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Đăng ký (Thêm mới) khách thuê
    async addTenant(tenantData) {
        try {
            const newTenant = {
                fullName: tenantData.fullName || '',
                phone: tenantData.phone || '',
                citizenId: tenantData.citizenId || '',
                birthDate: tenantData.birthDate || '',
                permanentAddress: tenantData.permanentAddress || '',
                citizenIdFrontUrl: tenantData.citizenIdFrontUrl || '',
                citizenIdBackUrl: tenantData.citizenIdBackUrl || '',
                status: tenantData.status || 'ACTIVE',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(tenantsCollectionRef, newTenant);

            return { success: true, id: docRef.id, ...newTenant };
        } catch (error) {
            console.error("Lỗi khi thêm khách thuê mới: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật thông tin khách thuê
    async updateTenant(tenantId, tenantData) {
        try {
            const tenantDoc = doc(db, COLLECTION_NAME, tenantId);
            const updatedTenant = {
                fullName: tenantData.fullName !== undefined ? tenantData.fullName : '',
                phone: tenantData.phone !== undefined ? tenantData.phone : '',
                citizenId: tenantData.citizenId !== undefined ? tenantData.citizenId : '',
                birthDate: tenantData.birthDate !== undefined ? tenantData.birthDate : '',
                permanentAddress: tenantData.permanentAddress !== undefined ? tenantData.permanentAddress : '',
                citizenIdFrontUrl: tenantData.citizenIdFrontUrl !== undefined ? tenantData.citizenIdFrontUrl : '',
                citizenIdBackUrl: tenantData.citizenIdBackUrl !== undefined ? tenantData.citizenIdBackUrl : '',
                status: tenantData.status !== undefined ? tenantData.status : 'ACTIVE',
                updatedAt: serverTimestamp()
            };

            await updateDoc(tenantDoc, updatedTenant);

            return { success: true, id: tenantId, ...updatedTenant };
        } catch (error) {
            console.error("Lỗi khi cập nhật khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Xóa mềm khách thuê (Chuyển status sang ARCHIVED)
    async softDeleteTenant(tenantId) {
        try {
            const tenantDoc = doc(db, COLLECTION_NAME, tenantId);

            await updateDoc(tenantDoc, {
                status: 'ARCHIVED',
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa khách thuê: ", error);
            return { success: false, error: error.message };
        }
    }
};