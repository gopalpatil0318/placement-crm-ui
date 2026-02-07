import api from "../../lib/api";
import { useState } from "react";
import { useCollegeProfile } from "./useCollegeProfile";
import { showToast } from "@/utils/ToastUtils";


export const useEditCollege = () => {
  const { college, loading } = useCollegeProfile();

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCollege = async (payload: any) => {
    // 1. FIX: Use the correct property name (college_id)
    const id = college?.college_id || college?.id; 

    // 2. FIX: Check the specific ID variable
    if (!id) {
        console.error("Cannot update: Missing College ID"); 
        return;
    }

    console.log("I am here")
    try {
      setUpdating(true);
      setError(null);

      // 3. FIX: Use the variable in the URL
      const res = await api.put(
        `/sysadmin/update-college/${id}`,
        payload
      );
      
      if(res.data?.success){
        showToast({
                type: 'success',
                title: 'Updated College SuccessFully',
                description: res.data.data.message,
              });
      }
      return res.data;

    } catch (err) {
      console.error(err);
      setError("Failed to update college");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    college,
    loading,
    updating,
    error,
    updateCollege,
  };
};