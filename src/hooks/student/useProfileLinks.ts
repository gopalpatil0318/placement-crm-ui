import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
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
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isExisting, setIsExisting] = useState(false);

    const [interestInput, setInterestInput] = useState("");

    // Fetch existing profile links
    const { data: linksData, isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.profileLinks(),
        queryFn: async () => {
            const response = await StudentProfileLinksService.getProfileLinks();
            return response.data?.profile_links || response.profile_links || response.data || null;
        },
    });

    // Prefill form from fetched data
    useEffect(() => {
        if (linksData && typeof linksData === "object" && Object.keys(linksData).length > 0) {
            setFormData({
                personal_portfolio_url: linksData.personal_portfolio_url || "",
                resume_url: linksData.resume_url || "",
                profile_image_url: linksData.profile_image_url || "",
                github_url: linksData.github_url || "",
                linkedin_url: linksData.linkedin_url || "",
                leetcode_url: linksData.leetcode_url || "",
                codechef_url: linksData.codechef_url || "",
                codeforces_url: linksData.codeforces_url || "",
                hackerrank_url: linksData.hackerrank_url || "",
                geeksforgeeks_url: linksData.geeksforgeeks_url || "",
                medium_url: linksData.medium_url || "",
                bio: linksData.bio || "",
                area_of_interest: linksData.area_of_interest || [],
            });
            setIsExisting(true);
        }
    }, [linksData]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

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

    const saveMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            StudentProfileLinksService.saveProfileLinks(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.profileLinks() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });

            if (isExisting) {
                showToast({ type: "success", title: "Updated", description: "Profile links updated successfully" });
            } else {
                showToast({ type: "success", title: "Created", description: "Profile links saved successfully" });
                setIsExisting(true);
            }
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Something went wrong",
            });
        },
    });

    const handleSubmit = () => {
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

        const payload: Record<string, unknown> = {
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

        saveMutation.mutate(payload);
    };

    return {
        formData, errors, loading, saving: saveMutation.isPending, isExisting,
        interestInput, setInterestInput,
        handleChange, addInterest, removeInterest, handleSubmit,
    };
};
