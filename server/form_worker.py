import json
import os
import time
from urllib.request import Request, urlopen


def post(url, payload=None, headers=None):
    request_headers = {"Content-Type": "application/json", **(headers or {})}
    data = json.dumps(payload).encode() if payload is not None else None
    request = Request(url, data=data, headers=request_headers, method="POST")
    with urlopen(request, timeout=15) as response:
        return None if response.status == 204 else json.load(response)


def format_message(submission):
    identifier = submission["id"]
    if submission["action"] == "subscribe":
        return f"Запрос на подписку №{identifier}\nКонтакт: {submission['contact']}"
    return "\n".join((
        f"Новая заявка №{identifier}",
        f"От: {submission['name'] or 'Аноним'}",
        f"Связь: {submission['contact'] or 'Не указана'}",
        f"Тип: {submission['type']}",
        "Сообщение:",
        submission["message"],
    ))


def deliver_one(api, telegram_url, chat_id):
    submission = post(f"{api}/claim")
    if submission is None:
        return False

    identifier = submission["id"]
    try:
        result = post(telegram_url, {
            "chat_id": chat_id,
            "text": format_message(submission),
            "link_preview_options": {"is_disabled": True},
        })
        sent = isinstance(result, dict) and result.get("ok") is True
    except (OSError, ValueError):
        sent = False

    if not sent:
        print(f"Telegram: заявка №{identifier} ожидает повторной попытки.", flush=True)
    outcome = "sent" if sent else "retry"
    post(f"{api}/{outcome}/{identifier}", headers={"X-Claim-Token": submission["claimToken"]})
    return True


def main():
    api = os.environ.get("WORKER_API_URL", "http://127.0.0.1:3001").rstrip("/")
    interval = max(1, int(os.environ.get("POLL_INTERVAL_SECONDS", "15")))
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        print("Telegram не настроен. Заявки остаются в очереди.", flush=True)
        while True:
            time.sleep(interval)

    telegram_url = f"https://api.telegram.org/bot{token}/sendMessage"
    while True:
        try:
            if deliver_one(api, telegram_url, chat_id):
                continue
        except (OSError, ValueError):
            print("Очередь заявок временно недоступна.", flush=True)
        time.sleep(interval)


if __name__ == "__main__":
    main()
