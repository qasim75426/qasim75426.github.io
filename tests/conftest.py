import functools
import http.server
import socketserver
import threading
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@pytest.fixture(scope="session")
def base_url():
    handler = functools.partial(_Quiet, directory=str(ROOT))
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_address[1]}/"
    server.shutdown()


@pytest.fixture
def site(page, base_url):
    page.console_errors = []
    page.on("console", lambda m: m.type == "error" and page.console_errors.append(m.text))
    page.on("pageerror", lambda e: page.console_errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    return page
