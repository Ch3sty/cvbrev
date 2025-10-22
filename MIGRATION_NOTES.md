# Database Migration Notes

## 2025-10-22: Update learning_path constraint

### Problem
API error when creating learning plans:
```
code: '23514'
message: 'new row for relation "learning_plans" violates check constraint "learning_plans_learning_path_check"'
```

### Cause
Check constraint only allowed legacy values: `['quick', 'balanced', 'comprehensive']`
New code uses: `['career_change', 'adaptation', 'refinement']`

### Solution
Migration: `update_learning_path_constraint_allow_new_strategies`

**SQL:**
```sql
-- Drop old constraint
ALTER TABLE learning_plans 
DROP CONSTRAINT IF EXISTS learning_plans_learning_path_check;

-- Add new constraint that allows both old and new values
ALTER TABLE learning_plans 
ADD CONSTRAINT learning_plans_learning_path_check 
CHECK (learning_path IN (
  'quick', 
  'balanced', 
  'comprehensive',
  'career_change',
  'adaptation',
  'refinement'
));
```

### Verification
```sql
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'learning_plans'::regclass
AND conname = 'learning_plans_learning_path_check';
```

**Result**: ✅ Constraint now accepts all 6 values (3 legacy + 3 new)

### Impact
- ✅ New learning plans with `career_change`, `adaptation`, `refinement` can now be created
- ✅ Backwards compatible: old plans with `quick`, `balanced`, `comprehensive` still work
- ✅ Frontend can now successfully create and save development plans

### Files affected
- Database: `learning_plans` table constraint
- Backend: `/api/learning-plans/create/route.ts` (auto-strategy logic)
- Frontend: `InteractiveLearningTimeline.tsx` (course selection)

