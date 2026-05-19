"""Analyze bemady-admin-export.json exported from the admin dashboard.
Usage: python tools/analyze_admin_export.py bemady-admin-export.json
"""
import json, sys
from collections import Counter

path = sys.argv[1] if len(sys.argv) > 1 else 'bemady-admin-export.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
visits = data.get('visitorAnalytics', {}).get('lastVisits', [])
orders = data.get('orders', [])
products = data.get('products', [])
print('=== Bemady Analytics Summary ===')
print('Products:', len(products))
print('Orders:', len(orders))
print('Recent visits:', len(visits))
print('\nTop visitor sources:')
for source, count in Counter(v.get('source','Unknown') for v in visits).most_common(15):
    print(f'- {source}: {count}')
print('\nTop products by stock:')
for p in sorted(products, key=lambda x: x.get('stock',0), reverse=True)[:10]:
    print(f"- {p.get('name')}: {p.get('stock')} in stock")
