import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Filter } from "lucide-react"

export default function LoanHistory() {
  const loans = [
    {
      id: "L001",
      borrower: "John Smith",
      type: "Conventional",
      amount: "$350,000",
      rate: "3.25%",
      term: "30 years",
      status: "Active",
      date: "2023-01-15",
      officer: "Alex Rodriguez"
    },
    {
      id: "L002",
      borrower: "Sarah Johnson",
      type: "FHA",
      amount: "$275,000",
      rate: "3.75%",
      term: "30 years",
      status: "Closed",
      date: "2023-02-20",
      officer: "Emma Thompson"
    },
    {
      id: "L003",
      borrower: "Mike Davis",
      type: "VA",
      amount: "$400,000",
      rate: "3.00%",
      term: "30 years",
      status: "In Process",
      date: "2023-03-10",
      officer: "James Wilson"
    },
    {
      id: "L004",
      borrower: "Lisa Chen",
      type: "Jumbo",
      amount: "$750,000",
      rate: "3.50%",
      term: "30 years",
      status: "Underwriting",
      date: "2023-03-25",
      officer: "Lisa Chen"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="text-green-800 font-medium">Active</span>
      case "Closed":
        return <span className="text-gray-600 font-medium">Closed</span>
      case "In Process":
        return <span className="text-blue-800 font-medium">In Process</span>
      case "Underwriting":
        return <span className="text-yellow-800 font-medium">Underwriting</span>
      default:
        return <span className="font-medium">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan History</h1>
        <p className="text-muted-foreground">
          Complete history of all loans and their current status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific loans using filters and search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search by borrower name, loan ID, or officer..."
                className="w-full"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="fha">FHA</SelectItem>
                <SelectItem value="va">VA</SelectItem>
                <SelectItem value="jumbo">Jumbo</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="in-process">In Process</SelectItem>
                <SelectItem value="underwriting">Underwriting</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Records</CardTitle>
          <CardDescription>
            All loan records with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-lg">{loan.borrower}</div>
                    <div className="text-sm text-muted-foreground">Loan ID: {loan.id}</div>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Loan Type</div>
                    <div className="font-medium">{loan.type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">{loan.amount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Rate & Term</div>
                    <div className="font-medium">{loan.rate} • {loan.term}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Loan Officer</div>
                    <div className="font-medium">{loan.officer}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Originated: {new Date(loan.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Documents
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}