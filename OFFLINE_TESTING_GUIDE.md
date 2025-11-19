# SheBalance Offline Mode Testing Guide

## Overview
This guide provides comprehensive testing procedures to verify the offline-first functionality of SheBalance. All critical operations should work seamlessly when offline and sync automatically when connectivity is restored.

## Setup: Simulating Offline Mode

### Method 1: Browser DevTools (Recommended)
1. Open the application in your browser
2. Press `F12` to open DevTools
3. Go to the **Network** tab
4. Check the **Offline** checkbox at the top
5. The app will now behave as if there's no internet connection

### Method 2: Chrome DevTools Advanced
1. Open DevTools (`F12`)
2. Click the three dots menu → More tools → Network conditions
3. Uncheck "Use browser default"
4. Select "Offline" from the dropdown

### Verification
- Look for the offline indicator in the app UI
- The app should show you're in offline mode
- Operations should display "Saved locally. Will sync when online." messages

## Test Scenarios

### 1. Sales Operations (Critical)

#### Test 1.1: Create Sale While Offline
**Steps:**
1. Go offline using DevTools
2. Navigate to Sales → Add Sale
3. Add multiple products to cart (e.g., 2x Drawing Book, 1x Caramel cream)
4. Complete the checkout process

**Expected Results:**
- ✅ Sale is created successfully
- ✅ Toast message: "Sale saved offline! It will sync when you're back online."
- ✅ Product quantities decrease immediately in the UI
- ✅ Sale appears in the Sales list
- ✅ Cart is cleared
- ✅ No errors or "Processing..." hang state

**Verification:**
- Open browser console (F12)
- Look for log: "📴 Offline: Product quantities queued for sync + cache updated for UI"
- Check IndexedDB (DevTools → Application → IndexedDB → offlineQueue)
- Verify queued operations for: sale creation, product updates

#### Test 1.2: Delete Sale While Offline
**Steps:**
1. Stay offline
2. Navigate to Sales page
3. Delete an existing sale

**Expected Results:**
- ✅ Toast: "Sale deleted successfully! Changes saved locally."
- ✅ Sale disappears from the list immediately
- ✅ Deletion is queued for sync

### 2. Inventory Operations

#### Test 2.1: Add Product Offline
**Steps:**
1. Go offline
2. Navigate to Inventory
3. Click "Add Product"
4. Fill in: Name, Quantity, Retail Price, etc.
5. Save the product

**Expected Results:**
- ✅ Toast: "Product added successfully! Changes saved locally."
- ✅ Product appears in inventory list
- ✅ Operation queued in IndexedDB

#### Test 2.2: Edit Product Offline
**Steps:**
1. Stay offline
2. Edit an existing product
3. Change quantity, price, or other details
4. Save changes

**Expected Results:**
- ✅ Toast: "Product updated successfully! Changes saved locally."
- ✅ Changes reflected immediately in UI
- ✅ Update queued for sync

#### Test 2.3: Delete Product Offline
**Steps:**
1. Stay offline
2. Delete a product from inventory

**Expected Results:**
- ✅ Toast: "Product deleted successfully! Changes saved locally."
- ✅ Product removed from list
- ✅ Deletion queued

### 3. Finance Operations

#### Test 3.1: Add Income Record Offline
**Steps:**
1. Go offline
2. Navigate to Finance
3. Add a new income record
4. Fill in amount, reason, date
5. Save

**Expected Results:**
- ✅ Toast: "Income record created! Changes saved locally."
- ✅ Record appears in finance list
- ✅ Operation queued

#### Test 3.2: Add Expense Record Offline
**Steps:**
1. Stay offline
2. Add a new expense record
3. Save

**Expected Results:**
- ✅ Toast: "Expense record created! Changes saved locally."
- ✅ Record visible immediately
- ✅ Operation queued

#### Test 3.3: Delete Financial Record Offline
**Steps:**
1. Stay offline
2. Delete a finance record

**Expected Results:**
- ✅ Toast: "Financial record deleted! Changes saved locally."
- ✅ Record removed from list
- ✅ Deletion queued via useOfflineMutation

### 4. Loans Operations

#### Test 4.1: Create Loan Offline
**Steps:**
1. Go offline
2. Navigate to Loans
3. Create a new loan
4. Fill in borrower, amount, duration, etc.
5. Save

**Expected Results:**
- ✅ Toast: "Loan created successfully! Changes saved locally."
- ✅ Loan appears in list
- ✅ Operation queued

#### Test 4.2: Add Loan Repayment Offline
**Steps:**
1. Stay offline
2. Add a repayment to an existing loan
3. Enter repayment amount
4. Save

**Expected Results:**
- ✅ Toast: "Repayment added! Changes saved locally."
- ✅ Loan balance updated in UI
- ✅ Repayment queued

#### Test 4.3: Delete Loan Offline
**Steps:**
1. Stay offline
2. Delete a loan

**Expected Results:**
- ✅ Toast: "Loan deleted! Changes saved locally."
- ✅ Loan removed from list
- ✅ Deletion queued via useOfflineMutation

### 5. Savings Operations

#### Test 5.1: Create Savings Plan Offline
**Steps:**
1. Go offline
2. Navigate to Savings
3. Create a new savings plan
4. Fill in title, target amount, duration
5. Save

**Expected Results:**
- ✅ Toast: "Savings plan created! Changes saved locally."
- ✅ Plan appears in savings list
- ✅ Operation queued

#### Test 5.2: Add Contribution Offline
**Steps:**
1. Stay offline
2. Add a contribution to a savings plan
3. Enter contribution amount
4. Save

**Expected Results:**
- ✅ Toast: "Contribution added! Changes saved locally."
- ✅ Plan's current amount updated in UI
- ✅ Contribution queued

#### Test 5.3: Delete Savings Plan Offline
**Steps:**
1. Stay offline
2. Delete a savings plan

**Expected Results:**
- ✅ Toast: "Savings plan deleted! Changes saved locally."
- ✅ Plan removed from list
- ✅ Deletion queued via useOfflineMutation

### 6. Reconnection & Sync Testing (CRITICAL)

#### Test 6.1: Multiple Operations Then Sync
**Steps:**
1. Go offline
2. Perform the following operations in sequence:
   - Add 2 sales
   - Add 1 product
   - Edit 1 product
   - Add 1 income record
   - Add 1 expense record
   - Create 1 loan
   - Create 1 savings plan
3. Verify all operations show offline toast messages
4. Check IndexedDB to confirm 8+ queued operations
5. **Go back online** (uncheck Offline in DevTools)
6. Wait for automatic sync (watch console logs)

**Expected Results:**
- ✅ All operations sync automatically within 10-30 seconds
- ✅ Console shows: "Syncing X pending operations..."
- ✅ Console shows: "All operations synced successfully"
- ✅ IndexedDB offlineQueue is cleared
- ✅ No duplicate records in Supabase
- ✅ All data appears correctly in the database
- ✅ UI remains consistent with database

**Verification Checklist:**
- [ ] Check Supabase database for all synced records
- [ ] Verify no duplicates exist
- [ ] Confirm product quantities are correct
- [ ] Verify financial records have correct amounts
- [ ] Check loan and savings data integrity
- [ ] Refresh the page and confirm all data persists

#### Test 6.2: Sync Error Handling
**Steps:**
1. Go offline
2. Add a sale or product
3. Go back online
4. Monitor console for any sync errors

**Expected Results:**
- ✅ If sync fails, operation remains in queue
- ✅ System retries automatically
- ✅ User sees appropriate error messages if needed

### 7. Edge Cases & Stress Testing

#### Test 7.1: Rapid Operations While Offline
**Steps:**
1. Go offline
2. Quickly perform 10+ operations across different pages
3. Go back online

**Expected Results:**
- ✅ All operations queue correctly
- ✅ No race conditions or lost data
- ✅ All operations sync in order

#### Test 7.2: Offline → Online → Offline → Online
**Steps:**
1. Go offline, add 2 sales
2. Go online, wait for sync
3. Go offline again, add 2 more sales
4. Go online again

**Expected Results:**
- ✅ All operations sync correctly in both cycles
- ✅ No data loss or corruption

#### Test 7.3: Delete Operations Consistency
**Steps:**
1. Go offline
2. Delete a product that was used in a previous sale
3. Go online and verify sync

**Expected Results:**
- ✅ Deletion queues correctly
- ✅ No foreign key violations
- ✅ Related records handle deletion appropriately

### 8. UI/UX Verification

#### Test 8.1: Offline Indicators
**Steps:**
1. Go offline
2. Check all pages

**Expected Results:**
- ✅ Offline status indicator visible
- ✅ All pages show offline-aware messages
- ✅ No "Processing..." hang states

#### Test 8.2: Toast Messages
Verify correct toast messages for each scenario:
- **Online**: "Sale completed successfully!", "Product added successfully!"
- **Offline**: "Sale saved offline! It will sync when you're back online.", "Product added successfully! Changes saved locally."

## Debugging Tools

### Check Queued Operations
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Expand **IndexedDB** → **offlineQueue**
4. Click on **operations** table
5. View all pending operations

### Check Console Logs
Look for these log messages:
- `📴 Offline: Product quantities queued for sync + cache updated for UI`
- `Syncing X pending operations...`
- `All operations synced successfully`
- `Operation queued for offline sync`

### Monitor Network Requests
1. Open **Network** tab in DevTools
2. Watch for POST/PATCH/DELETE requests when online
3. Verify requests succeed with 200/201 status codes

## Common Issues & Troubleshooting

### Issue: Operations not syncing after going online
**Solution:**
- Check browser console for errors
- Verify Supabase connection is working
- Check if operations are still in IndexedDB
- Try manually triggering sync (code handles this automatically)

### Issue: Duplicate records after sync
**Solution:**
- This indicates optimistic cache updates might be creating conflicts
- Check if the same operation was queued multiple times
- Report this issue for investigation

### Issue: Product quantity mismatch
**Solution:**
- Verify `updateProductQuantity.mutateAsync()` is being called
- Check if cache updates are consistent with mutations
- Look for console logs confirming quantity updates

## Test Report Template

After completing all tests, document results:

```
## Offline Testing Results
Date: [DATE]
Tester: [NAME]

### Sales Operations
- [ ] Create sale offline: PASS/FAIL
- [ ] Delete sale offline: PASS/FAIL
- [ ] Product quantities update: PASS/FAIL

### Inventory Operations
- [ ] Add product offline: PASS/FAIL
- [ ] Edit product offline: PASS/FAIL
- [ ] Delete product offline: PASS/FAIL

### Finance Operations
- [ ] Add income offline: PASS/FAIL
- [ ] Add expense offline: PASS/FAIL
- [ ] Delete record offline: PASS/FAIL

### Loans Operations
- [ ] Create loan offline: PASS/FAIL
- [ ] Add repayment offline: PASS/FAIL
- [ ] Delete loan offline: PASS/FAIL

### Savings Operations
- [ ] Create plan offline: PASS/FAIL
- [ ] Add contribution offline: PASS/FAIL
- [ ] Delete plan offline: PASS/FAIL

### Sync Testing
- [ ] Multiple operations sync correctly: PASS/FAIL
- [ ] No duplicate records: PASS/FAIL
- [ ] Data integrity maintained: PASS/FAIL

### Issues Found:
[List any issues discovered]

### Notes:
[Additional observations]
```

## Success Criteria

All tests PASS when:
1. ✅ All operations work seamlessly offline
2. ✅ Offline toast messages display correctly
3. ✅ UI updates immediately (optimistic updates)
4. ✅ Operations queue in IndexedDB
5. ✅ Auto-sync works when back online
6. ✅ No duplicate records in database
7. ✅ Data integrity maintained across all operations
8. ✅ No "Processing..." hang states
9. ✅ Console logs show proper offline/sync flow
10. ✅ User experience is smooth and intuitive

---

**Ready to test?** Follow the scenarios above and report any issues!
