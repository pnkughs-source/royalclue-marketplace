# RoyalClue — Final Search Visible Version

Open `index.html` in browser.

Admin secret code: `2026`

Updates:
- Search bar clearly visible before product grid
- Category/filter row no longer covers product cards
- Product/account full names show properly
- FIRST10 / RESELL floating boxes removed
- Developers/Freelancers role strip removed
- Process quick row removed
- Buyer cards visible on first screen
- Product/account list restored


Update: Product card button is now Buy Now. Clicking Buy Now opens the payment page directly with that selected product. Homepage design is kept same as previous version.


Update: Buyers must sign up before using Buy Now/payment. Signup form uses clean white fields and no verification-note text is shown.


Footer section added: About us, Contact, Privacy, and copyright.

## Latest Admin Analytics Update

Added source-wise product analytics in the hidden admin dashboard:

- Shows which products are generating sales.
- Shows which products get the most clicks and views.
- Tracks product performance by source/referrer/UTM source.
- Tracks latest product events: view, click, sale, source, time, amount.
- Export button now includes productAnalytics data.
- Backend production API includes `/api/track/product-event` and admin `/api/portal-bemady-9f2a7c/product-analytics`.

Use source links like:

`https://bemady.com/?utm_source=facebook`
`https://bemady.com/?utm_source=telegram`
`https://bemady.com/?utm_source=instagram`

Then admin dashboard will show which source brings product views, clicks, and sales.


## Latest update
- Category chips now auto-move like a live slider/marquee.
- Slider pauses when mouse is over it and resumes after manual arrow click.
