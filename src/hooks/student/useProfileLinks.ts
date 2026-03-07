import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { StudentProfileLinksService } from "@/services/student/profileLinks.service";
import { profileLinksSchema } from "@/validators/student/profileLinksSchema";

const emptyForm = {
    personal_portfolio_url: "",
    resume_url: "",
    profile_image_url: "",
    github_url: "",
    linkedin_url: "",
    leetcode_url: "",
    codechef_url: "",
    codeforces_url: "",
    hackerrank_url: "",
    geeksforgeeks_url: "",
    medium_url: "",
    bio: "",
    area_of_interest: [] as string[],
};

type FormErrors = Partial<Record<string, string>>;

export const useProfileLinks = () => {
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    const [interestInput, setInterestInput] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const response = await StudentProfileLinksService.getProfileLinks();
            const data = response.data?.profile_links || response.profile_links || response.data || null;

            if (data && Object.keys(data).length > 0) {
                setFormData({
                    personal_portfolio_url: data.personal_portfolio_url || "",
                    resume_url: data.resume_url || "",
                    profile_image_url: data.profile_image_url || "",
                    github_url: data.github_url || "",
                    linkedin_url: data.linkedin_url || "",
                    leetcode_url: data.leetcode_url || "",
                    codechef_url: data.codechef_url || "",
                    codeforces_url: data.codeforces_url || "",
                    hackerrank_url: data.hackerrank_url || "",
                    geeksforgeeks_url: data.geeksforgeeks_url || "",
                    medium_url: data.medium_url || "",
                    bio: data.bio || "",
                    area_of_interest: data.area_of_interest || [],
                });
                setIsExisting(true);
            }
        } catch {
            console.log("No existing profile links");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const addInterest = () => {
        const i = interestInput.trim();
        if (i && !formData.area_of_interest.includes(i) && formData.area_of_interest.length < 10) {
            setFormData((prev) => ({ ...prev, area_of_interest: [...prev.area_of_interest, i] }));
            setInterestInput("");
        }
    };
    const removeInterest = (interest: string) => {
        setFormData((prev) => ({ ...prev, area_of_interest: prev.area_of_interest.filter((a) => a !== interest) }));
    };

    const handleSubmit = async () => {
        const result = profileLinksSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                personal_portfolio_url: formData.personal_portfolio_url || null,
                resume_url: formData.resume_url || null,
                profile_image_url: formData.profile_image_url || null,
                github_url: formData.github_url || null,
                linkedin_url: formData.linkedin_url || null,
                leetcode_url: formData.leetcode_url || null,
                codechef_url: formData.codechef_url || null,
                codeforces_url: formData.codeforces_url || null,
                hackerrank_url: formData.hackerrank_url || null,
                geeksforgeeks_url: formData.geeksforgeeks_url || null,
                medium_url: formData.medium_url || null,
                bio: formData.bio || null,
                area_of_interest: formData.area_of_interest,
            };

            await StudentProfileLinksService.saveProfileLinks(payload);

            if (isExisting) {
                showToast({ type: "success", title: "Updated", description: "Profile links updated successfully" });
            } else {
                showToast({ type: "success", title: "Created", description: "Profile links saved successfully" });
                setIsExisting(true);
            }
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    return {
        formData, errors, loading, saving, isExisting,
        interestInput, setInterestInput,
        handleChange, addInterest, removeInterest, handleSubmit,
    };
};
