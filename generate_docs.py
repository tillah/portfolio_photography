from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable

# ── Colour palette ──────────────────────────────────────────────────────────
CREAM       = colors.HexColor("#F5F1E8")
SLATE       = colors.HexColor("#1C2A5A")
UMBER       = colors.HexColor("#624332")
RUST        = colors.HexColor("#A85232")
BORDER      = colors.HexColor("#E2D9C8")
DARK        = colors.HexColor("#0f1117")
WHITE       = colors.white
MID_GREY    = colors.HexColor("#888888")
LIGHT_GREY  = colors.HexColor("#f0ede8")
CODE_BG     = colors.HexColor("#1e2433")
CODE_FG     = colors.HexColor("#c9d1d9")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

# ── Styles ───────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, parent="Normal", **kw):
    return ParagraphStyle(name, parent=base[parent], **kw)

styles = {
    "cover_name": S("cover_name", fontSize=36, textColor=WHITE,
                    fontName="Helvetica-Bold", leading=42, alignment=TA_LEFT),
    "cover_sub":  S("cover_sub",  fontSize=13, textColor=colors.HexColor("#B8A898"),
                    fontName="Helvetica", leading=18, alignment=TA_LEFT),
    "cover_tag":  S("cover_tag",  fontSize=9,  textColor=colors.HexColor("#A85232"),
                    fontName="Helvetica", leading=12, alignment=TA_LEFT, spaceAfter=4),
    "h1": S("h1", fontSize=22, textColor=SLATE, fontName="Helvetica-Bold",
            leading=28, spaceBefore=14, spaceAfter=6),
    "h2": S("h2", fontSize=15, textColor=SLATE, fontName="Helvetica-Bold",
            leading=20, spaceBefore=12, spaceAfter=4),
    "h3": S("h3", fontSize=12, textColor=RUST, fontName="Helvetica-Bold",
            leading=16, spaceBefore=8, spaceAfter=3),
    "h4": S("h4", fontSize=10, textColor=UMBER, fontName="Helvetica-Bold",
            leading=14, spaceBefore=6, spaceAfter=2),
    "body": S("body", fontSize=9.5, textColor=UMBER, fontName="Helvetica",
              leading=15, spaceAfter=6),
    "note": S("note", fontSize=8.5, textColor=MID_GREY, fontName="Helvetica-Oblique",
              leading=13, spaceAfter=4),
    "code": S("code", fontSize=8, textColor=CODE_FG, fontName="Courier",
              leading=13, backColor=CODE_BG, leftIndent=8, rightIndent=8,
              borderPadding=(6,8,6,8), spaceAfter=6),
    "pill": S("pill", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
              leading=10, alignment=TA_CENTER),
    "toc_item": S("toc_item", fontSize=9.5, textColor=SLATE, fontName="Helvetica",
                  leading=16, leftIndent=0),
    "toc_sub":  S("toc_sub",  fontSize=9,   textColor=UMBER, fontName="Helvetica",
                  leading=14, leftIndent=12),
    "footer":   S("footer", fontSize=7.5, textColor=MID_GREY, fontName="Helvetica",
                  leading=10, alignment=TA_CENTER),
    "path": S("path", fontSize=8.5, textColor=RUST, fontName="Courier",
              leading=13, spaceAfter=2),
}

# ── Helpers ──────────────────────────────────────────────────────────────────
def hr(color=BORDER, thickness=0.5, space=4):
    return HRFlowable(width="100%", thickness=thickness, color=color,
                      spaceAfter=space, spaceBefore=space)

def sp(h=6):
    return Spacer(1, h)

def p(text, style="body"):
    return Paragraph(text, styles[style])

def code(text):
    # Escape angle brackets for reportlab XML
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, styles["code"])

def section_header(title, subtitle=None):
    items = [sp(4), hr(SLATE, 1.5, 2), p(title, "h1")]
    if subtitle:
        items.append(p(subtitle, "note"))
    items.append(hr(BORDER, 0.5, 6))
    return items

def file_row(path, description):
    return [p(f"<font color='#A85232'><b>{path}</b></font>", "body"),
            p(description, "body")]

def bullet(text, indent=0):
    return p(f"{'&nbsp;' * indent * 4}<b>·</b>  {text}", "body")

def kv_table(rows, col_widths=None):
    """Two-column key/value table."""
    w = PAGE_W - 2 * MARGIN
    cw = col_widths or [w * 0.32, w * 0.68]
    data = []
    for k, v in rows:
        data.append([p(f"<b>{k}</b>", "body"), p(v, "body")])
    tbl = Table(data, colWidths=cw)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_GREY),
        ("GRID",       (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 8),
        ("RIGHTPADDING",(0,0), (-1,-1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
    ]))
    return tbl

def three_col_table(headers, rows):
    w = PAGE_W - 2 * MARGIN
    cw = [w * 0.28, w * 0.22, w * 0.50]
    data = [[p(f"<b>{h}</b>", "body") for h in headers]] + \
           [[p(c, "body") for c in row] for row in rows]
    tbl = Table(data, colWidths=cw)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SLATE),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("GRID",       (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
    ]))
    return tbl

# ── Cover page ───────────────────────────────────────────────────────────────
class CoverPage(Flowable):
    def __init__(self):
        super().__init__()
        self.width  = PAGE_W
        self.height = PAGE_H

    def draw(self):
        c = self.canv
        # Dark background
        c.setFillColor(DARK)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # Rust accent bar
        c.setFillColor(RUST)
        c.rect(0, PAGE_H - 8*mm, PAGE_W, 8*mm, fill=1, stroke=0)
        # Slate side bar
        c.setFillColor(SLATE)
        c.rect(0, 0, 4*mm, PAGE_H - 8*mm, fill=1, stroke=0)

        # Title block
        tx = 26*mm
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 38)
        c.drawString(tx, PAGE_H - 44*mm, "Tehillah Photography")
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor("#B8A898"))
        c.drawString(tx, PAGE_H - 54*mm, "Full Developer & Content Documentation")

        # Divider
        c.setStrokeColor(RUST)
        c.setLineWidth(1.5)
        c.line(tx, PAGE_H - 60*mm, PAGE_W - 20*mm, PAGE_H - 60*mm)

        # Info block
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#9c9289"))
        lines = [
            "Website:     tehillahmuchato.com",
            "Email:       tehillahmuchato@gmail.com",
            "Instagram:   @tillah.jpg",
            "Location:    Birmingham, United Kingdom",
            "Framework:   Next.js 16 (App Router) · TypeScript · Tailwind CSS",
            "Animations:  Framer Motion",
            "Deployment:  Vercel",
        ]
        y = PAGE_H - 72*mm
        for line in lines:
            c.drawString(tx, y, line)
            y -= 7*mm

        # Section list
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(RUST)
        c.drawString(tx, y - 4*mm, "SECTIONS COVERED")
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#B8A898"))
        sections = [
            "1. Project Structure & File Map",
            "2. Pages — What They Do & How to Edit",
            "3. Components — Full Reference",
            "4. Admin Portal — Usage Guide",
            "5. API Routes",
            "6. Data & Image Management",
            "7. Colours, Fonts & Design Tokens",
            "8. Deployment to Vercel",
            "9. Common Edits Cheat Sheet",
        ]
        y -= 12*mm
        for s in sections:
            c.drawString(tx + 4*mm, y, s)
            y -= 6*mm

        # Footer
        c.setFont("Helvetica", 7.5)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawCentredString(PAGE_W / 2, 12*mm, "Generated by Claude · Tehillah Photography · Confidential")

# ── Page template callbacks ──────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(SLATE)
    canvas.rect(0, PAGE_H - 10*mm, PAGE_W, 10*mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, PAGE_H - 6.5*mm, "Tehillah Photography — Developer Documentation")
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 6.5*mm, "tehillahmuchato.com")
    # Footer
    canvas.setFillColor(BORDER)
    canvas.rect(0, 0, PAGE_W, 9*mm, fill=1, stroke=0)
    canvas.setFillColor(UMBER)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawCentredString(PAGE_W / 2, 3.5*mm, f"Page {doc.page}")
    canvas.restoreState()

# ── Build document ───────────────────────────────────────────────────────────
def build():
    out = "/Users/tmuchato/portfolio_2/Tehillah_Photography_Documentation.pdf"
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=16*mm, bottomMargin=14*mm,
    )

    story = []

    # Cover is drawn via onFirstPage; start content on page 2
    story.append(PageBreak())

    # ── 1. Project Structure ─────────────────────────────────────────────────
    story += section_header("1. Project Structure & File Map",
                            "Every file in the project and what it does")

    story.append(p("The project lives at <b>/Users/tmuchato/portfolio_2</b>. "
                   "Below is the full file tree with a description of every important file.", "body"))
    story.append(sp(4))

    tree_data = [
        ["File / Folder", "Purpose"],
        ["app/layout.tsx", "Root layout — loads fonts (Tenor Sans, Roboto), sets global SEO metadata, wraps all pages in ConditionalShell"],
        ["app/globals.css", "Global CSS — imports Tailwind, defines CSS variables for colours, scrollbar styling"],
        ["app/page.tsx", "Home page — hero slideshow, intro strip, category cards, quote section, testimonials, CTA"],
        ["app/about/page.tsx", "About page — Tehillah's bio, photographer portrait, values section"],
        ["app/portfolio/page.tsx", "Portfolio page — header + wraps PortfolioGallery in a Suspense boundary"],
        ["app/services/page.tsx", "Services page — four service blocks with pricing, inclusions, and enquiry CTAs"],
        ["app/contact/page.tsx", "Contact page — contact info, social links, enquiry form"],
        ["app/admin/page.tsx", "Admin portal — full image management UI (login, dashboard, add/remove photos)"],
        ["app/api/photos/route.ts", "Public API — GET /api/photos → returns all photos from data/photos.json"],
        ["app/api/admin/photos/route.ts", "Admin API — GET (list) and POST (add by URL) photos. Requires x-admin-password header"],
        ["app/api/admin/photos/[id]/route.ts", "Admin API — DELETE /api/admin/photos/:id — removes from JSON and deletes uploaded file"],
        ["app/api/admin/upload/route.ts", "Admin API — POST multipart upload → saves file to public/uploads/, adds to JSON"],
        ["components/Navigation.tsx", "Sticky nav bar — transparent on hero, solid on scroll, animated mobile menu"],
        ["components/Footer.tsx", "Site footer — brand name, nav links, social links, copyright"],
        ["components/ConditionalShell.tsx", "Wraps all pages — shows Nav+Footer on public pages, hides them on /admin"],
        ["components/HeroSlideshow.tsx", "Full-screen auto-advancing image carousel on the home page"],
        ["components/CategoryCard.tsx", "Reusable card component used in the home page category grid"],
        ["components/PortfolioGallery.tsx", "Filterable masonry gallery — fetches photos from API, handles lightbox"],
        ["components/Lightbox.tsx", "Full-screen image viewer — keyboard navigation (← → Esc), counter, caption"],
        ["components/CTASection.tsx", "Reusable call-to-action section — supports light and dark variants"],
        ["components/ContactForm.tsx", "Enquiry form — controlled inputs, success state, reads ?service= from URL"],
        ["components/TestimonialSlider.tsx", "Animated quote carousel with navigation dots"],
        ["components/FadeIn.tsx", "Reusable motion wrapper — fades + slides content in when it enters the viewport"],
        ["lib/photos.ts", "Shared TypeScript types: Photo interface and Category type. Hero image data."],
        ["lib/adminPhotos.ts", "Server-side file helpers — readPhotos(), writePhotos(), addPhoto(), removePhoto()"],
        ["data/photos.json", "Source of truth for all gallery photos — edited by the admin portal"],
        [".env.local", "Environment variables — set ADMIN_PASSWORD here to change the admin login"],
        ["next.config.ts", "Next.js config — allows images from images.unsplash.com"],
        [".claude/launch.json", "Dev server config for the Claude preview tool"],
    ]
    w = PAGE_W - 2 * MARGIN
    tbl = Table(
        [[p(f"<b>{r[0]}</b>", "body"), p(r[1], "body")] for r in tree_data],
        colWidths=[w * 0.35, w * 0.65]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SLATE),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("GRID",       (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
    ]))
    story.append(tbl)
    story.append(PageBreak())

    # ── 2. Pages ─────────────────────────────────────────────────────────────
    story += section_header("2. Pages — What They Do & How to Edit",
                            "Each page, its URL, and exactly what to change")

    pages = [
        {
            "title": "Home Page",
            "file": "app/page.tsx",
            "url": "/",
            "desc": "The landing page. Contains: full-screen hero slideshow, intro quote strip, 4 category cards, a full-bleed quote section, testimonial slider, and a dark CTA.",
            "edits": [
                ("Tagline / intro quote", 'Find the <b>&lt;h2&gt;</b> tag around line 65. Edit the text between the tags.'),
                ("'London — Est. 2023' label", 'Search for <b>Birmingham — Est. 2023</b> and update the text.'),
                ("Category card text", 'Edit the <b>categories</b> array near the top of the file — change title, description, or href for each card.'),
                ("Category card images", 'Change the <b>imageSrc</b> URL in each category object. Use an Unsplash URL or /uploads/ path.'),
                ("Full-bleed quote", 'Find the paragraph starting with &ldquo;A photograph is the pause button…&rdquo; and edit freely.'),
                ("Hero background images", 'Edit <b>lib/photos.ts</b> — the <b>heroImages</b> array at the bottom of the file.'),
            ],
        },
        {
            "title": "About Page",
            "file": "app/about/page.tsx",
            "url": "/about",
            "desc": "Tehillah's personal story, photographer portrait image, and three values (Presence, Authenticity, Artistry).",
            "edits": [
                ("Bio paragraphs", 'Edit the &lt;p&gt; tags inside the <b>space-y-5</b> div — your full story lives here.'),
                ("Main heading", 'Find <b>I\'m the invisible photographer.</b> and edit the h2 block.'),
                ("Photographer portrait", 'Change the <b>src</b> on the Image component around line 45. Upload your own photo via the admin portal and use <b>/uploads/filename.jpg</b>.'),
                ("Hero background image", 'Change the <b>src</b> on the first Image component (the full-width hero at the top).'),
                ("Values section", 'Find the array with <b>Presence, Authenticity, Artistry</b> — edit title and body for each.'),
                ("Page SEO description", 'Edit the <b>description</b> field inside <b>export const metadata</b> at the top.'),
            ],
        },
        {
            "title": "Portfolio Page",
            "file": "app/portfolio/page.tsx",
            "url": "/portfolio",
            "desc": "A filterable masonry gallery. The actual gallery logic lives in components/PortfolioGallery.tsx. Photos are fetched live from /api/photos (which reads data/photos.json).",
            "edits": [
                ("Page headline / intro text", 'Edit the h1 and paragraph near the top of app/portfolio/page.tsx.'),
                ("Gallery photos", 'Use the admin portal at <b>/admin</b> — add or remove photos there. No code changes needed.'),
                ("Filter categories", 'Edit the <b>filters</b> array in <b>components/PortfolioGallery.tsx</b>.'),
            ],
        },
        {
            "title": "Services Page",
            "file": "app/services/page.tsx",
            "url": "/services",
            "desc": "Four service sections — Proposals, Graduations, Birthdays, Studio — each with a description, inclusions list, starting price, and an enquire button.",
            "edits": [
                ("Service title / tagline / description", 'Edit the <b>services</b> array near the top. Each object has: id, title, tagline, description, included[], from, image, imageAlt.'),
                ("Pricing (e.g. £395)", 'Change the <b>from</b> field in each service object.'),
                ("Inclusions list", 'Edit the <b>included</b> array inside each service object — add or remove bullet points.'),
                ("Service images", 'Change the <b>image</b> URL in each service object.'),
                ("Number of services", 'Add or remove entire objects from the <b>services</b> array.'),
            ],
        },
        {
            "title": "Contact Page",
            "file": "app/contact/page.tsx",
            "url": "/contact",
            "desc": "Contact information (email, location, social links) on the left. Enquiry form on the right. The form uses ContactForm component.",
            "edits": [
                ("Email address", 'Search for <b>tehillahmuchato@gmail.com</b> — update in both the href and the display text.'),
                ("Location text", 'Find <b>Birmingham, United Kingdom</b> and edit.'),
                ("Instagram / TikTok links", 'Find the two &lt;a&gt; tags with href to Instagram/TikTok and update the href and label.'),
                ("Form event type options", 'Edit the <b>eventTypes</b> array in <b>components/ContactForm.tsx</b>.'),
                ("Page heading", 'Find <b>Let\'s begin your story.</b> and edit the h1 block.'),
            ],
        },
    ]

    for pg in pages:
        story.append(KeepTogether([
            p(f"<b>{pg['title']}</b>", "h2"),
            kv_table([
                ("File", pg["file"]),
                ("URL", pg["url"]),
                ("Description", pg["desc"]),
            ]),
        ]))
        story.append(sp(4))
        story.append(p("<b>How to edit:</b>", "h4"))
        edit_rows = [[p(f"<b>{k}</b>", "body"), p(v, "body")] for k, v in pg["edits"]]
        w = PAGE_W - 2 * MARGIN
        edit_tbl = Table(edit_rows, colWidths=[w * 0.30, w * 0.70])
        edit_tbl.setStyle(TableStyle([
            ("GRID",      (0,0),(-1,-1), 0.4, BORDER),
            ("VALIGN",    (0,0),(-1,-1), "TOP"),
            ("LEFTPADDING",(0,0),(-1,-1), 8),
            ("TOPPADDING",(0,0),(-1,-1), 4),
            ("BOTTOMPADDING",(0,0),(-1,-1), 4),
            ("BACKGROUND",(0,0),(0,-1), LIGHT_GREY),
            ("ROWBACKGROUNDS",(1,0),(1,-1), [WHITE]),
        ]))
        story.append(edit_tbl)
        story.append(sp(10))

    story.append(PageBreak())

    # ── 3. Components ─────────────────────────────────────────────────────────
    story += section_header("3. Components — Full Reference",
                            "Every reusable component, its props, and how to customise it")

    components = [
        {
            "name": "Navigation",
            "file": "components/Navigation.tsx",
            "desc": "Sticky navigation bar. Transparent over the hero image, transitions to cream/solid after 60px of scrolling. Collapses to a hamburger menu on mobile with a full-screen animated overlay.",
            "props": [],
            "customise": [
                ("Nav links", "Edit the <b>links</b> array at the top — change href or label."),
                ("Logo name", 'Find <b>Tehillah</b> inside the Link component and change it.'),
                ("Scroll threshold", "Change <b>window.scrollY > 60</b> to a different pixel value."),
                ("Solid colour", "Change <b>bg-[#F5F1E8]</b> in the navBg variable."),
            ],
        },
        {
            "name": "Footer",
            "file": "components/Footer.tsx",
            "desc": "Dark footer (Deep Slate background) with brand name, navigation links, social links, a 'Book a Session' button, and copyright.",
            "props": [],
            "customise": [
                ("Social links", "Edit the <b>socialLinks</b> array — update href and label."),
                ("Nav links in footer", "Edit the <b>navLinks</b> array."),
                ("Copyright text", "Find the © line near the bottom."),
                ("Footer colour", "Change <b>bg-[#1C2A5A]</b> on the footer element."),
            ],
        },
        {
            "name": "HeroSlideshow",
            "file": "components/HeroSlideshow.tsx",
            "desc": "Full-screen auto-advancing carousel. Cycles through images every 6 seconds with a fade + subtle scale animation. Shows slide indicators at the bottom and a scroll hint on the right.",
            "props": [],
            "customise": [
                ("Hero images", "Edit the <b>heroImages</b> array in <b>lib/photos.ts</b> — each entry has src, alt, and label."),
                ("Slide interval", "Change <b>setInterval(next, 6000)</b> — value is in milliseconds."),
                ("Main tagline", "Find <b>Capturing the moments that define your story</b> inside the h1 and edit."),
                ("Sub-tagline", "Find <b>Luxury event &amp; portrait photography across Birmingham and beyond</b>."),
                ("Overlay darkness", "Change <b>bg-black/35</b> on the overlay div — higher number = darker."),
            ],
        },
        {
            "name": "CategoryCard",
            "file": "components/CategoryCard.tsx",
            "desc": "A portrait-aspect image card with a title overlay and description below. Used in the home page category grid. Hover animates a zoom on the image.",
            "props": [
                ("title", "string", "Category name displayed over the image"),
                ("description", "string", "Short text shown below the image"),
                ("imageSrc", "string", "URL of the card image"),
                ("imageAlt", "string", "Alt text for accessibility"),
                ("href", "string", "Link destination when the card is clicked"),
                ("index", "number", "Used to stagger the fade-in animation delay"),
            ],
            "customise": [
                ("Aspect ratio", "Change <b>aspect-[3/4]</b> on the image wrapper div."),
                ("Hover zoom amount", "Change <b>group-hover:scale-105</b> on the Image."),
            ],
        },
        {
            "name": "PortfolioGallery",
            "file": "components/PortfolioGallery.tsx",
            "desc": "Fetches photos from /api/photos on mount. Renders a filterable masonry grid. Clicking a photo opens the Lightbox. Active filter is synced to the URL query string (?category=proposals).",
            "props": [],
            "customise": [
                ("Filter tabs", "Edit the <b>filters</b> array — add or rename categories (must match Category type in lib/photos.ts)."),
                ("Grid columns", "Change <b>columns-1 sm:columns-2 lg:columns-3</b> on the masonry div."),
                ("Gap between images", "Change <b>gap-4 md:gap-6</b> on the masonry div."),
            ],
        },
        {
            "name": "Lightbox",
            "file": "components/Lightbox.tsx",
            "desc": "Full-screen image overlay. Keyboard navigable — left/right arrows to navigate, Escape to close. Shows a counter (e.g. 3 / 16) and the image alt text as a caption.",
            "props": [
                ("photo", "Photo | null", "Currently displayed photo — null means lightbox is closed"),
                ("photos", "Photo[]", "The full filtered array used for prev/next navigation"),
                ("onClose", "() => void", "Called when the user closes the lightbox"),
                ("onPrev", "() => void", "Called to go to the previous image"),
                ("onNext", "() => void", "Called to go to the next image"),
            ],
            "customise": [
                ("Background opacity", "Change <b>bg-black/95</b> on the outer motion div."),
            ],
        },
        {
            "name": "CTASection",
            "file": "components/CTASection.tsx",
            "desc": "A reusable full-width call-to-action block with a heading, subheading, and two buttons. Supports a light (cream) and dark (slate) colour variant.",
            "props": [
                ("heading", "string", "Main headline text"),
                ("subheading", "string", "Supporting paragraph text"),
                ("primaryLabel", "string", "Text for the primary (solid) button"),
                ("primaryHref", "string", "Link for the primary button"),
                ("secondaryLabel", "string", "Text for the secondary (outlined) button"),
                ("secondaryHref", "string", "Link for the secondary button"),
                ("dark", "boolean", "true = slate background, false (default) = cream background"),
            ],
            "customise": [],
        },
        {
            "name": "ContactForm",
            "file": "components/ContactForm.tsx",
            "desc": "Controlled enquiry form. Reads ?service= from the URL to pre-select the session type. Shows a personalised thank-you message on submission (currently a simulated delay — connect to a real API or service like Resend for live emails).",
            "props": [],
            "customise": [
                ("Event type options", "Edit the <b>eventTypes</b> array at the top of the file."),
                ("Service pre-fill mapping", "Edit the <b>serviceMap</b> object — keys match the ?service= query param values."),
                ("Connect to real email", "Replace the <b>await new Promise(…)</b> mock delay with a fetch to an email API (e.g. Resend, EmailJS, Formspree)."),
            ],
        },
        {
            "name": "TestimonialSlider",
            "file": "components/TestimonialSlider.tsx",
            "desc": "Auto-manually-navigated quote carousel. Displays client testimonials with name and event label. Navigation via prev/next arrows and indicator dots.",
            "props": [],
            "customise": [
                ("Testimonials", "Edit the <b>testimonials</b> array — each entry has quote, name, and event."),
                ("Add more testimonials", "Append another object to the array — the dots will update automatically."),
            ],
        },
        {
            "name": "FadeIn",
            "file": "components/FadeIn.tsx",
            "desc": "Thin wrapper around Framer Motion's whileInView. Fades and slides content upward when it scrolls into the viewport. Used throughout all pages to animate sections.",
            "props": [
                ("children", "ReactNode", "Any content to animate"),
                ("delay", "number (optional)", "Seconds to delay the animation start — default 0"),
            ],
            "customise": [
                ("Animation distance", "Change <b>y: 20</b> in the initial prop — larger = more travel."),
                ("Duration", "Change <b>duration: 0.8</b> in the transition prop."),
                ("Viewport margin", 'Change <b>margin: "-60px"</b> — controls how early the animation triggers.'),
            ],
        },
        {
            "name": "ConditionalShell",
            "file": "components/ConditionalShell.tsx",
            "desc": "Reads the current pathname. On /admin routes: renders a dark wrapper with no nav or footer. On all other routes: renders Navigation, the page content, and Footer.",
            "props": [("children", "ReactNode", "The page content")],
            "customise": [
                ("Add more admin-style routes", "Add more conditions to the <b>isAdmin</b> check (e.g. pathname.startsWith('/dashboard'))."),
            ],
        },
    ]

    for comp in components:
        block = [
            p(comp["name"], "h2"),
            p(f"<font color='#A85232'>{comp['file']}</font>", "path"),
            p(comp["desc"], "body"),
        ]

        if comp.get("props"):
            block.append(p("<b>Props:</b>", "h4"))
            w = PAGE_W - 2 * MARGIN
            prop_data = [[p("<b>Prop</b>", "body"), p("<b>Type</b>", "body"), p("<b>Description</b>", "body")]]
            for pr in comp["props"]:
                prop_data.append([p(f"<font color='#A85232'>{pr[0]}</font>", "body"),
                                   p(f"<i>{pr[1]}</i>", "body"),
                                   p(pr[2], "body")])
            pt = Table(prop_data, colWidths=[w*0.22, w*0.22, w*0.56])
            pt.setStyle(TableStyle([
                ("BACKGROUND",(0,0),(-1,0), SLATE),
                ("TEXTCOLOR", (0,0),(-1,0), WHITE),
                ("GRID",      (0,0),(-1,-1), 0.4, BORDER),
                ("VALIGN",    (0,0),(-1,-1), "TOP"),
                ("LEFTPADDING",(0,0),(-1,-1),7),
                ("TOPPADDING",(0,0),(-1,-1),3),
                ("BOTTOMPADDING",(0,0),(-1,-1),3),
                ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT_GREY]),
            ]))
            block.append(pt)

        if comp.get("customise"):
            block.append(p("<b>How to customise:</b>", "h4"))
            for k, v in comp["customise"]:
                block.append(p(f"<b>{k}:</b>  {v}", "body"))

        block.append(hr(BORDER, 0.5, 8))
        story.append(KeepTogether(block[:4]))
        story += block[4:]

    story.append(PageBreak())

    # ── 4. Admin Portal ───────────────────────────────────────────────────────
    story += section_header("4. Admin Portal — Usage Guide",
                            "How to log in, manage photos, and change the password")

    story.append(p("<b>URL:</b>  <font color='#A85232'>localhost:3000/admin</font>  (or your domain/admin in production)", "body"))
    story.append(sp(4))

    story.append(p("Logging In", "h2"))
    story.append(p("The admin portal is protected by a password. The default password is <b>admin123</b>. "
                   "To change it, open <b>.env.local</b> in the project root and update the value:", "body"))
    story.append(code("ADMIN_PASSWORD=your_new_password_here"))
    story.append(p("Then restart the dev server (<b>npm run dev</b>). "
                   "On Vercel, set this as an Environment Variable in your project settings — you do not need .env.local in production.", "body"))
    story.append(sp(6))

    story.append(p("Dashboard Overview", "h2"))
    story.append(p("After logging in you will see:", "body"))
    for item in [
        "<b>Stat cards</b> — total photo count per category. Click any card to filter the grid.",
        "<b>Search bar</b> — filters photos by their description/alt text in real time.",
        "<b>Photo grid</b> — all gallery images. Click any photo to preview full-size. Hover to reveal the Remove button.",
        "<b>Add Photo panel</b> (right side / bottom on mobile) — two tabs: Upload File and Paste URL.",
        "<b>View Site ↗</b> button — opens the live portfolio in a new tab.",
        "<b>Sign Out</b> — clears the session from the browser.",
    ]:
        story.append(bullet(item))
    story.append(sp(6))

    story.append(p("Adding a Photo — Upload File", "h2"))
    story.append(p("1. Click the <b>Upload File</b> tab in the Add Photo panel.", "body"))
    story.append(p("2. Drag and drop an image onto the drop zone, or click it to open the file browser.", "body"))
    story.append(p("3. Fill in the <b>Description</b> (this becomes the image alt text — important for SEO).", "body"))
    story.append(p("4. Select a <b>Category</b> — Proposals, Graduations, Birthdays, or Studio.", "body"))
    story.append(p("5. Click <b>Add to Gallery</b>. The photo is saved to <b>public/uploads/</b> and added to <b>data/photos.json</b>.", "body"))
    story.append(sp(6))

    story.append(p("Adding a Photo — Paste URL", "h2"))
    story.append(p("Use this tab to add photos already hosted online (e.g. from Google Drive with a direct link, a CDN, or Unsplash).", "body"))
    story.append(p("1. Click the <b>Paste URL</b> tab.", "body"))
    story.append(p("2. Paste the full image URL — a small preview will appear below the input.", "body"))
    story.append(p("3. Fill in Description and Category, then click <b>Add to Gallery</b>.", "body"))
    story.append(sp(6))

    story.append(p("Removing a Photo", "h2"))
    story.append(p("Hover over any photo card and click <b>Remove</b>. A confirmation step appears — click <b>Confirm</b> to delete. "
                   "The photo is removed from <b>data/photos.json</b> and, if it was an uploaded file, deleted from <b>public/uploads/</b>.", "body"))
    story.append(sp(6))

    story.append(p("Important Note for Vercel Deployment", "h2"))
    story.append(p("Vercel's filesystem is read-only in production. This means:", "body"))
    for item in [
        "Uploaded files saved to <b>public/uploads/</b> will <b>not persist</b> between deployments.",
        "Changes to <b>data/photos.json</b> made via the admin portal <b>will not persist</b> after a redeploy.",
        "<b>Solution:</b> For production use, replace the file-based storage with Vercel Blob (for images) and Vercel KV or a database (for photo metadata). Contact a developer to set this up, or use the URL-tab method to link photos hosted on an external service (e.g. Cloudinary, Google Photos direct links).",
    ]:
        story.append(bullet(item))

    story.append(PageBreak())

    # ── 5. API Routes ─────────────────────────────────────────────────────────
    story += section_header("5. API Routes",
                            "All backend endpoints, their methods, and what they do")

    api_rows = [
        ["Endpoint", "Method", "Auth Required", "Description"],
        ["GET /api/photos", "GET", "No", "Returns the full list of photos from data/photos.json. Used by the portfolio gallery."],
        ["GET /api/admin/photos", "GET", "Yes", "Same as above but requires the x-admin-password header. Used by the admin portal to load photos."],
        ["POST /api/admin/photos", "POST", "Yes", "Adds a photo by URL. Body: { src, alt, category }. Returns the updated photo list."],
        ["DELETE /api/admin/photos/:id", "DELETE", "Yes", "Removes a photo by ID from data/photos.json. Also deletes the file from public/uploads/ if it exists."],
        ["POST /api/admin/upload", "POST", "Yes", "Multipart form upload. Fields: file (image), alt (string), category (string). Saves to public/uploads/ and adds to data/photos.json."],
    ]
    w = PAGE_W - 2 * MARGIN
    at = Table(
        [[p(f"<b>{c}</b>" if i == 0 else c, "body") for c in row] for i, row in enumerate(api_rows)],
        colWidths=[w*0.26, w*0.10, w*0.13, w*0.51]
    )
    at.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), SLATE),
        ("TEXTCOLOR", (0,0),(-1,0), WHITE),
        ("GRID",      (0,0),(-1,-1), 0.4, BORDER),
        ("VALIGN",    (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",(0,0),(-1,-1), 7),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT_GREY]),
    ]))
    story.append(at)
    story.append(sp(8))

    story.append(p("Authentication", "h2"))
    story.append(p("All <b>/api/admin/*</b> routes check for the header <b>x-admin-password</b>. "
                   "If the value does not match the <b>ADMIN_PASSWORD</b> environment variable (default: admin123), "
                   "the route returns HTTP 401 Unauthorized. This is handled in each route file:", "body"))
    story.append(code('const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";\n\nfunction authorized(req) {\n  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;\n}'))

    story.append(PageBreak())

    # ── 6. Data & Image Management ────────────────────────────────────────────
    story += section_header("6. Data & Image Management",
                            "How photos are stored, read, and written")

    story.append(p("lib/adminPhotos.ts — Server-Side File Helpers", "h2"))
    story.append(p("This file provides four functions used by the API routes to read and write photo data:", "body"))

    fns = [
        ("readPhotos()", "Returns Photo[]", "Reads data/photos.json from disk and parses it. Returns an empty array if the file doesn't exist or can't be parsed."),
        ("writePhotos(photos)", "Returns void", "Writes the given Photo[] to data/photos.json with 2-space indentation."),
        ("addPhoto(photo)", "Returns Photo[]", "Calls readPhotos(), appends the new photo, calls writePhotos(), and returns the updated array."),
        ("removePhoto(id)", "Returns Photo[]", "Filters out the photo with the matching ID, writes the result, and returns the updated array."),
    ]
    w = PAGE_W - 2 * MARGIN
    ft = Table(
        [[p(f"<b><font color='#A85232'>{f[0]}</font></b>", "body"), p(f"<i>{f[1]}</i>", "body"), p(f[2], "body")] for f in fns],
        colWidths=[w*0.26, w*0.18, w*0.56]
    )
    ft.setStyle(TableStyle([
        ("GRID",  (0,0),(-1,-1), 0.4, BORDER),
        ("VALIGN",(0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",(0,0),(-1,-1), 7),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, LIGHT_GREY]),
        ("BACKGROUND",(0,0),(0,-1), LIGHT_GREY),
    ]))
    story.append(ft)
    story.append(sp(8))

    story.append(p("data/photos.json — The Photo Store", "h2"))
    story.append(p("This JSON file is the single source of truth for all gallery images. "
                   "It is read by <b>/api/photos</b> (public) and <b>/api/admin/photos</b> (admin). "
                   "You can edit it directly in a text editor if needed, but the admin portal is the intended interface.", "body"))
    story.append(p("Each photo object follows this structure:", "body"))
    story.append(code('{\n  "id": "p1",               // Unique identifier\n  "src": "https://...",      // Full URL or /uploads/filename.jpg\n  "alt": "Description",      // Alt text + admin label\n  "category": "proposals",  // proposals | graduations | birthdays | studio\n  "width": 1200,             // Used by Next/Image for layout\n  "height": 800              // Used by Next/Image for layout\n}'))
    story.append(sp(8))

    story.append(p("lib/photos.ts — Shared Types", "h2"))
    story.append(p("Defines the <b>Photo</b> interface and <b>Category</b> type used throughout the codebase, "
                   "plus the <b>heroImages</b> array for the home page slideshow.", "body"))
    story.append(code('export type Category = "proposals" | "graduations" | "birthdays" | "studio";\n\nexport interface Photo {\n  id: string;\n  src: string;\n  alt: string;\n  category: Category;\n  width: number;\n  height: number;\n}'))
    story.append(p("To add a new category: add it to the <b>Category</b> type union, then add a matching entry to the "
                   "<b>filters</b> array in <b>components/PortfolioGallery.tsx</b>.", "body"))

    story.append(PageBreak())

    # ── 7. Design Tokens ──────────────────────────────────────────────────────
    story += section_header("7. Colours, Fonts & Design Tokens",
                            "The 'Faded Cinema' palette and typography system")

    story.append(p("Colour Palette", "h2"))
    colour_rows = [
        ["Name", "Hex", "Used for"],
        ["Cream (Background)", "#F5F1E8", "Page background, light section backgrounds"],
        ["Deep Slate (Text)", "#1C2A5A", "Headings, nav links, dark buttons, footer background"],
        ["Warm Umber (Accent 1)", "#624332", "Body text, muted labels"],
        ["Faded Rust (Accent 2)", "#A85232", "Category labels, hover states, admin accent colour"],
        ["Border", "#E2D9C8", "Dividers, table borders, input underlines"],
        ["Muted", "#B8A898", "Placeholder text, secondary labels"],
        ["Admin Dark", "#0f1117", "Admin portal background"],
    ]
    w = PAGE_W - 2 * MARGIN
    ct = Table(
        [[p(f"<b>{r[0]}</b>", "body"), p(f"<font color='#A85232'>{r[1]}</font>", "body"), p(r[2], "body")] for r in colour_rows],
        colWidths=[w*0.28, w*0.18, w*0.54]
    )
    ct.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), SLATE),
        ("TEXTCOLOR", (0,0),(-1,0), WHITE),
        ("GRID",      (0,0),(-1,-1), 0.4, BORDER),
        ("VALIGN",    (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",(0,0),(-1,-1), 8),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT_GREY]),
    ]))
    story.append(ct)
    story.append(sp(8))

    story.append(p("Updating a colour", "h3"))
    story.append(p("Colours are used as Tailwind arbitrary values throughout the components, e.g. <b>text-[#1C2A5A]</b>. "
                   "To change a colour site-wide, use Find & Replace in your code editor — search for the hex value and replace all.", "body"))
    story.append(p("The CSS variables in <b>app/globals.css</b> are defined for reference:", "body"))
    story.append(code(":root {\n  --background: #F5F1E8;\n  --foreground: #1C2A5A;\n  --umber:      #624332;\n  --rust:       #A85232;\n  --border:     #E2D9C8;\n  --muted:      #B8A898;\n}"))
    story.append(sp(8))

    story.append(p("Typography", "h2"))
    story.append(kv_table([
        ("Heading font", "Tenor Sans — loaded via next/font/google, variable: --font-tenor. Used on all h1, h2, h3 and display text."),
        ("Body / UI font", "Roboto — loaded via next/font/google, variable: --font-roboto. Used for labels, body copy, buttons, and form elements."),
        ("Usage in Tailwind", "font-[var(--font-tenor)] and font-[var(--font-roboto)] applied as class names."),
        ("Changing fonts", "Edit the font imports in app/layout.tsx — replace Tenor_Sans or Roboto with any Google Font, update the variable name, and do a find & replace on the CSS variable name across all files."),
    ]))

    story.append(PageBreak())

    # ── 8. Deployment ─────────────────────────────────────────────────────────
    story += section_header("8. Deployment to Vercel",
                            "How to go live and keep the site updated")

    story.append(p("First-time deployment", "h2"))
    for i, step in enumerate([
        "Push the project to a GitHub repository.",
        "Go to vercel.com and sign in (create a free account if needed).",
        "Click <b>New Project</b> → Import your GitHub repository.",
        "Vercel auto-detects Next.js — leave all settings as default.",
        "Add Environment Variable: Key = <b>ADMIN_PASSWORD</b>, Value = your chosen password.",
        "Click <b>Deploy</b>. Your site will be live in ~60 seconds.",
        "Optionally connect a custom domain in Project Settings → Domains.",
    ], 1):
        story.append(p(f"{i}. {step}", "body"))
    story.append(sp(6))

    story.append(p("Updating the site after changes", "h2"))
    story.append(p("Any <b>git push</b> to the main branch automatically triggers a new Vercel deployment. "
                   "Changes are live within about a minute.", "body"))
    story.append(code("git add .\ngit commit -m \"Your change description\"\ngit push"))
    story.append(sp(6))

    story.append(p("Running locally", "h2"))
    story.append(code("cd /Users/tmuchato/portfolio_2\nnpm run dev\n# Open http://localhost:3000"))
    story.append(sp(6))

    story.append(p("Build check (before deploying)", "h2"))
    story.append(code("npm run build\n# Must complete with no errors before pushing"))

    story.append(PageBreak())

    # ── 9. Common Edits Cheat Sheet ───────────────────────────────────────────
    story += section_header("9. Common Edits Cheat Sheet",
                            "Quick reference — where to go for the most frequent changes")

    cheat = [
        ["I want to…", "Go to…", "What to change"],
        ["Add a gallery photo", "/admin portal", "Use the Add Photo panel"],
        ["Remove a gallery photo", "/admin portal", "Hover photo → Remove → Confirm"],
        ["Change the admin password", ".env.local", "ADMIN_PASSWORD=newpassword"],
        ["Update my bio", "app/about/page.tsx", "The three <p> tags in the space-y-5 div"],
        ["Update prices", "app/services/page.tsx", "The 'from' field in each service object"],
        ["Add/edit a testimonial", "components/TestimonialSlider.tsx", "The testimonials array"],
        ["Change hero images", "lib/photos.ts", "The heroImages array"],
        ["Change hero tagline", "components/HeroSlideshow.tsx", "The h1 element"],
        ["Update email address", "app/contact/page.tsx + components/Footer.tsx", "Search for tehillahmuchato@gmail.com"],
        ["Update Instagram link", "app/contact/page.tsx + components/Footer.tsx", "Search for tillah.jpg"],
        ["Change service descriptions", "app/services/page.tsx", "description field in services array"],
        ["Add a new service", "app/services/page.tsx", "Add a new object to the services array"],
        ["Change nav links", "components/Navigation.tsx", "The links array at the top"],
        ["Change footer links", "components/Footer.tsx", "navLinks and socialLinks arrays"],
        ["Change the colour palette", "All component files", "Find & replace hex values e.g. #1C2A5A"],
        ["Change fonts", "app/layout.tsx", "Replace the Google Font imports and variable names"],
        ["Add a new page", "app/newpage/page.tsx", "Create the file — it becomes /newpage automatically"],
        ["Update SEO/meta title", "app/layout.tsx + each page.tsx", "The metadata export at the top of each file"],
        ["Change slide interval speed", "components/HeroSlideshow.tsx", "setInterval(next, 6000) — value in ms"],
    ]
    w = PAGE_W - 2 * MARGIN
    cht = Table(
        [[p(f"<b>{c}</b>", "body") for c in cheat[0]]] +
        [[p(r[0], "body"), p(f"<font color='#A85232'>{r[1]}</font>", "body"), p(r[2], "body")] for r in cheat[1:]],
        colWidths=[w*0.26, w*0.30, w*0.44]
    )
    cht.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), SLATE),
        ("TEXTCOLOR", (0,0),(-1,0), WHITE),
        ("GRID",      (0,0),(-1,-1), 0.4, BORDER),
        ("VALIGN",    (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",(0,0),(-1,-1), 7),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT_GREY]),
    ]))
    story.append(cht)
    story.append(sp(12))
    story.append(hr(SLATE, 1))
    story.append(sp(4))
    story.append(p("Documentation generated for Tehillah Photography · Birmingham, United Kingdom · tehillahmuchato@gmail.com", "note"))

    def on_first(canvas, doc):
        cover = CoverPage()
        cover.canv = canvas
        canvas.saveState()
        cover.draw()
        canvas.restoreState()

    doc.build(story, onFirstPage=on_first, onLaterPages=on_page)
    print(f"PDF saved to: {out}")

if __name__ == "__main__":
    build()
