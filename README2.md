# F95Physio
F95-Physiotherapy landing page website.

special notes:
These lines control how the browser renders the page.

theme-color: Sets the color of the browser's address bar (on mobile) to Google’s signature blue (#1a73e8).

charset="utf-8": Tells the browser to use the standard character encoding so that symbols and foreign languages display correctly.

X-UA-Compatible (IE=Edge): Tells old versions of Internet Explorer to use the most modern engine available.

viewport: Essential for Responsive Design. It ensures the website fits the width of your phone screen rather than showing a desktop-sized page zoomed out.


Before the page even downloads the fonts or images, these lines tell the browser to "start warming up" the connection to other servers.

preconnect: These lines (to gstatic.com, googleapis.com, etc.) tell the browser to establish a handshake with those servers immediately. This saves milliseconds later when the browser actually needs to fetch a font or script.

These tags (often starting with og: for Open Graph) control how the page looks when shared on Facebook, Twitter, or LinkedIn.

og:title & og:description: The headline and summary that appear in a shared link preview.

og:image: The specific thumbnail image (the blue Google logo) that appears when you text this link to someone.

canonical: Tells Google, "This is the official URL for this content," preventing duplicate content issues if the same page exists at different addresses.

alternate hreflang: A massive list telling search engines that this page is available in many languages (Arabic, Bengali, Chinese, etc.) and where to find those versions.

This is where the "look" of the page is imported.

Google Sans & Roboto: These are the fonts Google uses to give the site its clean, modern look.

app.css: The main stylesheet that contains all the layout rules.

shortcut icon & apple-touch-icon: The "favicons" that appear in your browser tab or when you save the site to your phone's home screen.




manifest.json: This allows the website to act like an app on a smartphone, enabling things like offline mode or an app icon.

ld+json: This is "Structured Data." It helps Google Search understand that this page is an Article, making it more likely to appear in "Top Stories" or rich search results.