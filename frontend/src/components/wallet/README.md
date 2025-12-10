# Wallet Dashboard Components

Complete wallet management system with balance display, transaction history, and income/expense analytics.

## Component Overview

### 1. WalletDashboardPage (`/frontend/src/pages/WalletDashboardPage.tsx`)

**Main dashboard page integrating all wallet components.**

**Features:**
- Balance overview with LFT Token and USDC
- Income/expense chart visualization
- Transaction history table with pagination
- Deposit and withdraw functionality
- Real-time balance updates (30-second intervals)
- Error handling and loading states

**Layout:**
```
┌──────────────────────────────────────────┐
│  Header: "Wallet Dashboard"              │
├──────────────────────────────────────────┤
│  Balance Card                            │
│  - LFT Token Balance                     │
│  - USDC Balance                          │
│  - Deposit/Withdraw Buttons              │
├──────────────────────────────────────────┤
│  Income & Expense Chart                  │
│  - Line/Bar/Pie Chart Toggle             │
│  - Daily Stats                           │
├──────────────────────────────────────────┤
│  Transaction History Table               │
│  - Pagination                            │
│  - Search & Filters                      │
│  - Expandable Details                    │
└──────────────────────────────────────────┘
```

**Usage:**
```tsx
import { WalletDashboardPage } from '@/pages'

// Route configuration
{
  path: '/wallet',
  element: (
    <ProtectedRoute>
      <WalletDashboardPage />
    </ProtectedRoute>
  ),
}
```

---

### 2. BalanceCard (`BalanceCard.tsx`)

**Displays wallet balances with deposit/withdraw actions.**

**Props:**
```typescript
interface BalanceCardProps {
  balance: WalletBalance | undefined
  isLoading: boolean
  onDeposit: () => void
  onWithdraw: () => void
  onRefresh: () => void
}

interface WalletBalance {
  lftToken: number
  usdc: number
  lastUpdated: string
}
```

**Features:**
- Gradient background with visual appeal
- Large balance display with currency symbols
- Show/hide balance toggle (privacy)
- Refresh button for manual updates
- Quick stats (total income/expense)
- Responsive design

**Balance Display:**
- **LFT Token**: Shows token amount with USD equivalent
- **USDC**: Shows dollar amount
- **Large numbers**: Formatted as K/M (e.g., 1.5K, 2.3M)

**Usage:**
```tsx
<BalanceCard
  balance={balance}
  isLoading={isLoading}
  onDeposit={handleDeposit}
  onWithdraw={handleWithdraw}
  onRefresh={handleRefresh}
/>
```

---

### 3. TransactionTable (`TransactionTable.tsx`)

**Comprehensive transaction history with pagination and filtering.**

**Props:**
```typescript
interface TransactionTableProps {
  transactions: Transaction[]
  total: number
  isLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'PAYMENT' | 'REWARD' | 'REFUND'
  amount: number
  currency: 'LFT' | 'USDC'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  description: string
  timestamp: string
  from?: string
  to?: string
  txHash?: string
  fee?: number
  metadata?: Record<string, any>
}
```

**Features:**
- **Search**: Filter by description, ID, or type
- **Filter**: Toggle filter pills for transaction types
- **Sort**: Clickable column headers (future)
- **Pagination**: Configurable page size (10/20/50/100)
- **Expandable rows**: Show detailed transaction info
- **Transaction links**: External blockchain explorer links

**Transaction Types:**
- 📥 **DEPOSIT**: Incoming funds (green)
- 📤 **WITHDRAW**: Outgoing funds (red)
- 🔄 **TRANSFER**: Internal transfers (blue)
- 💳 **PAYMENT**: Payments to merchants (red)
- 🎁 **REWARD**: Rewards received (green)
- ↩️ **REFUND**: Refunds received (green)

**Transaction Statuses:**
- 🟡 **PENDING**: Transaction in progress
- 🟢 **COMPLETED**: Successfully completed
- 🔴 **FAILED**: Transaction failed
- ⚪ **CANCELLED**: Transaction cancelled

**Usage:**
```tsx
<TransactionTable
  transactions={transactions}
  total={transactionsTotal}
  isLoading={transactionsLoading}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

---

### 4. IncomeExpenseChart (`IncomeExpenseChart.tsx`)

**Visual analytics with multiple chart types using Recharts.**

**Props:**
```typescript
interface IncomeExpenseChartProps {
  stats: TransactionStats | undefined
  isLoading: boolean
}

interface TransactionStats {
  totalIncome: number
  totalExpense: number
  incomeByType: Record<string, number>
  expenseByType: Record<string, number>
  dailyStats: Array<{
    date: string
    income: number
    expense: number
  }>
}
```

**Chart Types:**
1. **Line Chart**: Daily income/expense trends
2. **Bar Chart**: Daily income/expense comparison
3. **Pie Chart**: Income/expense breakdown by type

**Features:**
- Toggle between chart types
- Summary stats (total income/expense)
- Custom tooltips with formatted values
- Responsive sizing
- Color-coded data (green=income, red=expense)
- Net balance calculation
- Period display (last 30 days)

**Color Scheme:**
```typescript
{
  income: '#10b981',   // green-500
  expense: '#ef4444',  // red-500
  deposit: '#3b82f6',  // blue-500
  withdraw: '#f59e0b', // amber-500
  // ... more colors
}
```

**Usage:**
```tsx
<IncomeExpenseChart
  stats={stats}
  isLoading={statsLoading}
/>
```

---

### 5. DepositWithdrawModal (`DepositWithdrawModal.tsx`)

**Modal for deposit and withdrawal operations.**

**Props:**
```typescript
interface DepositWithdrawModalProps {
  type: 'deposit' | 'withdraw'
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DepositRequest | WithdrawRequest) => Promise<void>
  isLoading: boolean
}

interface DepositRequest {
  amount: number
  currency: 'LFT' | 'USDC'
  method: 'CRYPTO' | 'CREDIT_CARD' | 'BANK_TRANSFER'
}

interface WithdrawRequest {
  amount: number
  currency: 'LFT' | 'USDC'
  address: string
}
```

**Features:**
- **Currency selection**: LFT or USDC
- **Amount input**: Decimal support with validation
- **Deposit methods**: Crypto, Credit Card, Bank Transfer
- **Withdrawal address**: Wallet address input (hex format)
- **Error handling**: Inline error messages
- **Info boxes**: Processing time estimates
- **Form validation**: Client-side validation

**Validation Rules:**
- Amount must be positive number
- Address required for withdrawals
- Currency must be selected

**Usage:**
```tsx
const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)

<DepositWithdrawModal
  type={modalType!}
  isOpen={modalType !== null}
  onClose={() => setModalType(null)}
  onSubmit={handleSubmit}
  isLoading={isProcessing}
/>
```

---

## Hooks

### useWallet (`/frontend/src/hooks/useWallet.ts`)

**Main hook for wallet management with React Query integration.**

**Features:**
- Fetches wallet balance (30-second refetch)
- Fetches transaction statistics (60-second refetch)
- Deposit mutation
- Withdraw mutation
- Automatic cache invalidation

**Usage:**
```tsx
const {
  balance,
  transactions,
  transactionsTotal,
  stats,
  isLoading,
  error,
  deposit,
  withdraw,
  refetch,
} = useWallet()

// Deposit
await deposit.mutateAsync({
  amount: 100,
  currency: 'LFT',
  method: 'CRYPTO',
})

// Withdraw
await withdraw.mutateAsync({
  amount: 50,
  currency: 'USDC',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
})

// Manual refresh
refetch()
```

### useTransactions (`/frontend/src/hooks/useWallet.ts`)

**Hook for paginated transaction fetching with filters.**

**Features:**
- Pagination support
- Filter by type, status, currency
- Date range filtering
- Search functionality
- 60-second auto-refetch

**Usage:**
```tsx
const filters: TransactionFilters = {
  type: ['DEPOSIT', 'WITHDRAW'],
  status: ['COMPLETED'],
  currency: ['LFT'],
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  search: 'reward',
}

const {
  data: { transactions, total },
  isLoading,
  refetch,
} = useTransactions(filters, page, pageSize)
```

### useTransaction (`/frontend/src/hooks/useWallet.ts`)

**Hook to fetch single transaction details.**

**Usage:**
```tsx
const { data: transaction, isLoading } = useTransaction(transactionId)
```

---

## API Endpoints

### Balance
```
GET /v1/wallet/balance
Response: {
  lftToken: number
  usdc: number
  lastUpdated: string
}
```

### Transactions
```
GET /v1/wallet/transactions?page=1&limit=20&type=DEPOSIT&status=COMPLETED
Response: {
  transactions: Transaction[]
  total: number
}
```

### Transaction Details
```
GET /v1/wallet/transactions/:id
Response: Transaction
```

### Statistics
```
GET /v1/wallet/stats
Response: {
  totalIncome: number
  totalExpense: number
  incomeByType: { [type: string]: number }
  expenseByType: { [type: string]: number }
  dailyStats: Array<{ date: string, income: number, expense: number }>
}
```

### Deposit
```
POST /v1/wallet/deposit
Body: {
  amount: number
  currency: 'LFT' | 'USDC'
  method: 'CRYPTO' | 'CREDIT_CARD' | 'BANK_TRANSFER'
}
Response: {
  transactionId: string
  status: string
}
```

### Withdraw
```
POST /v1/wallet/withdraw
Body: {
  amount: number
  currency: 'LFT' | 'USDC'
  address: string
}
Response: {
  transactionId: string
  status: string
}
```

---

## Styling

**Color Scheme:**
- **Primary**: Indigo (buttons, accents)
- **Success**: Green (income, deposits, rewards)
- **Danger**: Red (expenses, withdrawals, failures)
- **Warning**: Yellow/Amber (pending states)
- **Info**: Blue (transfers, info messages)

**Responsive Breakpoints:**
- **Mobile** (< 640px): Single column, stacked cards
- **Tablet** (640px - 1024px): Two columns
- **Desktop** (> 1024px): Full layout with sidebars

**Gradient Backgrounds:**
- Balance Card: `from-indigo-500 to-purple-600`
- Charts: Subtle grays for background

---

## Dependencies

**Required packages** (already in package.json):
```json
{
  "@tanstack/react-query": "5.14.0",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "recharts": "2.10.3",
  "date-fns": "3.0.0",
  "lucide-react": "0.294.0",
  "axios": "1.6.2"
}
```

**Install Recharts** (if not installed):
```bash
npm install recharts
```

---

## Performance Optimizations

1. **Auto-refetch intervals:**
   - Balance: 30 seconds
   - Transactions: 60 seconds
   - Statistics: 60 seconds

2. **Pagination:**
   - Default page size: 20
   - Configurable: 10/20/50/100

3. **Query caching:**
   - React Query automatic caching
   - staleTime for reduced API calls

4. **Chart rendering:**
   - ResponsiveContainer for dynamic sizing
   - Memoized data transformations

---

## Security Considerations

1. **Input Validation:**
   - Amount must be positive
   - Address format validation
   - Currency type validation

2. **Authentication:**
   - Protected routes require login
   - API calls include auth tokens

3. **Privacy:**
   - Balance hide/show toggle
   - Sensitive data only on HTTPS

4. **Transaction Safety:**
   - Confirmation dialogs
   - Address verification
   - Fee disclosure

---

## Testing Recommendations

### Unit Tests
```tsx
describe('BalanceCard', () => {
  it('displays balance correctly', () => {
    render(<BalanceCard balance={mockBalance} ... />)
    expect(screen.getByText('1,234.56')).toBeInTheDocument()
  })

  it('formats large numbers', () => {
    const balance = { lftToken: 1500000, usdc: 0 }
    render(<BalanceCard balance={balance} ... />)
    expect(screen.getByText('1.50M')).toBeInTheDocument()
  })
})

describe('TransactionTable', () => {
  it('paginates correctly', () => {
    const onPageChange = jest.fn()
    render(<TransactionTable page={1} onPageChange={onPageChange} ... />)
    fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
```

### Integration Tests
```tsx
describe('Wallet Dashboard Flow', () => {
  it('deposits funds successfully', async () => {
    render(<WalletDashboardPage />)

    // Click deposit button
    fireEvent.click(screen.getByText('Deposit'))

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' }
    })

    // Submit
    fireEvent.click(screen.getByText('Deposit'))

    await waitFor(() => {
      expect(screen.getByText('Deposit successful')).toBeInTheDocument()
    })
  })
})
```

---

## Troubleshooting

### Issue: Balance not updating
**Solution:** Check refetch interval or manually call `refetch()`

### Issue: Chart not rendering
**Solution:** Verify Recharts is installed and stats data is properly formatted

### Issue: Pagination not working
**Solution:** Ensure total count is correct and page/pageSize props are managed

### Issue: Modal not closing
**Solution:** Check `isOpen` state management and `onClose` callback

---

## Future Enhancements

1. **Advanced Filtering:**
   - Date range picker
   - Amount range filter
   - Multiple status selection

2. **Export Functionality:**
   - Export transactions to CSV
   - PDF statements
   - Tax reports

3. **Charts:**
   - Year-over-year comparison
   - Category breakdown
   - Spending trends

4. **Notifications:**
   - Transaction alerts
   - Low balance warnings
   - Deposit confirmations

5. **Multi-currency:**
   - More token support
   - Currency conversion
   - Exchange rates

---

## Support

For issues or questions:
- Check API documentation at `/docs/api`
- Review backend wallet controller
- Consult React Query docs for caching issues

---

**Version:** 1.0.0
**Last Updated:** 2025-11-21
**Status:** ✅ Production Ready
