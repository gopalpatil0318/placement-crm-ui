import { useProfileLinks } from "@/hooks/student/useProfileLinks";
import { X, Github, Linkedin, Globe, FileText, Image, Code, BookOpen } from "lucide-react";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const ProfileLinksForm = ({ }: Props) => {
    const {
        formData, errors, loading, saving,
        interestInput, setInterestInput,
        handleChange, addInterest, removeInterest, handleSubmit,
    } = useProfileLinks();

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading profile links...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Profile Links & Bio</h2>
            </div>

            <div className="space-y-8">
                {/* ================= 📝 Bio & Interests ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">📝 Bio & Interests</h3>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                            placeholder="Tell us about yourself — your interests, skills, and goals..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex justify-between mt-1">
                            {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                            <p className="text-xs text-gray-400 ml-auto">{formData.bio.length}/500</p>
                        </div>
                    </div>

                    {/* Area of Interest */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Areas of Interest (max 10)</label>
                        <div className="flex gap-2">
                            <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                                placeholder="Type an interest & press Enter"
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={addInterest}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer">Add</button>
                        </div>
                        {formData.area_of_interest.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.area_of_interest.map((interest) => (
                                    <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                        {interest}
                                        <button type="button" onClick={() => removeInterest(interest)} className="hover:text-blue-900 cursor-pointer"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.area_of_interest && <p className="text-xs text-red-500 mt-1">{errors.area_of_interest}</p>}
                    </div>
                </div>

                {/* ================= 🔗 Portfolio & Resume ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" /> Portfolio & Resume
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LinkField
                            icon={<Globe className="h-4 w-4" />}
                            label="🔗 Portfolio"
                            name="personal_portfolio_url"
                            placeholder="https://yoursite.dev"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            icon={<FileText className="h-4 w-4" />}
                            label="📄 Resume"
                            name="resume_url"
                            placeholder="https://drive.google.com/..."
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            icon={<Image className="h-4 w-4" />}
                            label="Profile Image URL"
                            name="profile_image_url"
                            placeholder="https://drive.google.com/..."
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= 🐙 GitHub & LinkedIn ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-600" /> Professional Profiles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LinkField
                            icon={<Github className="h-4 w-4" />}
                            label="🐙 GitHub"
                            name="github_url"
                            placeholder="https://github.com/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            icon={<Linkedin className="h-4 w-4" />}
                            label="💼 LinkedIn"
                            name="linkedin_url"
                            placeholder="https://linkedin.com/in/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= 💻 Competitive Programming & Blog ================= */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-600" /> Competitive Programming & Blog
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LinkField
                            label="💻 LeetCode"
                            name="leetcode_url"
                            placeholder="https://leetcode.com/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            label="🍴 CodeChef"
                            name="codechef_url"
                            placeholder="https://codechef.com/users/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            label="Codeforces"
                            name="codeforces_url"
                            placeholder="https://codeforces.com/profile/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            label="HackerRank"
                            name="hackerrank_url"
                            placeholder="https://hackerrank.com/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            label="📊 GeeksforGeeks"
                            name="geeksforgeeks_url"
                            placeholder="https://auth.geeksforgeeks.org/user/username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                        <LinkField
                            icon={<BookOpen className="h-4 w-4" />}
                            label="Medium"
                            name="medium_url"
                            placeholder="https://medium.com/@username"
                            formData={formData} errors={errors} handleChange={handleChange}
                        />
                    </div>
                </div>

                {/* ================= Save Button (bottom) ================= */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileLinksForm;

/* ================= Link Field ================= */

const LinkField = ({ icon, label, name, placeholder, formData, errors, handleChange }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            {icon && <span className="text-gray-400">{icon}</span>}
            {label}
        </label>
        <input
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[name] && (
            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
        )}
    </div>
);
