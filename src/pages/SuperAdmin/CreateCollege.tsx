"use client";

import { useState } from "react";
import { Plus, Building2, Mail, User, Lock } from "lucide-react"; // Added new icons for inputs
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "../../components/sysadmin/DashboardLayout"; // Assuming this handles overall structure
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added Card component for better visual structure

// Define the gradient class and a theme color for accents
const gradient = "bg-gradient-to-r from-[#694ed6] to-[#c137a2]";
const accentColor = "text-[#694ed6]"; // Primary theme color

export default function CreateCollege() {
  const [open, setOpen] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);

  const tenants = [
    { id: "3eb26445-0032-4268-afb2-f571d1dadc75", name: "Main Tenant" },
    { id: "22b26445-9922-4268-afb2-f571d1dad111", name: "Demo Tenant" },
  ];

  const [formData, setFormData] = useState({
    tenant_id: "",
    college_name: "",
    college_subdomain: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });

  const handleSubmit = () => {
    // Basic validation to prevent adding empty colleges
    if (formData.college_name.trim() && formData.tenant_id) {
      setColleges([...colleges, formData]);
      setOpen(false);
      // Reset form data after successful submission
      setFormData({
        tenant_id: "",
        college_name: "",
        college_subdomain: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
    } else {
      alert("Please select a Tenant and enter a College Name.");
    }
  };

  return (
    <DashboardLayout>
      {/* Header with improved typography and spacing */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
        <div>
          <p className="text-xl font-medium tracking-tight">College Management</p>
      
        </div>
        
        {/* 'Create New College' button outside the grid for prominence */}
        <Button
          onClick={() => setOpen(true)}
          className={`h-10 w-40 px-6 mt-4 md:mt-0 ${gradient} text-white font-semibold shadow-lg hover:brightness-110 transition`}
        >
          <Plus className="mr-2 h-4 w-4" /> Create College
        </Button>
      </div>

      <Separator className="bg-gray-200" />

      {/* College Grid with better structure using the Card component */}
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

    {/* Create New College Placeholder Card - kept for visual consistency and secondary trigger */}
        <Card
          onClick={() => setOpen(true)}
          className="border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <Plus size={28} className="h-8 w-8 text-gray-400" />
          <p className="mt-3 font-medium text-base">Create New College</p>
        </Card>


        {/* Existing Colleges Cards */}
        {colleges.map((college, index) => (
          <Card 
            key={index} 
            className={`overflow-hidden border-2 border-transparent hover:shadow-xl transition-shadow duration-300`}
            style={{ 
                // Adding a subtle gradient border effect
                backgroundImage: `linear-gradient(white, white), ${gradient}`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '2px solid transparent',
            }}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <Building2 className={`h-6 w-6 ${accentColor}`} />
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-opacity-10`} 
                     style={{ backgroundColor: 'rgba(105, 78, 214, 0.1)', color: '#694ed6' }}>
                    {tenants.find(t => t.id === college.tenant_id)?.name || "N/A"}
                </div>
            </CardHeader>
            <CardContent className="pt-2">
              <CardTitle className="text-xl font-bold truncate">
                {college.college_name}
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-gray-600">
                {college.college_subdomain ? `@${college.college_subdomain}` : "No Subdomain"}
              </CardDescription>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Admin: **{college.admin_name || "N/A"}**
              </div>
            </CardContent>
          </Card>
        ))}

    

      </div>

      {/* Modal - Modern Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New College</DialogTitle>
          </DialogHeader>

          {/* Form fields with icons for better clarity */}
          <div className="grid gap-5 py-4">
            
            {/* Tenant Dropdown */}
            <div className="space-y-1">
              <Label htmlFor="tenant-select" className="text-sm font-medium">Select Tenant</Label>
              <Select
                value={formData.tenant_id}
                onValueChange={(val) =>
                  setFormData({ ...formData, tenant_id: val })
                }
              >
                <SelectTrigger id="tenant-select" className="w-full">
                  <SelectValue placeholder="Choose Tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* College Name */}
            <div className="space-y-1">
              <Label htmlFor="college_name" className="text-sm font-medium">College Name</Label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input id="college_name" placeholder="E.g., Tech University" 
                  className="pl-10"
                  value={formData.college_name}
                  onChange={(e) => setFormData({ ...formData, college_name: e.target.value })} />
              </div>
            </div>

            {/* Subdomain */}
            <div className="space-y-1">
              <Label htmlFor="college_subdomain" className="text-sm font-medium">Subdomain (URL Slug)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">@</span>
                <Input id="college_subdomain" placeholder="e.g., tech-uni" 
                  className="pl-8"
                  value={formData.college_subdomain}
                  onChange={(e) => setFormData({ ...formData, college_subdomain: e.target.value })} />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Admin Details Title */}
            <p className="text-md font-semibold mt-2">Initial Admin User</p>

            {/* Admin Name */}
            <div className="space-y-1">
              <Label htmlFor="admin_name" className="text-sm font-medium">Admin Name</Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input id="admin_name" placeholder="John Doe" 
                  className="pl-10"
                  value={formData.admin_name}
                  onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })} />
              </div>
            </div>

            {/* Admin Email */}
            <div className="space-y-1">
              <Label htmlFor="admin_email" className="text-sm font-medium">Admin Email</Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input id="admin_email" type="email" placeholder="admin@college.edu" 
                  className="pl-10"
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })} />
              </div>
            </div>

            {/* Admin Password */}
            <div className="space-y-1">
              <Label htmlFor="admin_password" className="text-sm font-medium">Admin Password</Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input id="admin_password" type="password" placeholder="Password" 
                  className="pl-10"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              className={`w-full ${gradient} text-white font-semibold shadow-lg hover:brightness-110 transition`}
              onClick={handleSubmit}
              disabled={!formData.tenant_id || !formData.college_name} // Disable if required fields are empty
            >
              Create College
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}