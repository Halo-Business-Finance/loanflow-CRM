import { useState } from 'react';
import { Calculator, X, DollarSign, Percent, Calendar, TrendingUp } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5 border-border">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            Loan Calculator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Calculate your monthly payments and see the full breakdown
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Input Fields Section */}
          <div className="space-y-5">
            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Loan Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  id="amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="pl-8 h-12 text-lg font-medium bg-background border-2 border-border focus:border-primary transition-colors"
                  placeholder="250000"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Interest Rate (Annual)
              </Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="pr-8 h-12 text-lg font-medium bg-background border-2 border-border focus:border-primary transition-colors"
                  placeholder="6.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div className="space-y-2">
              <Label htmlFor="term" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Loan Term
              </Label>
              <div className="flex gap-3">
                <Input
                  id="term"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="flex-1 h-12 text-lg font-medium bg-background border-2 border-border focus:border-primary transition-colors"
                  placeholder="30"
                />
                <Select value={termUnit} onValueChange={(value: 'years' | 'months') => setTermUnit(value)}>
                  <SelectTrigger className="w-[140px] h-12 text-base font-medium bg-background border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="years" className="text-base">Years</SelectItem>
                    <SelectItem value="months" className="text-base">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Payment Breakdown</h3>
            </div>

            {/* Monthly Payment - Highlighted */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monthly Payment</p>
                  <p className="text-5xl font-bold text-primary animate-fade-in">
                    {formatCurrency(results.monthly)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on {termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`} at {interestRate}% APR
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-2 border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Amount Paid</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(results.total)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Interest</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(results.totalInterest)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Principal Display */}
            <Card className="bg-muted/30 border border-border">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Principal Amount</span>
                  <span className="text-lg font-semibold text-foreground">{formatCurrency(parseFloat(loanAmount) || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Interest Breakdown Visualization */}
            {results.total > 0 && (
              <Card className="bg-muted/30 border border-border">
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Composition</p>
                    <div className="flex gap-1 h-8 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground"
                        style={{ width: `${((parseFloat(loanAmount) || 0) / results.total) * 100}%` }}
                      >
                        {((parseFloat(loanAmount) || 0) / results.total * 100).toFixed(0)}%
                      </div>
                      <div 
                        className="bg-destructive flex items-center justify-center text-xs font-semibold text-destructive-foreground"
                        style={{ width: `${(results.totalInterest / results.total) * 100}%` }}
                      >
                        {(results.totalInterest / results.total * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-primary font-medium">● Principal</span>
                      <span className="text-destructive font-medium">Interest ●</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Button 
            onClick={() => setOpen(false)} 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            Close Calculator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
