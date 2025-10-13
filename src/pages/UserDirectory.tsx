import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { UserCog, Plus, Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UserDirectory() {
  return (
    <div className="bg-white min-h-full">
      <IBMPageHeader
        title="User Directory Management"
        subtitle="Manage users, roles, and permissions across your organization"
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525252]" />
              <Input
                placeholder="Search by name, email, or role..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Total Users</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">156</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Active Users</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">142</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Pending Invites</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">8</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Roles</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">12</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* User Directory Table */}
        <Card className="border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-lg">User Directory</CardTitle>
            <CardDescription className="text-[#525252]">
              Manage all users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-[#525252] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#161616] mb-2">
                User Directory Management
              </h3>
              <p className="text-sm text-[#525252] mb-4">
                User directory features will be implemented here
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
