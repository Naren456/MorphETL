source: https://example.com/product/widget-a
scraper: simple-scraper-v1
lang: en
publisher: Example Corp
contact: support@example.com

--- RAW PARAGRAPH
Widget A is a compact device for everyday use. It comes in multiple colors and often appears in scraped pages with noisy markup and unrelated text like promotional banners, comments, or code snippets. The price information is inconsistent in these pages and sometimes appears as "9.99 USD", "$9.99", or "9,99". Dates observed in different locales: 12/13/2025 and 13/12/2025 (ambiguous). Some text contains OCR errors from PDFs: \"l0cation\" instead of \"location\" and \"O\" vs \"0\" confusion.

--- INLINE JSON (well-formed)
{
  "id": "prod-1001",
  "title": "Widget A",
  "slug": "widget-a",
  "pricing": {
    "price_usd": "9.99",
    "inventory": 120,
    "currency_hint": "USD"
  },
  "tags": ["gadget","home","widget"],
  "dimensions": {"w_mm": 120, "h_mm": 45, "d_mm": 30},
  "release_date": "2025-11-01"
}

--- MALFORMED JSON FRAGMENT (common in scraped text)
{ "id": "prod-1001-b", "title": "Widget B", "specs": { "color": "red", "weight": "0.5kg", }  "notes": "missing comma and trailing comma issues" 

--- HTML SNIPPET (embedded table)
<div class="reviews">
  <h3>Customer Reviews</h3>
  <table>
    <thead><tr><th>author</th><th>rating</th><th>comment</th><th>date</th></tr></thead>
    <tbody>
      <tr><td>Alice</td><td>5</td><td>Excellent product.</td><td>2025-10-20</td></tr>
      <tr><td>Bob</td><td>4</td><td>Good value for money.</td><td>20/10/2025</td></tr>
      <tr><td>Charlie</td><td>3</td><td>Okay, but packaging was bad.</td><td>Oct 19, 2025</td></tr>
    </tbody>
  </table>
</div>

--- CSV-LIKE SECTION
author,rating,helpful_votes,date
Dave,4,2,2025-10-18
Eve,2,0,18-10-2025
Mallory,5,10,2025/10/17

--- KEY-VALUE KVP BLOCK (no fixed structure)
title: Widget A - Special Edition
price: $9.99
currency: USD
availability: In Stock
tags: gadget;home;clearance

--- JSON-LD (schema.org style)
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@type": "Product",
  "name": "Widget A",
  "image": [
    "https://example.com/images/widget-a-1.jpg",
    "https://example.com/images/widget-a-2.jpg"
  ],
  "description": "A versatile widget for the modern home.",
  "sku": "WA-1001",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "9.99",
    "availability": "http://schema.org/InStock",
    "url": "https://example.com/product/widget-a"
  }
}
</script>

--- INLINE CSV TABLE (tabular HTML converted text captured)
ProductID,Name,Color,Stock
prod-1001,Widget A,black,120
prod-1001,Widget A,white,80
prod-1002,Widget B,red,50

--- FREE TEXT WITH NOISE & JS SNIPPET
<!-- Some scraped page contains inline scripts and comments -->
<script>var config = {id: 'prod-1001', price: '9.99', promo: true};</script>
Random footer text - Contact us at (555) 123-4567. Promo code: SAVE10.
Note: DO NOT RUN SQL: \"DROP TABLE users;\" included as sample text from scraped code blocks.

--- OCR-LIKE PAGE FOOTER
Page 3 of 12
Document title: Product catalog - Example Corp
l0cation: Warehouse 9
Total items: one hundred and twenty (120)

--- SQL-LIKE SNIPPET (should be extracted as code, not executed)
-- Example of raw SQL shown on a page, should not be executed
SELECT id, title, price FROM products WHERE price < 20;

--- REPEATED FIELDS (conflicting values across page)
price_usd: 9.99
price: "$9.99"
legacy_price: "9.9900"
currency_hint: USD

--- AMBIGUOUS TYPES / MISSING DATA
views: "1024"
views: "N/A"
sold: "12"
rating_avg: "4.2"
is_featured: "true"
is_limited: 0

--- VARIANT / EVOLUTION BLOCK (v2) - show how source may change over time
=== VARIANT v2 START ===
# New upload on 2025-11-20: product schema changed
{
  "id": "prod-1001",
  "title": "Widget A",
  "slug": "widget-a",
  "pricing": {
    "price": 9.99,
    "currency": "USD"
  },
  "tags": ["gadget","home","widget","sale"],
  "dimensions": {"w_mm": 120, "h_mm": 45, "d_mm": 30},
  "release_date": "2025-11-01",
  "metadata": {
    "imported_from": "example-scrape-v2",
    "ingested_at": "2025-11-20T09:10:00+05:30"
  },
  "views": "N/A",              # type flip: previously numeric, now sometimes N/A
  "ratings": {
    "avg": 4.1,
    "count": 235
  }
}

# Extra CSV row introduced in v2
ProductID,Name,Color,Stock,warehouse
prod-1001,Widget A,black,120,W-9
prod-1001,Widget A,white,80,W-9
prod-1003,Widget C,blue,30,W-12

# New front-matter like YAML (in v2 some pages include it)
---
title: "Widget A - 2025"
published: 2025-11-18
authors:
  - "Editorial Team"
tags:
  - "gadget"
  - "featured"

{
  "monitoring": {
    "ecg_events": [
      {
        "timestamp": "2025-11-15T02:13:00Z",
        "type": "ST_depression",
        "severity": "moderate",
        "lead": "V3-V4"
      },
      {
        "timestamp": "2025-11-15T03:27:00Z",
        "type": "ventricular_bigeminy",
        "severity": "high",
        "lead": "V2"
      }
    ],
    "spo2_trend": {
      "min": 92,
      "max": 97,
      "average": 94.5
    },
    "hr_trend": [88, 92, 95, 101, 98, 104]
  },
  "alerts": [
    {
      "category": "ECG",
      "message": "ST changes detected",
      "level": "critical"
    },
    {
      "category": "Respiratory",
      "message": "Low SpO2 event at 03:40 AM",
      "level": "moderate"
    }
  ]
}

{
  "insurance": {
    "provider": "CarePlus Health",
    "policy_no": "CPL-77812893",
    "valid_till": "2026-07-12",
    "coverage": {
      "total_limit": "7,50,000 INR",
      "room_limit": "6000 INR/day",
      "icu_limit": "15000 INR/day"
    }
  },
  "billing": {
    "items": [
      { "name": "Coronary Angiography", "cost": 17500 },
      { "name": "ICU Monitoring", "cost": 6000 },
      { "name": "Blood Tests Panel", "cost": 3200 },
      { "name": "Medications", "cost": 1800 }
    ],
    "total": 28500,
    "currency": "INR"
  }
}

ADMISSION_FILE:
  patient: "Arvind Kumar"
  admitted_on: "2025-11-14T22:40:00Z"
  reason: "Chest Pain – Possible Cardiac Event"
  emergency_details:
    brought_by: "Family"
    triage_priority: "High"
    initial_assessment:
      bp: "150/100"
      pulse: 118
      spo2: 93
  notes:
    - "Patient experienced severe chest pain at home"
    - "Was given aspirin before coming to hospital"
    - "BMI indicates overweight"

FOLLOW_UP_PLAN:
  required:
    - Repeat Troponin in 6 hrs
    - Repeat ECG
    - Monitor urine output
    - Blood sugar monitoring Q4H
  consults:
    cardiology: "Daily"
    endocrinology: "As needed"
    physiotherapy: "After stabilization"