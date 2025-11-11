# View Details Modal - Test Guide

## Feature Overview
The View Details modal shows comprehensive information about a savings plan including:
- Plan overview (title, contributing to, duration)
- Progress overview with visual indicators
- Timeline (start and end dates)
- Complete contributions history with dates
- Action buttons for adding contributions

## Test Steps

### 1. Basic Modal Functionality
- [ ] Navigate to Savings page
- [ ] Click "View Details" button on any savings plan card
- [ ] Verify modal opens with plan information
- [ ] Verify modal can be closed by clicking "Close" button
- [ ] Verify modal can be closed by clicking outside the modal

### 2. Plan Overview Section
- [ ] Verify plan title is displayed correctly
- [ ] Verify "Contributing to" field shows correct value
- [ ] Verify "Duration" shows correct savings frequency
- [ ] Verify status badge shows correct status with icon

### 3. Progress Overview Section
- [ ] Verify "Total Saved" amount is calculated correctly from contributions
- [ ] Verify "Target Amount" shows the plan's target
- [ ] Verify "Progress" percentage is calculated correctly
- [ ] Verify progress bar shows correct visual progress
- [ ] Verify amounts are formatted with currency symbol (₦)

### 4. Timeline Section
- [ ] Verify start date is displayed in full format (e.g., "Monday, January 01, 2025")
- [ ] Verify end date is displayed in full format
- [ ] Verify dates are formatted consistently

### 5. Contributions History Section
- [ ] Verify "Contributions History" header is displayed
- [ ] Verify contribution count is shown correctly
- [ ] If no contributions: Verify empty state with piggy bank icon
- [ ] If contributions exist: Verify each contribution shows:
  - [ ] Contribution number (reverse order)
  - [ ] Amount with currency formatting
  - [ ] Contribution date in full format
  - [ ] Created timestamp in short format
- [ ] Verify contributions are sorted by date (newest first)
- [ ] Verify scrollable area if many contributions exist

### 6. Action Buttons
- [ ] Verify "Add Contribution" button is present
- [ ] Verify "Add Contribution" button is disabled for completed plans
- [ ] Verify clicking "Add Contribution" closes details modal and opens contribution modal
- [ ] Verify "Close" button closes the modal

### 7. Responsive Design
- [ ] Test on desktop: Verify modal is appropriately sized
- [ ] Test on mobile: Verify modal is responsive and scrollable
- [ ] Verify all content is accessible on smaller screens

### 8. Data Accuracy
- [ ] Verify all amounts match the contributions data
- [ ] Verify progress calculations are accurate
- [ ] Verify status is calculated correctly based on contributions
- [ ] Verify dates are displayed in correct timezone

## Expected Behavior

### For Plans with No Contributions:
- Status: "Just Started" (gray badge)
- Progress: 0%
- Contributions History: Shows empty state with piggy bank icon
- "Add Contribution" button: Enabled

### For Plans with Partial Contributions:
- Status: "In Progress" (blue badge)
- Progress: Shows actual percentage based on contributions
- Contributions History: Shows all contributions with dates
- "Add Contribution" button: Enabled

### For Completed Plans:
- Status: "Completed" (green badge)
- Progress: 100% or more
- Contributions History: Shows all contributions
- "Add Contribution" button: Disabled

## Debug Information
Check browser console for:
- Plan data being passed to modal
- Contribution calculations
- Date formatting
- Any errors in modal rendering

## Common Issues to Check
1. **Date Formatting**: Ensure all dates display correctly
2. **Amount Calculations**: Verify totals are calculated from actual contributions
3. **Modal State**: Ensure modal opens/closes properly
4. **Responsive Layout**: Verify modal works on all screen sizes
5. **Data Consistency**: Ensure modal data matches card data 