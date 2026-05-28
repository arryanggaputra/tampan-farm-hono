CREATE VIEW view_revenue AS
  SELECT COALESCE(SUM(selling_price), 0) AS total FROM sales WHERE payment_status = 'lunas';

CREATE VIEW view_cogs AS
  SELECT COALESCE(SUM(purchase_price), 0) AS total FROM livestock WHERE status = 'sold';

CREATE VIEW view_expenses_split AS
  SELECT
    COALESCE(SUM(share_investor_amount), 0) AS investor_expense,
    COALESCE(SUM(share_operator_amount), 0) AS operator_expense
  FROM expenses;
