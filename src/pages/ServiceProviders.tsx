import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Phone, Mail, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { StandardPageHeader } from "@/components/StandardPageHeader";
import { StandardPageLayout } from "@/components/StandardPageLayout";

interface ServiceProvider {
  id: string;
  name: string;
  provider_type: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  average_closing_days: number | null;
  success_rate: number | null;
  is_active: boolean;
}

export default function ServiceProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .order("name");

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      toast.error("Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = provider.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || provider.provider_type === filterType;
    return matchesSearch && matchesType;
  });

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case "title":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "escrow":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "both":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <StandardPageLayout>
      <div className="flex items-center justify-between">
        <StandardPageHeader
          title="Title & Escrow Companies"
          description="Manage your title and escrow service providers"
        />
        <Button onClick={() => navigate('/service-providers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Service Provider
        </Button>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "title" ? "default" : "outline"}
                  onClick={() => setFilterType("title")}
                >
                  Title
                </Button>
                <Button
                  variant={filterType === "escrow" ? "default" : "outline"}
                  onClick={() => setFilterType("escrow")}
                >
                  Escrow
                </Button>
                <Button
                  variant={filterType === "both" ? "default" : "outline"}
                  onClick={() => setFilterType("both")}
                >
                  Both
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Providers Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredProviders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No service providers found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/service-providers/${provider.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {provider.name}
                      </CardTitle>
                      <Badge
                        className={getProviderTypeColor(provider.provider_type)}
                      >
                        {provider.provider_type === "both"
                          ? "Title & Escrow"
                          : provider.provider_type.charAt(0).toUpperCase() +
                            provider.provider_type.slice(1)}
                      </Badge>
                    </div>
                    {!provider.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.contact_person && (
                    <div className="text-sm text-muted-foreground">
                      Contact: {provider.contact_person}
                    </div>
                  )}
                  {provider.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{provider.email}</span>
                    </div>
                  )}
                  {(provider.city || provider.state) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {provider.city}
                        {provider.city && provider.state && ", "}
                        {provider.state}
                      </span>
                    </div>
                  )}
                  {provider.average_closing_days !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Avg Closing:</span>{" "}
                      <span className="font-medium">
                        {provider.average_closing_days} days
                      </span>
                    </div>
                  )}
                  {provider.success_rate !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Success Rate:</span>{" "}
                      <span className="font-medium">
                        {provider.success_rate}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
