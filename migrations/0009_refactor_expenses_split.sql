ALTER TABLE expenses ADD COLUMN share_investor_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE expenses ADD COLUMN share_operator_amount INTEGER NOT NULL DEFAULT 0;

UPDATE expenses SET share_investor_amount = cost, share_operator_amount = 0 WHERE is_investor_expense = 1;
UPDATE expenses SET share_investor_amount = 0, share_operator_amount = cost WHERE is_investor_expense = 0;

ALTER TABLE expenses DROP COLUMN is_investor_expense;
