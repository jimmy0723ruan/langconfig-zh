"""本地启动入口（推荐用这个，而不是 `python main.py`）。

相比直接跑 main.py，这里处理了三个会让本地开发卡住的问题：

1. **Windows 上 reload 会无限重启**：main.py 里 `reload=True`，reloader 会被自己
   产生的临时文件反复触发，服务起不来。这里固定 `reload=False`。
2. **psycopg 不接受 ProactorEventLoop**（LangGraph 检查点用到）：只设置事件循环
   策略不够，uvicorn 新版会自建循环。这里显式创建 SelectorEventLoop，并用
   `loop="none"` 告诉 uvicorn 不要接管。
3. **httpx 解析不了 NO_PROXY 里的 `[::1]`**（报 `InvalidURL: Invalid port: ':1]'`），
   会导致所有云模型连通性验证失败。这里在本进程内清掉这一项。

另外把后端默认限流从 60 次/分钟放宽到 300——SPA 首页并发请求较多，
60 次在生产无碍，在本地会频繁触发 429。

用法：
    cd backend
    python run_local.py            # 默认 127.0.0.1:8780
    LANGCONFIG_PORT=8790 python run_local.py
"""

import asyncio
import os
import pathlib
import sys

# 1) 清理 httpx 无法解析的 NO_PROXY 片段（只影响本进程）
_no_proxy = os.environ.get("NO_PROXY", "")
if "[::1]" in _no_proxy:
    _cleaned = ",".join(part for part in _no_proxy.split(",") if part.strip() != "[::1]")
    os.environ["NO_PROXY"] = _cleaned
    os.environ["no_proxy"] = _cleaned

# 2) 本地开发放宽限流
os.environ.setdefault("RATE_LIMIT_REQUESTS_PER_MINUTE", "300")

BACKEND_DIR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

import uvicorn  # noqa: E402

HOST = os.environ.get("LANGCONFIG_HOST", "127.0.0.1")
PORT = int(os.environ.get("LANGCONFIG_PORT", "8780"))


def main() -> None:
    config = uvicorn.Config(
        "main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        loop="none" if sys.platform == "win32" else "auto",
        reload=False,
    )
    server = uvicorn.Server(config)

    if sys.platform == "win32":
        loop = asyncio.SelectorEventLoop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(server.serve())
        finally:
            loop.close()
    else:
        asyncio.run(server.serve())


if __name__ == "__main__":
    main()
