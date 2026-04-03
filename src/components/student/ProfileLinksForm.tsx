import { useProfileLinks } from "@/hooks/student/useProfileLinks";
import { X } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";

const ProfileLinksForm = () => {
    const {
        formData, errors, loading, saving,
        interestInput, setInterestInput,
        handleChange, addInterest, removeInterest, handleSubmit,
    } = useProfileLinks();

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                <div className="mb-6">
                    <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
                <div className="space-y-8">
                    {/* Bio & Interests */}
                    <div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-4" />
                        <div className="h-24 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-6" />
                        <div className="h-3.5 w-44 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-2" />
                        <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                    {/* Portfolio & Resume */}
                    <div>
                        <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {["portfolio", "resume", "image"].map((id) => (
                                <div key={id} className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            ))}
                        </div>
                    </div>
                    {/* Social Links */}
                    <div>
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {["github", "linkedin", "twitter", "other"].map((id) => (
                                <div key={id} className="h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Profile Links & Bio</h2>
            </div>

            <div className="space-y-8">
                {/* ================= 📝 Bio & Interests ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">📝 Bio & Interests</h3>

                    {/* Bio */}
                    <FloatingTextarea
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        error={errors.bio}
                        rows={4}
                        maxLength={500}
                        placeholder="Tell us about yourself — your interests, skills, and goals..."
                        className="mb-6"
                    />

                    {/* Area of Interest */}
                    <div>
                        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎯 Areas of Interest (max 10)</p>
                        <div className="flex gap-2">
                            <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                                placeholder="Type an interest & press Enter"
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
                            <button type="button" onClick={addInterest}
                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                        </div>
                        {formData.area_of_interest.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.area_of_interest.map((interest) => (
                                    <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800">
                                        {interest}
                                        <button type="button" onClick={() => removeInterest(interest)} className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.area_of_interest && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.area_of_interest}</p>}
                    </div>
                </div>

                {/* ================= 🔗 Portfolio & Resume ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">🔗 Portfolio & Resume</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput label="Portfolio" name="personal_portfolio_url" value={formData.personal_portfolio_url} onChange={handleChange} error={errors.personal_portfolio_url} inputMode="url" placeholder="https://yoursite.dev" />
                        <FloatingInput label="Resume" name="resume_url" value={formData.resume_url} onChange={handleChange} error={errors.resume_url} inputMode="url" placeholder="https://drive.google.com/..." />
                        <FloatingInput label="Profile Image URL" name="profile_image_url" value={formData.profile_image_url} onChange={handleChange} error={errors.profile_image_url} inputMode="url" placeholder="https://drive.google.com/..." />
                    </div>
                </div>

                {/* ================= 🐙 GitHub & LinkedIn ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">💼 Professional Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput label="GitHub" name="github_url" value={formData.github_url} onChange={handleChange} error={errors.github_url} inputMode="url" placeholder="https://github.com/username" />
                        <FloatingInput label="LinkedIn" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} error={errors.linkedin_url} inputMode="url" placeholder="https://linkedin.com/in/username" />
                    </div>
                </div>

                {/* ================= 💻 Competitive Programming & Blog ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">💻 Competitive Programming & Blog</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput label="LeetCode" name="leetcode_url" value={formData.leetcode_url} onChange={handleChange} error={errors.leetcode_url} inputMode="url" placeholder="https://leetcode.com/username" />
                        <FloatingInput label="CodeChef" name="codechef_url" value={formData.codechef_url} onChange={handleChange} error={errors.codechef_url} inputMode="url" placeholder="https://codechef.com/users/username" />
                        <FloatingInput label="Codeforces" name="codeforces_url" value={formData.codeforces_url} onChange={handleChange} error={errors.codeforces_url} inputMode="url" placeholder="https://codeforces.com/profile/username" />
                        <FloatingInput label="HackerRank" name="hackerrank_url" value={formData.hackerrank_url} onChange={handleChange} error={errors.hackerrank_url} inputMode="url" placeholder="https://hackerrank.com/username" />
                        <FloatingInput label="GeeksforGeeks" name="geeksforgeeks_url" value={formData.geeksforgeeks_url} onChange={handleChange} error={errors.geeksforgeeks_url} inputMode="url" placeholder="https://auth.geeksforgeeks.org/user/username" />
                        <FloatingInput label="Medium" name="medium_url" value={formData.medium_url} onChange={handleChange} error={errors.medium_url} inputMode="url" placeholder="https://medium.com/@username" />
                    </div>
                </div>

                {/* ================= Save Button (bottom) ================= */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 pt-4 pb-2 -mx-6 px-6 md:static md:border-0 md:mx-0 md:px-0 md:bg-transparent dark:md:bg-transparent flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileLinksForm;
