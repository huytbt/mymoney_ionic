angular.module('starter.config', [])

.constant('DATABASE_API_URL', 'http://api-autotest.toancauxanh.vn/sqliteapi')
// .constant('DATABASE_API_URL', 'http://mymoneyapi.gopagoda.com')
// .constant('DATABASE_API_URL', 'http://local.mymoney.com:9090/sqliteapi')

.constant('DB_CONFIG', {
  name: 'mymoney',
  tables: [
    {
      name: 'mm_asset_groups',
      columns: [
        {name: 'id', type: 'integer primary key'},
        {name: 'name', type: 'text'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'}
      ]
    },
    {
      name: 'mm_assets',
      columns: [
        {name: 'id', type: 'integer primary key'},
        {name: 'group_id', type: 'integer'},
        {name: 'title', type: 'text'},
        {name: 'amount', type: 'real'},
        {name: 'keep_amount', type: 'real default 0'},
        {name: 'description', type: 'text'},
        {name: 'is_save_account', type: 'integer default 0'},
        {name: 'is_enable', type: 'integer default 1'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'},
        {name: 'CONSTRAINT fk_assets_category_id', type: 'FOREIGN KEY ("group_id") REFERENCES "mm_asset_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE'}
      ]
    },
    {
      name: 'mm_asset_transfers',
      columns: [
        {name: 'id', type: 'integer primary key'},
        {name: 'year', type: 'integer'},
        {name: 'month', type: 'integer'},
        {name: 'day', type: 'integer'},
        {name: 'from_account_id', type: 'integer'},
        {name: 'to_account_id', type: 'integer'},
        {name: 'amount', type: 'real'},
        {name: 'fee', type: 'real default 0'},
        {name: 'title', type: 'text'},
        {name: 'description', type: 'text'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'},
        {name: 'CONSTRAINT fk_asset_transfers_from_account_id', type: 'FOREIGN KEY ("from_account_id") REFERENCES "mm_assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE'},
        {name: 'CONSTRAINT fk_asset_transfers_to_account_id', type: 'FOREIGN KEY ("to_account_id") REFERENCES "mm_assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE'}
      ]
    },
    {
      name: 'mm_categories',
      columns: [
        {name: 'id', type: 'integer primary key autoincrement'},
        {name: 'name', type: 'text'},
        {name: 'sub_id', type: 'integer default 0'},
        {name: 'type', type: 'integer default 1'},
        {name: 'day_tracking', type: 'integer default 0'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'}
      ]
    },
    {
      name: 'mm_budgets',
      columns: [
        {name: 'id', type: 'integer primary key autoincrement'},
        {name: 'category_id', type: 'integer'},
        {name: 'year', type: 'integer'},
        {name: 'month', type: 'integer'},
        {name: 'title', type: 'text'},
        {name: 'amount', type: 'real'},
        {name: 'type', type: 'integer default 1'},
        {name: 'day_tracking', type: 'integer default 0'},
        {name: 'description', type: 'text'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'},
        {name: 'CONSTRAINT fk_category_id', type: 'FOREIGN KEY ("category_id") REFERENCES "mm_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE'}
      ]
    },
    {
      name: 'mm_bills',
      columns: [
        {name: 'id', type: 'integer primary key autoincrement'},
        {name: 'budget_id', type: 'integer'},
        {name: 'year', type: 'integer'},
        {name: 'month', type: 'integer'},
        {name: 'day', type: 'integer'},
        {name: 'asset_id', type: 'integer'},
        {name: 'title', type: 'text'},
        {name: 'amount', type: 'real'},
        {name: 'description', type: 'text'},
        {name: 'type', type: 'integer default 1'},
        {name: 'created', type: 'integer'},
        {name: 'modified', type: 'integer'},
        {name: 'CONSTRAINT fk_budget_id', type: 'FOREIGN KEY ("budget_id") REFERENCES "mm_budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE'},
        {name: 'CONSTRAINT fk_bills_asset_id', type: 'FOREIGN KEY ("asset_id") REFERENCES "mm_assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE'}
      ]
    }
  ],
  views: [
    {
      name: 'view_assets',
      query: 'SELECT '+
        'mm_assets.id AS asset_id, '+
        'mm_assets.group_id, '+
        'mm_assets.title, '+
        'mm_assets.amount, '+
        '( '+
        '  mm_assets.amount '+
        '  + COALESCE((SELECT SUM(bil.amount) FROM mm_bills bil WHERE bil.asset_id = mm_assets.id AND bil.type=0), 0) '+
        '  - COALESCE((SELECT SUM(bil.amount) FROM mm_bills bil WHERE bil.asset_id = mm_assets.id AND bil.type<>0), 0) '+
        '    + COALESCE((SELECT SUM(at.amount) FROM mm_asset_transfers at WHERE at.to_account_id = mm_assets.id), 0) '+
        '    - COALESCE((SELECT SUM(at.amount) FROM mm_asset_transfers at WHERE at.from_account_id = mm_assets.id), 0) '+
        '    - COALESCE((SELECT SUM(at.fee) FROM mm_asset_transfers at WHERE at.from_account_id = mm_assets.id), 0) '+
        ') AS amount_current, '+
        'mm_assets.description, '+
        'mm_assets.keep_amount, '+
        'mm_assets.is_save_account '+
      'FROM mm_assets'
    },
    {
      name: 'view_budget',
      query: 'SELECT bud.id as budget_id, bud.year, bud.month, cat.name as category, cat.id as category_id, bud.title, bud.amount, '+
        '(COALESCE((SELECT SUM(bil.amount) FROM mm_bills as bil WHERE bud.id = bil.budget_id AND bil.type=bud.type), 0) - '+
        'COALESCE((SELECT SUM(bil.amount) FROM mm_bills as bil WHERE bud.id = bil.budget_id AND bil.type<>bud.type), 0)) as actual_amount, '+
        'CASE WHEN bud.type=0 THEN 0 ELSE MAX(0, (bud.amount '+
          '- COALESCE((SELECT SUM(bil.amount) FROM mm_bills as bil WHERE bud.id = bil.budget_id AND bil.type=bud.type), 0) '+
          '- COALESCE((SELECT SUM(bil.amount) FROM mm_bills as bil WHERE bud.id = bil.budget_id AND bil.type<>bud.type), 0) '+
        ')) END as need_income_amount, '+
        'bud.type, bud.day_tracking, bud.description '+
      'FROM mm_categories cat INNER JOIN mm_budgets bud ON cat.id = bud.category_id'
    }
  ]
});