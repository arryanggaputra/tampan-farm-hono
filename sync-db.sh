#!/usr/bin/env bash
set -euo pipefail

DB_BINDING="DB"
DB_NAME="tampan-farm-db"
DUMP_FILE=".wrangler/prod-dump.sql"
LOCAL_DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject"

echo "==> Exporting production D1 database..."
npx wrangler d1 export "$DB_BINDING" --remote --output="$DUMP_FILE"

echo "==> Dropping local D1 state..."
rm -rf "$LOCAL_DB_PATH"

echo "==> Importing dump into local D1..."
npx wrangler d1 execute "$DB_BINDING" --local --file="$DUMP_FILE"

echo "==> Done. Local DB mirrors production."
echo "    Dump saved at: $DUMP_FILE"
