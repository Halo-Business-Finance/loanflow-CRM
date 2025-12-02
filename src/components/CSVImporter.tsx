import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVImporterProps {
  onImportComplete?: () => void;
}

interface ParsedRow {
  [key: string]: string;
}

interface FieldMapping {
  csvColumn: string;
  dbField: string;
}

const CONTACT_FIELDS = [
  { value: "name", label: "Name" },
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "mobile_phone", label: "Mobile Phone" },
  { value: "business_name", label: "Business Name" },
  { value: "business_type", label: "Business Type" },
  { value: "business_address", label: "Business Address" },
  { value: "business_city", label: "Business City" },
  { value: "business_state", label: "Business State" },
  { value: "business_zip_code", label: "Business Zip Code" },
  { value: "loan_amount", label: "Loan Amount" },
  { value: "loan_type", label: "Loan Type" },
  { value: "annual_revenue", label: "Annual Revenue" },
  { value: "credit_score", label: "Credit Score" },
  { value: "years_in_business", label: "Years in Business" },
  { value: "industry", label: "Industry" },
  { value: "notes", label: "Notes" },
  { value: "source", label: "Source" },
  { value: "stage", label: "Stage" },
  { value: "priority", label: "Priority" },
  { value: "skip", label: "-- Skip this column --" },
];

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parse headers
    const headerLine = lines[0];
    const parsedHeaders = parseCSVLine(headerLine);

    // Parse data rows
    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === parsedHeaders.length) {
        const row: ParsedRow = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        rows.push(row);
      }
    }

    return { headers: parsedHeaders, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: parsedHeaders, rows } = parseCSV(text);
      
      setHeaders(parsedHeaders);
      setCsvData(rows);
      
      // Auto-map fields based on header names
      const mappings: FieldMapping[] = parsedHeaders.map(header => {
        const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, "");
        const matchedField = CONTACT_FIELDS.find(f => {
          const normalizedField = f.value.toLowerCase().replace(/[_\s-]/g, "");
          return normalizedHeader.includes(normalizedField) || normalizedField.includes(normalizedHeader);
        });
        return {
          csvColumn: header,
          dbField: matchedField?.value || "skip",
        };
      });
      setFieldMappings(mappings);

      toast({
        title: "File Loaded",
        description: `Found ${rows.length} rows with ${parsedHeaders.length} columns.`,
      });
    };
    reader.readAsText(selectedFile);
  };

  const updateFieldMapping = (csvColumn: string, dbField: string) => {
    setFieldMappings(prev =>
      prev.map(m => (m.csvColumn === csvColumn ? { ...m, dbField } : m))
    );
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please load a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportResults(null);

    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to import data.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const contactData: Record<string, any> = {
          user_id: user.id,
        };

        // Map CSV values to database fields
        fieldMappings.forEach(mapping => {
          if (mapping.dbField !== "skip" && row[mapping.csvColumn]) {
            let value: any = row[mapping.csvColumn];
            
            // Convert numeric fields
            if (["loan_amount", "annual_revenue", "credit_score", "years_in_business"].includes(mapping.dbField)) {
              value = parseFloat(value.replace(/[,$]/g, "")) || null;
            }
            
            contactData[mapping.dbField] = value;
          }
        });

        // Ensure required fields
        if (!contactData.name && (contactData.first_name || contactData.last_name)) {
          contactData.name = `${contactData.first_name || ""} ${contactData.last_name || ""}`.trim();
        }
        if (!contactData.email) {
          contactData.email = `import-${Date.now()}-${i}@placeholder.com`;
        }
        if (!contactData.name) {
          contactData.name = contactData.email.split("@")[0];
        }

        const insertData = {
          email: contactData.email as string,
          name: contactData.name as string,
          user_id: contactData.user_id as string,
          ...contactData,
        };

        const { error } = await supabase
          .from("contact_entities")
          .insert(insertData);

        if (error) {
          results.failed++;
          if (results.errors.length < 5) {
            results.errors.push(`Row ${i + 1}: ${error.message}`);
          }
        } else {
          results.success++;
        }
      }

      setImportResults(results);

      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} of ${csvData.length} records.`,
        variant: results.failed > 0 ? "destructive" : "default",
      });

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImporter = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setFieldMappings([]);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Select CSV File
            </Button>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" />
                {file.name} ({csvData.length} rows)
              </div>
            )}
            {file && (
              <Button variant="ghost" size="sm" onClick={resetImporter}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Mapping */}
      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Map CSV Columns to Database Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fieldMappings.map(mapping => (
                <div key={mapping.csvColumn} className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{mapping.csvColumn}</label>
                  <Select
                    value={mapping.dbField}
                    onValueChange={(value) => updateFieldMapping(mapping.csvColumn, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_FIELDS.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview (First 5 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(header => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {headers.map(header => (
                        <TableCell key={header}>{row[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Alert variant={importResults.failed > 0 ? "destructive" : "default"}>
          <AlertDescription>
            <div className="flex items-center gap-4">
              {importResults.failed > 0 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Check className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="font-medium">
                  Imported {importResults.success} of {csvData.length} records
                </p>
                {importResults.errors.length > 0 && (
                  <ul className="text-sm mt-2">
                    {importResults.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Import Button */}
      {csvData.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-[#0f62fe] hover:bg-[#0353e9] text-white"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {csvData.length} Records
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
