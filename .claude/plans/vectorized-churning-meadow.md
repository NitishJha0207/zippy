# Invoice Generator Application - Implementation Plan

## Overview
Building a full-featured invoice generator with authentication, onboarding, and professional invoice creation following the Spice Route Catering format.

## Database Schema

### Tables to Create

**profiles** - User/company information
- id (UUID, references auth.users)
- user_name, mobile_number, email
- company_name, company_address, gstin
- company_logo_url (Supabase Storage)
- Timestamps

**customers** - Saved customer database
- id (UUID), user_id (FK)
- name, address, gstin, state
- Timestamps

**invoices** - Invoice headers
- id (UUID), user_id (FK)
- invoice_number, invoice_date
- Bill To Party: name, address, gstin, state
- Ship To Party: name, address, gstin, state
- Metadata: transport_mode, vehicle_number, reverse_charge, place_of_supply
- Totals: subtotal, cgst_total, sgst_total, total_tax, grand_total
- bank_name, account_number, ifsc_code
- terms_conditions

**invoice_items** - Line items
- id (UUID), invoice_id (FK)
- product_description, students_staff (custom field)
- hsn_code, rate, quantity, amount
- gst_rate, taxable_value, cgst, sgst
- item_order

**invoice_sequence** - Auto-generate invoice numbers
- user_id (PK)
- last_invoice_number (INTEGER)
- prefix (default 'INV')

**Storage Bucket**: company-logos (public)

All tables use RLS policies to ensure users only access their own data.

## Architecture Decisions

1. **Auth**: Supabase Auth with email/password
2. **Storage**: Supabase Storage for company logos
3. **Invoice Numbers**: Auto-generated sequential (INV-001, INV-002) with manual override
4. **Calculations**: Client-side real-time GST calculations
5. **Print**: Browser native print API with CSS media queries
6. **Sharing**: WhatsApp (wa.me URL), Email (mailto:), Print/PDF
7. **Routing**: Start with conditional rendering, suggest react-router-dom later
8. **State**: Local state + Context for auth

## File Structure

```
src/
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Calculations, formatting
├── types/
│   ├── database.types.ts        # DB types
│   └── invoice.types.ts         # Invoice types
├── contexts/
│   └── AuthContext.tsx          # Auth state
├── hooks/
│   ├── useAuth.ts
│   ├── useProfile.ts
│   ├── useInvoices.ts
│   └── useCustomers.ts
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignUpForm.tsx
│   ├── onboarding/
│   │   ├── OnboardingForm.tsx
│   │   └── LogoUpload.tsx
│   ├── invoice/
│   │   ├── InvoiceGenerator.tsx
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoiceMetadata.tsx
│   │   ├── PartyDetails.tsx
│   │   ├── InvoiceItemsTable.tsx
│   │   ├── InvoiceItemRow.tsx
│   │   ├── InvoiceSummary.tsx
│   │   ├── BankDetails.tsx
│   │   └── TermsConditions.tsx
│   ├── print/
│   │   └── PrintableInvoice.tsx # Spice Route format
│   ├── customers/
│   │   └── CustomerSelector.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
└── pages/
    ├── AuthPage.tsx
    ├── OnboardingPage.tsx
    └── DashboardPage.tsx
```

## Implementation Phases

### Phase 1: Foundation
1. Create Supabase migration with all tables and RLS policies
2. Initialize Supabase client (src/lib/supabase.ts)
3. Create type definitions (src/types/)
4. Build AuthContext with sign up/in/out
5. Create reusable UI components

### Phase 2: Authentication
6. Build LoginForm and SignUpForm
7. Create AuthPage with login/signup toggle
8. Implement ProtectedRoute guard
9. Add session management

### Phase 3: Onboarding
10. Build LogoUpload component (Supabase Storage)
11. Create OnboardingForm with validation
12. Build useProfile hook
13. Create OnboardingPage

### Phase 4: Core Invoice Logic
14. Build utility functions (GST calculations, formatting)
15. Create useInvoices hook (CRUD operations)
16. Create useCustomers hook
17. Build invoice number generation

### Phase 5: Invoice Form Components
18. InvoiceMetadata (invoice #, date, transport details)
19. PartyDetails (reusable for Bill To/Ship To)
20. InvoiceItemRow with real-time GST calculations
21. InvoiceItemsTable
22. InvoiceSummary (totals display)
23. BankDetails and TermsConditions
24. CustomerSelector dropdown

### Phase 6: Invoice Form Integration
25. Build InvoiceForm container
26. Integrate all sub-components
27. Implement state management
28. Add real-time calculation updates
29. Create DashboardPage with pre-filled company data

### Phase 7: Print & Preview
30. Build PrintableInvoice matching Spice Route format
31. Add print styles (@media print)
32. Create preview modal
33. Implement print functionality (window.print)

### Phase 8: Sharing Features
34. WhatsApp sharing (wa.me URL)
35. Email sharing (mailto:)
36. PDF download (browser print to PDF)

### Phase 9: Layout & Routing
37. Build Layout and Header components
38. Update App.tsx with routing logic
39. Add loading states and error handling

### Phase 10: Polish
40. Responsive design
41. Form validation
42. Error notifications
43. Loading spinners
44. Testing and fixes

## GST Calculation Logic

```typescript
// Per line item
const amount = rate * quantity;
const taxableValue = amount;
const gstAmount = (taxableValue * gstRate) / 100;
const cgst = gstAmount / 2;
const sgst = gstAmount / 2;
const itemTotal = taxableValue + cgst + sgst;

// Invoice totals
const subtotal = sum(all taxable values);
const cgstTotal = sum(all CGST);
const sgstTotal = sum(all SGST);
const totalTax = cgstTotal + sgstTotal;
const grandTotal = subtotal + totalTax;
```

## Invoice Format (Spice Route Style)

Header:
- Company name, address, GSTIN (pre-filled from profile)
- Company logo
- "Original Tax Invoice" title

Metadata:
- Invoice No, Date
- Transport Mode, Vehicle Number
- Reverse Charge, Place of Supply
- State

Body:
- Bill To Party | Ship To Party (side by side)
- Line items table with columns:
  - S.No | Product Description | Students/Staff | Rate | Amount | HSN CODE | Taxable Value | GST (Rate/Amount) | Total

Footer:
- Total row
- Invoice amount in words
- Totals breakdown (right side):
  - Total Amount before Tax
  - CGST 2.5% (or calculated rate)
  - SGST 2.5%
  - Total Tax Amount
  - Total Amount after Tax
  - GST on Reverse Charge
- Bank Details (left side)
- Terms & conditions
- Authorized signatory

## Additional Packages

```bash
npm install react-router-dom date-fns react-hot-toast
```

## Environment Variables

Already configured in .env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Critical Implementation Notes

1. **RLS is mandatory** - Every table must have policies
2. **Logo upload** - Use user-specific folders (user_id/logo.png)
3. **Invoice numbers** - Sequential per user with transaction safety
4. **Real-time calculations** - Update GST on every rate/quantity/GST rate change
5. **Print styles** - Hide UI elements, show only PrintableInvoice
6. **Customer reuse** - Save time by storing frequently used customers
7. **Form validation** - GSTIN format (15 chars), mobile (10 digits)
8. **Error handling** - Toast notifications for all operations
9. **Loading states** - Show during auth, data fetch, save operations

## Success Metrics

- User can sign up and onboard in < 3 minutes
- User can create first invoice in < 5 minutes
- Invoice print matches sample format exactly
- All calculations are accurate
- Share functionality works on mobile and desktop
- Application is responsive on all screen sizes

## Future Enhancements

- Multiple invoice templates
- Recurring invoices
- Payment tracking
- Analytics dashboard
- Export to Excel
- QR code on invoice
- E-invoice compliance
