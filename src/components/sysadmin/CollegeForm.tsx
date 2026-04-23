import { useMemo } from "react"
import { Building2, MapPin, User, Loader2, Eye, EyeOff, Globe } from "lucide-react"
import FloatingInput from "@/components/ui/FloatingInput"
import FloatingSelect from "@/components/ui/FloatingSelect"
import FloatingTextarea from "@/components/ui/FloatingTextarea"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { useFileUpload } from "@/hooks/useFileUpload"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CollegeFormProps {
  readonly mode: "create" | "edit"
  readonly formData: Record<string, string>
  readonly errors: Record<string, string | undefined>
  readonly loading: boolean
  readonly handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  readonly handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  readonly handleUpdate?: () => void
  readonly handleCancel: () => void
  readonly showPassword?: boolean
  readonly togglePassword?: () => void
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const COLLEGE_TYPES = [
  { value: "engineering", label: "Engineering" },
  { value: "diploma", label: "Diploma" },
  { value: "mba", label: "MBA" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "degree", label: "Degree" },
  { value: "medical", label: "Medical" },
]

const ACADEMIC_YEARS = Array.from({ length: 21 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}))

function getPasswordStrength(password: string) {
  if (!password) return { label: "", color: "", width: "0%" }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" }
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "66%" }
  return { label: "Strong", color: "bg-emerald-500", width: "100%" }
}

function getStrengthLabelColor(label: string) {
  if (label === "Weak") return "text-red-500 dark:text-red-400"
  if (label === "Medium") return "text-yellow-600 dark:text-yellow-400"
  return "text-emerald-600 dark:text-emerald-400"
}

function getSubmitLabel(isCreate: boolean, loading: boolean) {
  if (isCreate) return loading ? "Creating..." : "Create College"
  return loading ? "Saving..." : "Save Changes"
}

// ─── Field name maps ────────────────────────────────────────────────────────────

const F = {
  create: {
    name: "collegeName",
    subdomain: "collegeSubdomain",
    type: "collegeType",
    year: "defaultAcademicYear",
    address: "collegeAddress",
    city: "collegeCity",
    taluka: "collegeTaluka",
    district: "collegeDistrict",
    state: "collegeState",
    pincode: "collegePincode",
    adminName: "adminName",
    adminEmail: "adminEmail",
    adminPassword: "adminPassword", // NOSONAR - field name key, not a password value
    logoUrl: "collegeLogoUrl",
    website: "collegeWebsite",
    affiliation: "collegeAffiliation",
    establishedYear: "collegeEstablishedYear",
    description: "collegeDescription",
  },
  edit: {
    name: "college_name",
    subdomain: "college_subdomain",
    type: "college_type",
    year: "",
    address: "college_address",
    city: "college_city",
    taluka: "college_taluka",
    district: "college_district",
    state: "college_state",
    pincode: "college_pincode",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    logoUrl: "college_logo_url",
    website: "college_website",
    affiliation: "college_affiliation",
    establishedYear: "college_established_year",
    description: "college_description",
  },
} as const

// ─── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}>) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CollegeForm({
  mode,
  formData,
  errors,
  loading,
  handleChange,
  handleSubmit,
  handleUpdate,
  handleCancel,
  showPassword,
  togglePassword,
}: CollegeFormProps) {
  const f = F[mode]
  const isCreate = mode === "create"

  const logoUpload = useFileUpload()

  const handleLogoSelect = async (file: File | null) => {
    if (!file) return
    try {
      const entityId = formData[f.subdomain] || formData[f.name] || "college"
      const { storagePath } = await logoUpload.upload(file, {
        bucket: "placenex-public",
        category: "logos",
        entityId: `col_${entityId}`,
        maxSizeBytes: 2 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      })
      handleChange({ target: { name: f.logoUrl, value: storagePath } } as React.ChangeEvent<HTMLInputElement>)
    } catch { /* error in logoUpload.error */ }
  }

  const submitLabel = getSubmitLabel(isCreate, loading)

  const passwordValue = isCreate ? formData[f.adminPassword] || "" : ""
  const passwordStrength = useMemo(
    () => (isCreate ? getPasswordStrength(passwordValue) : null),
    [isCreate, passwordValue],
  )

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isCreate && handleSubmit) {
      handleSubmit(e)
    } else if (handleUpdate) {
      handleUpdate()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <form onSubmit={onFormSubmit} className="p-6 sm:p-8 space-y-8">
        {/* ── College Information ── */}
        <div>
          <SectionHeader
            icon={Building2}
            title="College Information"
            description="Basic details about the institution"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FloatingInput
              label="College Name"
              name={f.name}
              value={formData[f.name] || ""}
              onChange={handleChange}
              error={errors[f.name]}
              placeholder="Enter college name"
              disabled={loading}
              required
            />
            <FloatingInput
              label="Subdomain"
              name={f.subdomain}
              value={formData[f.subdomain] || ""}
              onChange={handleChange}
              error={errors[f.subdomain]}
              placeholder="yourcollege"
              disabled={loading}
              required
            />
            <FloatingSelect
              label="College Type"
              name={f.type}
              value={formData[f.type] || ""}
              onChange={handleChange}
              options={COLLEGE_TYPES}
              error={errors[f.type]}
              disabled={loading}
              required
            />
            {isCreate && f.year && (
              <FloatingSelect
                label="Default Academic Year"
                name={f.year}
                value={formData[f.year] || ""}
                onChange={handleChange}
                options={ACADEMIC_YEARS}
                error={errors[f.year]}
                disabled={loading}
                required
              />
            )}
          </div>
          {formData[f.subdomain] && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
              {formData[f.subdomain]}.placenex.in
            </p>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* ── Address ── */}
        <div>
          <SectionHeader
            icon={MapPin}
            title="Address Information"
            description="Location details of the institution"
          />
          <div className="space-y-5">
            <FloatingTextarea
              label="Address"
              name={f.address}
              value={formData[f.address] || ""}
              onChange={handleChange}
              error={errors[f.address]}
              placeholder="Full address"
              maxLength={500}
              rows={2}
              disabled={loading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FloatingInput
                label="City"
                name={f.city}
                value={formData[f.city] || ""}
                onChange={handleChange}
                error={errors[f.city]}
                placeholder="Enter city"
                disabled={loading}
              />
              <FloatingInput
                label="Taluka"
                name={f.taluka}
                value={formData[f.taluka] || ""}
                onChange={handleChange}
                error={errors[f.taluka]}
                placeholder="Enter taluka"
                disabled={loading}
              />
              <FloatingInput
                label="District"
                name={f.district}
                value={formData[f.district] || ""}
                onChange={handleChange}
                error={errors[f.district]}
                placeholder="Enter district"
                disabled={loading}
              />
              <FloatingInput
                label="State"
                name={f.state}
                value={formData[f.state] || ""}
                onChange={handleChange}
                error={errors[f.state]}
                placeholder="Enter state"
                disabled={loading}
              />
              <FloatingInput
                label="Pincode"
                name={f.pincode}
                value={formData[f.pincode] || ""}
                onChange={handleChange}
                error={errors[f.pincode]}
                placeholder="411041"
                maxLength={6}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* ── Branding & Identity ── */}
        <div>
          <SectionHeader
            icon={Globe}
            title="Branding & Identity"
            description="Logo, website, and affiliation details shown on the college portal"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">College Logo</p>
              <ImageUpload
                value={formData[f.logoUrl] || null}
                onFileSelect={handleLogoSelect}
                progress={logoUpload.progress}
                isUploading={logoUpload.isUploading}
                error={logoUpload.error || errors[f.logoUrl]}
                variant="logo"
                size={96}
                initials={formData[f.name]?.slice(0, 2)?.toUpperCase()}
                label="Upload college logo"
              />
            </div>
            <div className="space-y-5">
              <FloatingInput
                label="Website"
                name={f.website}
                value={formData[f.website] || ""}
                onChange={handleChange}
                error={errors[f.website]}
                placeholder="https://www.college.ac.in"
                type="url"
                disabled={loading}
              />
              <FloatingInput
                label="Affiliation"
                name={f.affiliation}
                value={formData[f.affiliation] || ""}
                onChange={handleChange}
                error={errors[f.affiliation]}
                placeholder="e.g. SPPU, Pune"
                disabled={loading}
              />
              <FloatingInput
                label="Established Year"
                name={f.establishedYear}
                value={formData[f.establishedYear] || ""}
                onChange={handleChange}
                error={errors[f.establishedYear]}
                placeholder="e.g. 1996"
                maxLength={4}
                disabled={loading}
              />
            </div>
          </div>
          <div className="mt-5">
            <FloatingTextarea
              label="Description"
              name={f.description}
              value={formData[f.description] || ""}
              onChange={handleChange}
              error={errors[f.description]}
              placeholder="Short description about the college"
              maxLength={1000}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* ── Admin Account (create only) ── */}
        {isCreate && f.adminName && (
          <>
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <div>
              <SectionHeader
                icon={User}
                title="First Admin Account"
                description="This account will be used by the college administrator to log in"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FloatingInput
                  label="Admin Name"
                  name={f.adminName}
                  value={formData[f.adminName] || ""}
                  onChange={handleChange}
                  error={errors[f.adminName]}
                  placeholder="Full name"
                  disabled={loading}
                  required
                />
                <FloatingInput
                  label="Admin Email"
                  name={f.adminEmail}
                  value={formData[f.adminEmail] || ""}
                  onChange={handleChange}
                  error={errors[f.adminEmail]}
                  placeholder="admin@email.com"
                  type="email"
                  disabled={loading}
                  required
                />
              </div>
              <div className="max-w-md mt-5">
                <div className="relative">
                  <FloatingInput
                    label="Admin Password"
                    name={f.adminPassword}
                    value={formData[f.adminPassword] || ""}
                    onChange={handleChange}
                    error={errors[f.adminPassword]}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    disabled={loading}
                    required
                  />
                  {togglePassword && (
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {passwordStrength && formData[f.adminPassword] && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${getStrengthLabelColor(passwordStrength.label)}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Must contain at least 1 uppercase, 1 lowercase, and 1 number
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
