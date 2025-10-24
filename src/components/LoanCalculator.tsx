import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function LoanCalculator() {
  const [open, setOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');

  const calculatePayment = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100;
    const term = parseFloat(loanTerm) || 0;
    
    if (principal <= 0 || rate < 0 || term <= 0) {
      return { monthly: 0, total: 0, totalInterest: 0 };
    }

    // Convert term to months
    const months = termUnit === 'years' ? term * 12 : term;
    
    // Monthly interest rate
    const monthlyRate = rate / 12;
    
    // Calculate monthly payment using standard loan formula
    // Handle both interest-bearing and zero-interest loans
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      // Zero interest loan - simple division
      monthlyPayment = principal / months;
    } else {
      // Standard amortization formula
      monthlyPayment = 
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    // Check for invalid results
    if (!isFinite(monthlyPayment) || isNaN(monthlyPayment)) {
      return { monthly: 0, total: 0, totalInterest: 0 };
    }

    return {
      monthly: monthlyPayment,
      total: totalPayment,
      totalInterest: totalInterest
    };
  };

  const results = calculatePayment();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
          title="Loan Calculator"
        >
          <Calculator className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#262626] border-[#e0e0e0] dark:border-[#393939]">
        <DialogHeader>
          <DialogTitle className="text-[#161616] dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Calculator
          </DialogTitle>
          <DialogDescription className="text-[#525252] dark:text-gray-400">
            Calculate monthly payments and total loan costs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loan Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[#161616] dark:text-white">
              Loan Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="bg-white dark:bg-[#393939] border-[#e0e0e0] dark:border-[#525252] text-[#161616] dark:text-white"
              placeholder="250000"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="rate" className="text-[#161616] dark:text-white">
              Interest Rate (%)
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="bg-white dark:bg-[#393939] border-[#e0e0e0] dark:border-[#525252] text-[#161616] dark:text-white"
              placeholder="6.5"
            />
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label htmlFor="term" className="text-[#161616] dark:text-white">
              Loan Term
            </Label>
            <div className="flex gap-2">
              <Input
                id="term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="flex-1 bg-white dark:bg-[#393939] border-[#e0e0e0] dark:border-[#525252] text-[#161616] dark:text-white"
                placeholder="30"
              />
              <Select value={termUnit} onValueChange={(value: 'years' | 'months') => setTermUnit(value)}>
                <SelectTrigger className="w-[120px] bg-white dark:bg-[#393939] border-[#e0e0e0] dark:border-[#525252] text-[#161616] dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <Card className="bg-[#f4f4f4] dark:bg-[#161616] border-[#e0e0e0] dark:border-[#393939]">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#e0e0e0] dark:border-[#393939]">
                <span className="text-sm text-[#525252] dark:text-gray-400">Monthly Payment</span>
                <span className="text-2xl font-light text-[#0f62fe]">
                  {formatCurrency(results.monthly)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252] dark:text-gray-400">Total Amount Paid</span>
                <span className="text-base font-normal text-[#161616] dark:text-white">
                  {formatCurrency(results.total)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252] dark:text-gray-400">Total Interest</span>
                <span className="text-base font-normal text-[#161616] dark:text-white">
                  {formatCurrency(results.totalInterest)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#e0e0e0] dark:border-[#393939]">
                <div className="flex justify-between items-center text-xs text-[#525252] dark:text-gray-400">
                  <span>Principal</span>
                  <span>{formatCurrency(parseFloat(loanAmount) || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => setOpen(false)} 
            className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
