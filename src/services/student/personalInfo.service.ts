import api from "@/lib/api";

export interface PersonalInfoData {
    mobile_number: string;
    alternate_mobile: string;
    birth_date: string;
    gender: string;
    blood_group: string;
    aadhaar_number: string;
    caste: string;
    category: string;
    nationality: string;
    father_name: string;
    father_mobile: string;
    father_occupation: string;
    father_annual_income: number | string;
    mother_name: string;
    mother_mobile: string;
    mother_occupation: string;
    mother_annual_income: number | string;
    guardian_name: string;
    guardian_mobile: string;
    permanent_address: string;
    permanent_city: string;
    permanent_district: string;
    permanent_state: string;
    permanent_pincode: string;
    same_as_permanent: boolean;
    current_address: string;
    current_city: string;
    current_district: string;
    current_state: string;
    current_pincode: string;
}


export const StudentPersonalInfoService ={
    getPersonalInfo: async () => {
        const response= await api.get("/student/get_personal_info");
        console.log(response.data);
        return response.data;
    },
    
    savePersonalInfo: async (data: PersonalInfoData)=>{
        const response= await api.put("/student/save_personal_info", data);
        console.log(response.data);
        return response.data;
    }
}