from typing import Literal
from urllib.parse import urlparse
import ipaddress
import socket
from html_to_markdown import convert_to_markdown
import httpx
from bs4 import BeautifulSoup
from bs4.element import Tag as Bs4Tag  # type: ignore


class SSRFError(Exception):
    """Raised when a URL fails SSRF validation."""

    pass


def validate_url_for_ssrf(url: str) -> None:
    """
    Validates a URL to prevent SSRF attacks.
    Blocks requests to internal networks, localhost, and cloud metadata endpoints.
    """
    parsed = urlparse(url)

    # Only allow http/https schemes
    if parsed.scheme not in ("http", "https"):
        raise SSRFError(f"Invalid URL scheme: {parsed.scheme}. Only http/https allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFError("Invalid URL: no hostname found.")

    # Block localhost variations
    localhost_names = {"localhost", "localhost.localdomain", "127.0.0.1", "::1"}
    if hostname.lower() in localhost_names:
        raise SSRFError(f"Blocked request to localhost: {hostname}")

    # Resolve hostname to IP and check for internal addresses
    try:
        # Get all IP addresses for the hostname
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC)
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)

            # Block private/internal IPs
            if ip.is_private:
                raise SSRFError(f"Blocked request to private IP: {ip_str} ({hostname})")

            # Block loopback
            if ip.is_loopback:
                raise SSRFError(f"Blocked request to loopback IP: {ip_str} ({hostname})")

            # Block link-local (includes cloud metadata 169.254.x.x)
            if ip.is_link_local:
                raise SSRFError(f"Blocked request to link-local IP: {ip_str} ({hostname})")

            # Block reserved ranges
            if ip.is_reserved:
                raise SSRFError(f"Blocked request to reserved IP: {ip_str} ({hostname})")

    except socket.gaierror as e:
        raise SSRFError(f"Failed to resolve hostname: {hostname} ({e})")


def clean_html(html_content: str) -> str:
    """
    Cleans an HTML string by trying to extract the main content,
    removing unwanted elements and attributes.
    """
    if not html_content:
        return ""

    soup = BeautifulSoup(html_content, "lxml")

    content_selectors = [
        "article",
        "#article",
        ".article",
        "main",
        "#main",
        ".main",
        '[role="main"]',
        "#content",
        ".content",
        ".post",
    ]

    content = None
    for selector in content_selectors:
        selected = soup.select(selector)
        if len(selected) == 1:
            content = selected[0]
            break

    target = content if content else soup.body
    if not target:
        target = soup

    elements_to_remove = [
        "header",
        "footer",
        "nav",
        '[role="navigation"]',
        ".sidebar",
        '[role="complementary"]',
        ".nav",
        ".menu",
        ".header",
        ".footer",
        ".advertisement",
        ".ads",
        ".cookie-notice",
        ".social-share",
        ".related-posts",
        ".comments",
        "#comments",
        ".popup",
        ".modal",
        ".overlay",
        ".banner",
        ".alert",
        ".notification",
        ".subscription",
        ".newsletter",
        ".share-buttons",
        "script",
        "style",
        "noscript",
        "iframe",
        "button",
        "form",
        "input",
        "textarea",
        "select",
        ".noprint",
    ]

    for element in target.select(", ".join(elements_to_remove)):
        element.decompose()

    for html_element in target.find_all(True):
        if isinstance(html_element, Bs4Tag):
            html_element.attrs = {
                key: value
                for key, value in html_element.attrs.items()
                if not key.startswith("on")
                and not key.startswith("aria-")
                and not key.startswith("data-")
                and not key.startswith("role")
                and key not in ["style", "target", "src"]
            }
            # if "src" in html_element.attrs:
            #     src = html_element.attrs["src"]
            #     if isinstance(src, str) and src.startswith("data:"):
            #         html_element.attrs["src"] = "..."

    cleaned_html = target.decode_contents()

    # I'm not sure about this
    # cleaned_html = re.sub(r"[\t\r\n]+", " ", cleaned_html)
    # cleaned_html = re.sub(r"\s{2,}", " ", cleaned_html)
    cleaned_html = cleaned_html.strip()

    return cleaned_html


def html_to_markdown(html_content: str) -> str:
    cleaned_html_str = clean_html(html_content)
    return convert_to_markdown(cleaned_html_str).strip()


class Scraper:
    """A simple scraper to fetch and parse web content."""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    async def get_content(
        self,
        url: str,
        type: Literal["html", "markdown"] = "html",
        clean: bool = False,
        pretty: bool = False,
    ) -> str:
        """
        Fetches the content of a URL.
        Returns the HTML content as a string.
        """
        # Validate URL to prevent SSRF attacks
        validate_url_for_ssrf(url)

        cookies = {"ageVerified": "true"}
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=self.timeout, cookies=cookies)
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type:
                raise ValueError(f"Invalid content type: {content_type}")
            html = response.text
            if clean:
                html = clean_html(html)
            if type == "markdown":
                return html_to_markdown(html)

            if pretty and type == "html":
                html = BeautifulSoup(html, "lxml").prettify()
            return html.strip()
