# Nigerian HR Apps Research — For Leave Management Integration
_Compiled 2026-07-02_

---

## Top Nigerian HR/Payroll Platforms

### 1. Bujeti (bujeti.com)
- **Focus**: Finance control centre for African businesses
- **HR Features**: Payroll, expense management, corporate cards
- **Leave Management**: Not explicitly mentioned
- **API**: Available on Scale+ plan
- **Integration Potential**: HIGH — already has payroll, could sync leave data
- **Pricing**: ₦17K-35K/user/month

### 2. PayrollPanda (payrollpanda.com.ng)
- **Focus**: Nigerian payroll and HR
- **HR Features**: Full payroll, PAYE, pension, NHF
- **Leave Management**: Likely has leave tracking
- **API**: Unknown
- **Integration Potential**: MEDIUM — payroll focused
- **Pricing**: Custom

### 3. Zoho People (zoho.com/ng/people)
- **Focus**: Global HR suite with Nigerian presence
- **HR Features**: Leave management, attendance, performance
- **Leave Management**: FULL — leave types, balances, approvals
- **API**: Full REST API
- **Integration Potential**: HIGH — robust API, widely used
- **Pricing**: ₦2,500/user/month

### 4. BambooHR (bamboohr.com)
- **Focus**: HR software for SMBs
- **HR Features**: Leave tracking, onboarding, performance
- **Leave Management**: FULL — leave requests, balances, accrual
- **API**: Full REST API
- **Integration Potential**: HIGH — excellent API
- **Pricing**: $6+/employee/month

### 5. Freshteam (freshteam.com)
- **Focus**: HR software by Freshworks
- **HR Features**: Leave management, recruitment, onboarding
- **Leave Management**: FULL — leave types, approval workflows
- **API**: REST API available
- **Integration Potential**: MEDIUM-HIGH
- **Pricing**: Free for 50 employees

### 6. Grey (grey.co)
- **Focus**: African payroll and HR
- **HR Features**: Payroll, compliance, contractor payments
- **Leave Management**: Unknown
- **API**: Available
- **Integration Potential**: MEDIUM
- **Pricing**: Custom

### 7. Scale (usescale.com)
- **Focus**: African HR and payroll
- **HR Features**: Payroll, benefits, compliance
- **Leave Management**: Unknown
- **API**: Available
- **Integration Potential**: MEDIUM
- **Pricing**: Custom

---

## Integration Strategy

### Option A: Build Leave Management Into Aura
- **Pros**: Full control, no external dependency, better UX
- **Cons**: More development effort, need to maintain
- **Best for**: If leave management is a core feature

### Option B: Integrate with Zoho People
- **Pros**: Robust leave management, widely used, good API
- **Cons**: External dependency, cost per user
- **Best for**: Quick time-to-market

### Option C: Integrate with BambooHR
- **Pros**: Excellent API, good leave features, international support
- **Cons**: More expensive, less Nigeria-focused
- **Best for**: International teams

### Option D: Build Leave Management + Export to HR Apps
- **Pros**: Aura handles leave, exports to payroll providers
- **Cons**: Two systems to maintain
- **Best for**: Hybrid approach

---

## Recommendation

**Build leave management into Aura** with these features:

1. **Leave types** — Annual, Sick, Maternity, Paternity, Compassionate
2. **Leave balances** — Track days available per type
3. **Leave requests** — Submit, approve, reject
4. **Leave calendar** — Visual calendar view
5. **Leave accrual** — Auto-accrue based on tenure
6. **Public holidays** — Nigerian public holidays calendar
7. **Integration export** — Export leave data to payroll providers

This gives Aura a complete HR module without external dependencies.
