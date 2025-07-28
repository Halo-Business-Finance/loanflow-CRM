import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { Plus, DollarSign, Calendar, Percent, Trash2 } from "lucide-react"

interface Loan {
  id: string
  loan_amount: number
  interest_rate?: number
  loan_term_months?: number
  maturity_date?: string
  loan_type: string
  status: string
  origination_date: string
  monthly_payment?: number
  remaining_balance?: number
  notes?: string
}

interface LoanManagerProps {
  clientId: string
  clientName: string
  loans: Loan[]
  onLoansUpdate: () => void
}

export function LoanManager({ clientId, clientName, loans, onLoansUpdate }: LoanManagerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false)
  const [newLoan, setNewLoan] = useState({
    loan_amount: "",
    interest_rate: "",
    loan_term_months: "",
    loan_type: "SBA 7(a) Loan",
    status: "Active",
    monthly_payment: "",
    remaining_balance: "",
    notes: ""
  })

  const addLoan = async () => {
    try {
      if (!newLoan.loan_amount) {
        toast({
          title: "Error",
          description: "Loan amount is required",
          variant: "destructive",
        })
        return
      }

      const loanAmount = parseFloat(newLoan.loan_amount)
      const interestRate = newLoan.interest_rate ? parseFloat(newLoan.interest_rate) : null
      const termMonths = newLoan.loan_term_months ? parseInt(newLoan.loan_term_months) : null
      const monthlyPayment = newLoan.monthly_payment ? parseFloat(newLoan.monthly_payment) : null
      const remainingBalance = newLoan.remaining_balance ? parseFloat(newLoan.remaining_balance) : loanAmount

      // Calculate maturity date if term is provided
      let maturityDate = null
      if (termMonths) {
        const maturity = new Date()
        maturity.setMonth(maturity.getMonth() + termMonths)
        maturityDate = maturity.toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('loans')
        .insert({
          user_id: user?.id,
          client_id: clientId,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_term_months: termMonths,
          maturity_date: maturityDate,
          loan_type: newLoan.loan_type,
          status: newLoan.status,
          monthly_payment: monthlyPayment,
          remaining_balance: remainingBalance,
          notes: newLoan.notes || null
        })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Loan added successfully",
      })

      setIsAddLoanOpen(false)
      setNewLoan({
        loan_amount: "",
        interest_rate: "",
        loan_term_months: "",
        loan_type: "SBA 7(a) Loan",
        status: "Active",
        monthly_payment: "",
        remaining_balance: "",
        notes: ""
      })
      onLoansUpdate()
    } catch (error) {
      console.error('Error adding loan:', error)
      toast({
        title: "Error",
        description: "Failed to add loan",
        variant: "destructive",
      })
    }
  }

  const deleteLoan = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId)

      if (error) throw error

      toast({
        title: "Success!",
        description: "Loan deleted successfully",
      })

      onLoansUpdate()
    } catch (error) {
      console.error('Error deleting loan:', error)
      toast({
        title: "Error",
        description: "Failed to delete loan",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default'
      case 'paid off': return 'secondary'
      case 'defaulted': return 'destructive'
      default: return 'secondary'
    }
  }

  const getLoanTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sba 7(a) loan': return 'default'
      case 'sba 504 loan': return 'secondary'
      case 'bridge loan': return 'destructive'
      case 'conventional loan': return 'outline'
      case 'equipment financing': return 'default'
      case 'usda b&i loan': return 'secondary'
      case 'working capital loan': return 'outline'
      case 'line of credit': return 'default'
      case 'land loan': return 'secondary'
      case 'factoring': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Loan Information</h3>
        <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Loan for {clientName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_amount">Loan Amount *</Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    placeholder="450000"
                    value={newLoan.loan_amount}
                    onChange={(e) => setNewLoan({ ...newLoan, loan_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    placeholder="6.5"
                    value={newLoan.interest_rate}
                    onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_type">Loan Type</Label>
                  <Select value={newLoan.loan_type} onValueChange={(value) => setNewLoan({ ...newLoan, loan_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SBA 7(a) Loan">SBA 7(a) Loan</SelectItem>
                      <SelectItem value="SBA 504 Loan">SBA 504 Loan</SelectItem>
                      <SelectItem value="Bridge Loan">Bridge Loan</SelectItem>
                      <SelectItem value="Conventional Loan">Conventional Loan</SelectItem>
                      <SelectItem value="Equipment Financing">Equipment Financing</SelectItem>
                      <SelectItem value="USDA B&I Loan">USDA B&I Loan</SelectItem>
                      <SelectItem value="Working Capital Loan">Working Capital Loan</SelectItem>
                      <SelectItem value="Line of Credit">Line of Credit</SelectItem>
                      <SelectItem value="Land Loan">Land Loan</SelectItem>
                      <SelectItem value="Factoring">Factoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="loan_term">Term (Months)</Label>
                  <Input
                    id="loan_term"
                    type="number"
                    placeholder="360"
                    value={newLoan.loan_term_months}
                    onChange={(e) => setNewLoan({ ...newLoan, loan_term_months: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_payment">Monthly Payment</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    placeholder="2500"
                    value={newLoan.monthly_payment}
                    onChange={(e) => setNewLoan({ ...newLoan, monthly_payment: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newLoan.status} onValueChange={(value) => setNewLoan({ ...newLoan, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paid Off">Paid Off</SelectItem>
                      <SelectItem value="Defaulted">Defaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="remaining_balance">Remaining Balance</Label>
                <Input
                  id="remaining_balance"
                  type="number"
                  placeholder="420000"
                  value={newLoan.remaining_balance}
                  onChange={(e) => setNewLoan({ ...newLoan, remaining_balance: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional loan details..."
                  value={newLoan.notes}
                  onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddLoanOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addLoan}>Add Loan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No loans found for this client.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">${loan.loan_amount.toLocaleString()}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={getLoanTypeColor(loan.loan_type)}>{loan.loan_type}</Badge>
                        <Badge variant={getStatusColor(loan.status)}>{loan.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteLoan(loan.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {loan.interest_rate && (
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium">{loan.interest_rate}%</span>
                    </div>
                  )}
                  {loan.loan_term_months && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Term:</span>
                      <span className="font-medium">{loan.loan_term_months} months</span>
                    </div>
                  )}
                  {loan.monthly_payment && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium">${loan.monthly_payment.toLocaleString()}</span>
                    </div>
                  )}
                  {loan.remaining_balance && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-medium">${loan.remaining_balance.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {loan.maturity_date && (
                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Maturity Date:</span>
                      <span className="font-medium ml-2">
                        {new Date(loan.maturity_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {loan.notes && (
                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1">{loan.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}